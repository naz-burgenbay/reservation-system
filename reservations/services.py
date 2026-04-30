from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from .models import Reservation

# Вспомогательные

def _validate_times(start_time, end_time):
    if start_time >= end_time:
        raise ValidationError("end_time must be after start_time.")


def _check_room_overlap(room, start_time, end_time, exclude_id=None):
    qs = Reservation.objects.select_for_update().filter(
        room=room,
        status='active',
        start_time__lt=end_time,
        end_time__gt=start_time,
    )
    if exclude_id is not None:
        qs = qs.exclude(pk=exclude_id)
    if qs.exists():
        raise ValidationError("The room is already reserved during this time.")

# Основные функции

@transaction.atomic
def create_reservation(user, room, title, start_time, end_time):
    if not title or not title.strip():
        raise ValidationError("title must not be blank.")
    if not room.is_active:
        raise ValidationError("The room is not available for reservations.")
    if start_time < timezone.now():
        raise ValidationError("start_time must not be in the past.")
    _validate_times(start_time, end_time)
    _check_room_overlap(room, start_time, end_time)
    return Reservation.objects.create(
        user=user,
        room=room,
        title=title.strip(),
        start_time=start_time,
        end_time=end_time,
        status='active',
    )


def get_user_reservations(user, start=None, end=None, active_only=False):
    qs = Reservation.objects.filter(user=user)
    if active_only:
        qs = qs.filter(status='active')
    if start is not None:
        qs = qs.filter(end_time__gte=start)
    if end is not None:
        qs = qs.filter(start_time__lte=end)
    return qs.order_by('start_time')


@transaction.atomic
def update_reservation(reservation, new_title=None, new_start_time=None, new_end_time=None):
    if reservation.status == 'canceled':
        raise ValidationError("Cannot update a canceled reservation.")
    if not reservation.room.is_active:
        raise ValidationError("The room is not available for reservations.")
    now = timezone.now()
    if reservation.start_time < now:
        # Reservation has already started, only end_time extension is allowed
        if new_title is not None or new_start_time is not None:
            raise ValidationError("Only end_time can be updated for a reservation that has already started.")
        if new_end_time is not None:
            _validate_times(reservation.start_time, new_end_time)
            _check_room_overlap(reservation.room, reservation.start_time, new_end_time, exclude_id=reservation.pk)
            reservation.end_time = new_end_time
            reservation.save()
        return reservation
    if new_title is not None:
        if not new_title.strip():
            raise ValidationError("title must not be blank.")
        reservation.title = new_title.strip()
    start_time = new_start_time if new_start_time is not None else reservation.start_time
    end_time = new_end_time if new_end_time is not None else reservation.end_time
    if new_start_time is not None or new_end_time is not None:
        _validate_times(start_time, end_time)
        _check_room_overlap(reservation.room, start_time, end_time, exclude_id=reservation.pk)
    reservation.start_time = start_time
    reservation.end_time = end_time
    reservation.save()
    return reservation


@transaction.atomic
def cancel_reservation(reservation):
    if reservation.status == 'canceled':
        raise ValidationError("Reservation is already canceled.")
    if reservation.start_time < timezone.now():
        raise ValidationError("Cannot cancel a reservation that has already started.")
    reservation.status = 'canceled'
    reservation.save()
    return reservation

