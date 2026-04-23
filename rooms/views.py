from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Room
from .serializers import RoomSerializer
from .services import get_room_reservations
from reservations.serializers import ReservationSerializer


@api_view(['GET'])
def room_list(request):
    rooms = Room.objects.all().order_by('name')
    return Response(RoomSerializer(rooms, many=True).data)


@api_view(['GET'])
def room_reservations(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
    start = request.query_params.get('start')
    end = request.query_params.get('end')
    reservations = get_room_reservations(room, start=start, end=end)
    return Response(ReservationSerializer(reservations, many=True).data)
