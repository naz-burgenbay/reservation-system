from django.core.exceptions import ValidationError
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Building, Room
from .serializers import CreateBuildingSerializer, CreateRoomSerializer, RoomSerializer
from .services import create_building, create_room, get_room_reservations
from reservations.serializers import ReservationSerializer


@api_view(['POST'])
def building_create(request):
    serializer = CreateBuildingSerializer(data=request.data)
    if serializer.is_valid():
        try:
            building = create_building(**serializer.validated_data)
            return Response({'id': building.id, 'name': building.name}, status=status.HTTP_201_CREATED)
        except ValidationError as DoesNotExist:
            return Response({'error': 'Building not found.'}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def room_create(request):
    serializer = CreateRoomSerializer(data=request.data)
    if serializer.is_valid():
        try:
            building_id = serializer.validated_data.pop('building_id')
            building = Building.objects.get(id=building_id)
            room = create_room(building=building, **serializer.validated_data)
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        except Building.DoesNotExist:
            return Response({'error': 'Building not found.'}, status=status.HTTP_404_NOT_FOUND)
        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)  

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
