from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from .models import Building, Room
from reservations.models import Reservation

@transaction.atomic
def create_building(name):
    if not name or not name.strip():
        raise ValidationError("name must not be blank.")
    name = name.strip()
    if Building.objects.filter(name__iexact=name).exists():
        raise ValidationError("A building with this name already exists.")
    return Building.objects.create(name=name)

def get_building_rooms(building):
    return Room.objects.filter(building=building).order_by('name')

@transaction.atomic
def update_building(building, new_name=None):
    if new_name is not None:
        if not new_name.strip():
            raise ValidationError("name must not be blank.")
        new_name = new_name.strip()
        if Building.objects.filter(name__iexact=new_name).exclude(pk=building.pk).exists():
            raise ValidationError("A building with this name already exists.")
        building.name = new_name
        building.save()
    return building

def delete_building(building):
    building.delete()

@transaction.atomic
def create_room(building, name, capacity, is_active=True):
    if not name or not name.strip():
        raise ValidationError("name must not be blank.")
    if capacity <= 0:
        raise ValidationError("capacity must be a positive integer.")
    name = name.strip()
    if Room.objects.filter(building=building, name__iexact=name).exists():
        raise ValidationError("A room with this name already exists in the building.")
    return Room.objects.create(
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

@transaction.atomic
def update_room(room, new_name=None, new_capacity=None, new_is_active=None):
    if new_name is not None:
        if not new_name.strip():
            raise ValidationError("name must not be blank.")
        new_name = new_name.strip()
        if Room.objects.filter(building=room.building, name__iexact=new_name).exclude(pk=room.pk).exists():
            raise ValidationError("A room with this name already exists in the building.")
        room.name = new_name
    if new_capacity is not None:
        if new_capacity <= 0:
            raise ValidationError("capacity must be a positive integer.")
        room.capacity = new_capacity
    if new_is_active is not None:
        if not new_is_active and room.is_active:
            has_future = Reservation.objects.filter(
                room=room,
                status='active',
                end_time__gt=timezone.now(),
            ).exists()
            if has_future:
                raise ValidationError(
                    "Cannot deactivate a room with future active reservations."
                )
        room.is_active = new_is_active
    room.save()
    return room

def delete_room(room):
    room.delete()