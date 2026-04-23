from django.core.exceptions import ValidationError
from django.utils import timezone

from .models import Reservation


def _validate_times(start_time, end_time):
    if start_time >= end_time:
        raise ValidationError("end_time must be after start_time.")
    if start_time < timezone.now():
        raise ValidationError("start_time must not be in the past.")


def _check_room_overlap(room, start_time, end_time, exclude_id=None):
    qs = Reservation.objects.filter(
        room=room,
        status='active',
        start_time__lt=end_time,
        end_time__gt=start_time,
    )
    if exclude_id is not None:
        qs = qs.exclude(pk=exclude_id)
    if qs.exists():
        raise ValidationError("The room is already reserved during this time.")


def create_reservation(user, room, title, start_time, end_time):
    if not title or not title.strip():
        raise ValidationError("title must not be blank.")
    if not room.is_active:
        raise ValidationError("The room is not available for reservations.")
    _validate_times(start_time, end_time)
    _check_room_overlap(room, start_time, end_time)
    return Reservation.objects.create(
        user=user,
        room=room,
        title=title,
        start_time=start_time,
        end_time=end_time,
        status='active',
    )


def get_user_reservations(user, start=None, end=None):
    qs = Reservation.objects.filter(user=user)
    if start is not None:
        qs = qs.filter(end_time__gte=start)
    if end is not None:
        qs = qs.filter(start_time__lte=end)
    return qs.order_by('start_time')


def update_reservation(reservation, title=None, start_time=None, end_time=None):
    if reservation.status == 'canceled':
        raise ValidationError("Cannot update a canceled reservation.")
    if title is not None:
        if not title.strip():
            raise ValidationError("title must not be blank.")
        reservation.title = title
    new_start = start_time if start_time is not None else reservation.start_time
    new_end = end_time if end_time is not None else reservation.end_time
    if start_time is not None or end_time is not None:
        _validate_times(new_start, new_end)
        _check_room_overlap(reservation.room, new_start, new_end, exclude_id=reservation.pk)
    reservation.start_time = new_start
    reservation.end_time = new_end
    reservation.save()
    return reservation


def cancel_reservation(reservation):
    if reservation.status == 'canceled':
        raise ValidationError("Reservation is already canceled.")
    reservation.status = 'canceled'
    reservation.save()
    return reservation

