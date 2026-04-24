import uuid

from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Building, Room
from reservations.models import Reservation

def create_building(name):
    if not name:
        raise ValidationError("name must not be blank.")
    if Building.objects.filter(name=name).exists():
        raise ValidationError("A building with this name already exists.")
    return Building.objects.create(
        id=uuid.uuid4(),
        name=name)

def get_building_rooms(building):
    return Room.objects.filter(building=building).order_by('name')

def update_building(building, new_name=None):
    if new_name is not None:
        if not new_name.strip():
            raise ValidationError("name must not be blank.")
        if Building.objects.filter(name=new_name).exclude(pk=building.pk).exists():
            raise ValidationError("A building with this name already exists.")
        building.name = new_name
        building.save()
    return building

def delete_building(building):
    building.delete()

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
    qs = Reservation.objects.filter(room=room, status='active')
    if start is not None:
        qs = qs.filter(end_time__gte=start)
    if end is not None:
        qs = qs.filter(start_time__lte=end)
    return qs.order_by('start_time')

def update_room(room, new_name=None, new_capacity=None, new_is_active=None):
    if new_name is not None:
        if not new_name.strip():
            raise ValidationError("name must not be blank.")
        if Room.objects.filter(building=room.building, name=new_name).exclude(pk=room.pk).exists():
            raise ValidationError("A room with this name already exists in the building.")
        room.name = new_name
    if new_capacity is not None:
        if new_capacity <= 0:
            raise ValidationError("capacity must be a positive integer.")
        room.capacity = new_capacity
    if new_is_active is not None:
        room.is_active = new_is_active
    room.save()
    return room

def delete_room(room):
    room.delete()