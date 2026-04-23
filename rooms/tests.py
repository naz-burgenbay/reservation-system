from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone

from reservations.models import Reservation

from .models import Building, Room
from .services import get_room_reservations

User = get_user_model()


class RoomServiceTestCase(TestCase):

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

    def _make_reservation(self, room=None, start=None, end=None, status="active"):
        return Reservation.objects.create(
            user=self.user,
            room=room or self.room,
            title="Meeting",
            start_time=start or self.start,
            end_time=end or self.end,
            status=status,
        )

    # get_room_reservations (получение броней комнаты)

    def test_returns_active_reservations(self):
        # Возвращает только активные брони комнаты
        self._make_reservation()
        qs = get_room_reservations(self.room)
        self.assertEqual(qs.count(), 1)

    def test_excludes_canceled_reservations(self):
        # Отменённые брони не включаются в результат
        self._make_reservation(status="canceled")
        qs = get_room_reservations(self.room)
        self.assertEqual(qs.count(), 0)

    def test_excludes_other_room_reservations(self):
        # Брони других комнат не включаются в результат
        other_room = Room.objects.create(
            building=self.building, name="Room B", capacity=5, is_active=True
        )
        self._make_reservation(room=other_room)
        qs = get_room_reservations(self.room)
        self.assertEqual(qs.count(), 0)

    def test_ordered_by_start_time(self):
        # Результаты упорядочены по времени начала
        later_start = self.start + timedelta(hours=3)
        later_end = self.end + timedelta(hours=3)
        self._make_reservation()
        self._make_reservation(start=later_start, end=later_end)
        qs = get_room_reservations(self.room)
        self.assertEqual(qs.count(), 2)
        self.assertLess(qs[0].start_time, qs[1].start_time)

    def test_filter_by_start(self):
        # Окно фильтра начинается после окончания брони (должно вернуть пусто)
        self._make_reservation()
        qs = get_room_reservations(self.room, start=self.end + timedelta(seconds=1))
        self.assertEqual(qs.count(), 0)

    def test_filter_by_start_includes_overlapping(self):
        # Бронь, заканчивающаяся после начала окна фильтра, включается
        self._make_reservation()
        qs = get_room_reservations(self.room, start=self.start + timedelta(minutes=30))
        self.assertEqual(qs.count(), 1)

    def test_filter_by_end(self):
        # Окно фильтра заканчивается до начала брони (должно вернуть пусто)
        self._make_reservation()
        qs = get_room_reservations(self.room, end=self.start - timedelta(seconds=1))
        self.assertEqual(qs.count(), 0)

    def test_filter_by_end_includes_overlapping(self):
        # Бронь, начинающаяся до конца окна фильтра, включается
        self._make_reservation()
        qs = get_room_reservations(self.room, end=self.start + timedelta(minutes=30))
        self.assertEqual(qs.count(), 1)

    def test_filter_by_start_and_end(self):
        # Комбинированный фильтр возвращает перекрывающиеся брони
        self._make_reservation()
        qs = get_room_reservations(
            self.room,
            start=self.start + timedelta(minutes=15),
            end=self.end - timedelta(minutes=15),
        )
        self.assertEqual(qs.count(), 1)

    def test_empty_room_returns_empty(self):
        # Комната без броней возвращает пустой результат
        qs = get_room_reservations(self.room)
        self.assertEqual(qs.count(), 0)