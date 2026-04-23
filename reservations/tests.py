from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from rooms.models import Building, Room

from .models import Reservation
from .services import (
    cancel_reservation,
    create_reservation,
    get_user_reservations,
    update_reservation,
)

User = get_user_model()


class ReservationServiceTestCase(TestCase):

    # Фиктивные данные для тестов

    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", password="pass", role="user"
        )
        self.building = Building.objects.create(name="KBM")
        self.room = Room.objects.create(
            building=self.building, name="Room A", capacity=10, is_active=True
        )
        self.now = timezone.now()
        self.start = self.now + timedelta(hours=1)
        self.end = self.now + timedelta(hours=2)

    # Вспомогательные

    def _make_reservation(self, start=None, end=None, room=None, user=None):
        return create_reservation(
            user=user or self.user,
            room=room or self.room,
            title="Team Sync",
            start_time=start or self.start,
            end_time=end or self.end,
        )

    # create_reservation (создание брони)

    def test_create_reservation_returns_reservation(self):
        # Успешно создаёт бронь со статусом active
        res = self._make_reservation()
        self.assertIsInstance(res, Reservation)
        self.assertEqual(res.status, "active")
        self.assertEqual(res.user, self.user)
        self.assertEqual(res.room, self.room)

    def test_create_reservation_blank_title_raises(self):
        # Заголовок из одних пробелов вызывает ошибку
        with self.assertRaises(ValidationError):
            create_reservation(self.user, self.room, "   ", self.start, self.end)

    def test_create_reservation_empty_title_raises(self):
        # Пустая строка в заголовке вызывает ошибку
        with self.assertRaises(ValidationError):
            create_reservation(self.user, self.room, "", self.start, self.end)

    def test_create_reservation_inactive_room_raises(self):
        # Бронирование неактивной комнаты вызывает ошибку
        self.room.is_active = False
        self.room.save()
        with self.assertRaises(ValidationError):
            self._make_reservation()

    def test_create_reservation_end_before_start_raises(self):
        # Время окончания раньше начала вызывает ошибку
        with self.assertRaises(ValidationError):
            create_reservation(
                self.user, self.room, "Meeting", self.end, self.start
            )

    def test_create_reservation_end_equal_start_raises(self):
        # Одинаковое время начала и окончания вызывает ошибку
        with self.assertRaises(ValidationError):
            create_reservation(
                self.user, self.room, "Meeting", self.start, self.start
            )

    def test_create_reservation_start_in_past_raises(self):
        # Время начала в прошлом вызывает ошибку
        past = self.now - timedelta(hours=1)
        with self.assertRaises(ValidationError):
            create_reservation(
                self.user, self.room, "Meeting", past, self.now + timedelta(hours=1)
            )

    def test_create_reservation_overlap_raises(self):
        # Перекрывающийся интервал вызывает ошибку
        self._make_reservation()
        with self.assertRaises(ValidationError):
            create_reservation(
                self.user,
                self.room,
                "Overlap",
                self.start + timedelta(minutes=15),
                self.end + timedelta(minutes=15),
            )

    def test_create_reservation_adjacent_does_not_raise(self):
        # Начинается ровно когда заканчивается первая без пересечения
        self._make_reservation()
        res = create_reservation(
            self.user,
            self.room,
            "Back to Back",
            self.end,
            self.end + timedelta(hours=1),
        )
        self.assertEqual(res.status, "active")

    def test_create_reservation_different_room_same_time_does_not_raise(self):
        # Разные комнаты в то же время не конфликтуют
        other_room = Room.objects.create(
            building=self.building, name="Room B", capacity=5, is_active=True
        )
        self._make_reservation()
        res = self._make_reservation(room=other_room)
        self.assertEqual(res.status, "active")

    # get_user_reservations (получение броней пользователя)

    def test_get_user_reservations_returns_own_reservations(self):
        # Возвращает только брони текущего пользователя
        self._make_reservation()
        other_user = User.objects.create_user(
            username="other", password="pass", role="user"
        )
        other_room = Room.objects.create(
            building=self.building, name="Room C", capacity=5, is_active=True
        )
        create_reservation(
            other_user, other_room, "Other", self.start, self.end,
        )
        qs = get_user_reservations(self.user)
        self.assertEqual(qs.count(), 1)
        self.assertEqual(qs.first().user, self.user)

    def test_get_user_reservations_ordered_by_start_time(self):
        # Брони упорядочены по времени начала
        later_start = self.start + timedelta(hours=3)
        later_end = self.end + timedelta(hours=3)
        other_room = Room.objects.create(
            building=self.building, name="Room D", capacity=5, is_active=True
        )
        self._make_reservation()
        self._make_reservation(start=later_start, end=later_end, room=other_room)
        qs = get_user_reservations(self.user)
        self.assertLess(qs[0].start_time, qs[1].start_time)

    def test_get_user_reservations_filter_by_start(self):
        # Окно фильтра начинается после окончания брони (должно вернуть пусто)
        self._make_reservation()
        qs = get_user_reservations(self.user, start=self.end + timedelta(seconds=1))
        self.assertEqual(qs.count(), 0)

    def test_get_user_reservations_filter_by_start_includes_overlapping(self):
        # Бронь, заканчивающаяся после начала окна фильтра, включается
        self._make_reservation()
        qs = get_user_reservations(self.user, start=self.start + timedelta(minutes=30))
        self.assertEqual(qs.count(), 1)

    def test_get_user_reservations_filter_by_end(self):
        # Окно фильтра заканчивается до начала брони (должно вернуть пусто)
        self._make_reservation()
        qs = get_user_reservations(self.user, end=self.start - timedelta(seconds=1))
        self.assertEqual(qs.count(), 0)

    def test_get_user_reservations_filter_by_end_includes_overlapping(self):
        # Бронь, начинающаяся до конца окна фильтра, включается
        self._make_reservation()
        qs = get_user_reservations(self.user, end=self.start + timedelta(minutes=30))
        self.assertEqual(qs.count(), 1)

    # update_reservation (обновление брони)

    def test_update_reservation_title(self):
        # Заголовок успешно обновляется
        res = self._make_reservation()
        updated = update_reservation(res, title="New Title")
        self.assertEqual(updated.title, "New Title")

    def test_update_reservation_times(self):
        # Время начала и окончания успешно обновляется
        res = self._make_reservation()
        new_start = self.start + timedelta(hours=3)
        new_end = self.end + timedelta(hours=3)
        updated = update_reservation(res, start_time=new_start, end_time=new_end)
        self.assertEqual(updated.start_time, new_start)
        self.assertEqual(updated.end_time, new_end)

    def test_update_reservation_persisted(self):
        # Изменения сохраняются в базе данных
        res = self._make_reservation()
        update_reservation(res, title="Persisted Title")
        self.assertEqual(Reservation.objects.get(pk=res.pk).title, "Persisted Title")

    def test_update_reservation_blank_title_raises(self):
        # Пустой заголовок при обновлении вызывает ошибку
        res = self._make_reservation()
        with self.assertRaises(ValidationError):
            update_reservation(res, title="  ")

    def test_update_reservation_canceled_raises(self):
        # Обновление отменённой брони вызывает ошибку
        res = self._make_reservation()
        cancel_reservation(res)
        with self.assertRaises(ValidationError):
            update_reservation(res, title="Should Fail")

    def test_update_reservation_overlap_raises(self):
        other_room = Room.objects.create(
            building=self.building, name="Room E", capacity=5, is_active=True
        )
        # Обе брони в other_room, но блокирующая занимает более поздний слот
        create_reservation(
            self.user,
            other_room,
            "Blocker",
            self.start + timedelta(hours=3),
            self.end + timedelta(hours=3),
        )
        res = self._make_reservation(room=other_room)
        # Перемещаем res в уже занятый слот other_room (должно выбросить исключение)
        with self.assertRaises(ValidationError):
            update_reservation(
                res,
                start_time=self.start + timedelta(hours=3),
                end_time=self.end + timedelta(hours=3),
            )

    def test_update_reservation_no_overlap_with_self(self):
        res = self._make_reservation()
        # Обновляем только заголовок - время не меняется, пересечение с собой не должно срабатывать
        updated = update_reservation(res, title="Same Time, New Name")
        self.assertEqual(updated.title, "Same Time, New Name")

    # cancel_reservation (отмена брони)

    def test_cancel_reservation_sets_status(self):
        # Статус брони меняется на «canceled»
        res = self._make_reservation()
        canceled = cancel_reservation(res)
        self.assertEqual(canceled.status, "canceled")

    def test_cancel_reservation_persisted(self):
        # Изменение статуса сохраняется в базе данных
        res = self._make_reservation()
        cancel_reservation(res)
        self.assertEqual(Reservation.objects.get(pk=res.pk).status, "canceled")

    def test_cancel_already_canceled_raises(self):
        # Повторная отмена уже отменённой брони вызывает ошибку
        res = self._make_reservation()
        cancel_reservation(res)
        with self.assertRaises(ValidationError):
            cancel_reservation(res)
