import uuid

from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Building, Room


def create_building(name):
    if not name:
        raise ValidationError("name must not be blank.")
    if Building.objects.filter(name=name).exists():
        raise ValidationError("A building with this name already exists.")
    return Building.objects.create(
        id=uuid.uuid4(),
        name=name)

def create_room(building, name, capacity, is_active=True):
    if not name:
        raise ValidationError("name must not be blank.")
    if capacity <= 0:
        raise ValidationError("capacity must be a positive integer.")
    if Room.objects.filter(building=building, name=name).exists():
        raise ValidationError("A room with this name already exists in the building.")
    return Room.objects.create(
        id=uuid.uuid4(),
        building=building,
        name=name,
        capacity=capacity,
        is_active=is_active,
    )

def get_room_reservations(room, start=None, end=None):
    qs = room.reservation_set.filter(status='active')
    if start is not None:
        qs = qs.filter(end_time__gte=start)
    if end is not None:
        qs = qs.filter(start_time__lte=end)
    return qs.order_by('start_time')
