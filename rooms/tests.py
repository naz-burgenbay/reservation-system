from datetime import timedelta

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

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


class RoomAPITestCase(TestCase):

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            username='admin_user', email='admin@example.com', password='pass', role='admin'
        )
        self.building = Building.objects.create(name='HQ')
        self.room = Room.objects.create(
            building=self.building, name='Room A', capacity=10, is_active=True
        )
        token = RefreshToken.for_user(self.admin)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token.access_token}')
        self.now = timezone.now()

    def test_invalid_start_datetime_returns_400(self):
        url = f'/api/rooms/{self.room.id}/reservations/?start=not-a-date'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_invalid_end_datetime_returns_400(self):
        url = f'/api/rooms/{self.room.id}/reservations/?end=bad-value'
        response = self.client.get(url)
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)

    def test_cannot_deactivate_room_with_future_reservations(self):
        user = User.objects.create_user(
            username='reg_user', email='reg@example.com', password='pass', role='user'
        )
        Reservation.objects.create(
            user=user,
            room=self.room,
            title='Upcoming',
            start_time=self.now + timezone.timedelta(hours=1),
            end_time=self.now + timezone.timedelta(hours=2),
            status='active',
        )
        url = f'/api/rooms/{self.room.id}/update/'
        response = self.client.patch(url, {'is_active': False}, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn('error', response.data)