from django.core.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from users.permissions import IsAdminRole
from .models import Building, Room
from .serializers import (
    CreateBuildingSerializer,
    BuildingSerializer,
    UpdateBuildingSerializer,
    CreateRoomSerializer,
    RoomSerializer,
    UpdateRoomSerializer
)
from .services import (
    create_building,
    get_building_rooms,
    update_building,
    delete_building,
    create_room,
    get_room_reservations,
    update_room,
    delete_room
)
from reservations.serializers import ReservationSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminRole])
def building_create(request):
    serializer = CreateBuildingSerializer(data=request.data)
    if serializer.is_valid():
        try:
            building = create_building(
                name=serializer.validated_data['name']
            )
            return Response(BuildingSerializer(building).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'error': ', '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def building_rooms(request, building_id):
    try:
        building = Building.objects.get(id=building_id)
    except Building.DoesNotExist:
        return Response({'error': 'Building not found.'}, status=status.HTTP_404_NOT_FOUND)
    rooms = get_building_rooms(building)
    return Response(RoomSerializer(rooms, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def building_list(request):
    buildings = Building.objects.all().order_by('name')
    return Response(BuildingSerializer(buildings, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminRole])
def building_update(request, building_id):
    try:
        building = Building.objects.get(id=building_id)
    except Building.DoesNotExist:
        return Response({'error': 'Building not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = UpdateBuildingSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        updated = update_building(
            building,
            new_name=serializer.validated_data.get('name')
        )
        return Response(BuildingSerializer(updated).data)
    except ValidationError as e:
        return Response({'error': ', '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminRole])
def building_delete(request, building_id):
    try:
        building = Building.objects.get(id=building_id)
    except Building.DoesNotExist:
        return Response({'error': 'Building not found.'}, status=status.HTTP_404_NOT_FOUND)
    try:
        delete_building(building)
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ValidationError as e:
        return Response({'error': ', '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminRole])
def room_create(request):
    serializer = CreateRoomSerializer(data=request.data)
    if serializer.is_valid():
        try:
            building = Building.objects.get(id=serializer.validated_data['building'])
        except Building.DoesNotExist:
            return Response({'error': 'Building not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            room = create_room(
                building=building,
                name=serializer.validated_data['name'],
                capacity=serializer.validated_data['capacity'],
                is_active=serializer.validated_data['is_active']
            )
            return Response(RoomSerializer(room).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'error': ', '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def room_reservations(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
    start_str = request.query_params.get('start')
    end_str = request.query_params.get('end')
    start = None
    end = None
    if start_str:
        start = parse_datetime(start_str)
        if start is None:
            return Response({'error': 'Invalid start datetime.'}, status=status.HTTP_400_BAD_REQUEST)
    if end_str:
        end = parse_datetime(end_str)
        if end is None:
            return Response({'error': 'Invalid end datetime.'}, status=status.HTTP_400_BAD_REQUEST)
    reservations = get_room_reservations(room, start=start, end=end)
    return Response(ReservationSerializer(reservations, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def room_list(request):
    rooms = Room.objects.all().order_by('name')
    return Response(RoomSerializer(rooms, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated, IsAdminRole])
def room_update(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = UpdateRoomSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        updated = update_room(
            room,
            new_name=serializer.validated_data.get('name'),
            new_capacity=serializer.validated_data.get('capacity'),
            new_is_active=serializer.validated_data.get('is_active')
        )
        return Response(RoomSerializer(updated).data)
    except ValidationError as e:
        return Response({'error': ', '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminRole])
def room_delete(request, room_id):
    try:
        room = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
    try:
        delete_room(room)
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ValidationError as e:
        return Response({'error': ', '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def building_detail(request, building_id):
    building = get_object_or_404(Building, id=building_id)
    return Response(BuildingSerializer(building).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def room_detail(request, room_id):
    room = get_object_or_404(Room, id=room_id)
    return Response(RoomSerializer(room).data)