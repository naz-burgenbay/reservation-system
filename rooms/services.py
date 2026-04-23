from .models import Room


def get_room_reservations(room, start=None, end=None):
    qs = room.reservation_set.filter(status='active')
    if start is not None:
        qs = qs.filter(end_time__gte=start)
    if end is not None:
        qs = qs.filter(start_time__lte=end)
    return qs.order_by('start_time')
