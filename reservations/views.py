from django.core.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rooms.models import Room
from users.permissions import IsAdminRole
from .models import Reservation
from .serializers import CreateReservationSerializer, UpdateReservationSerializer, ReservationSerializer
from .services import (
    create_reservation,
    get_user_reservations,
    update_reservation,
    cancel_reservation,
)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reservation_create(request):
    serializer = CreateReservationSerializer(data=request.data)
    if serializer.is_valid():
        try:
            room = Room.objects.get(id=serializer.validated_data['room'])
        except Room.DoesNotExist:
            return Response({'error': 'Room not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            reservation = create_reservation(
                user=request.user,
                room=room,
                title=serializer.validated_data['title'],
                start_time=serializer.validated_data['start_time'],
                end_time=serializer.validated_data['end_time'],
            )
            return Response(ReservationSerializer(reservation).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            return Response({'error': ', '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reservation_list(request):
    start = request.query_params.get('start')
    end = request.query_params.get('end')
    reservations = get_user_reservations(request.user, start=start, end=end)
    return Response(ReservationSerializer(reservations, many=True).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def reservation_update(request, reservation_id):
    try:
        reservation = Reservation.objects.get(id=reservation_id, user=request.user)
    except Reservation.DoesNotExist:
        return Response({'error': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = UpdateReservationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    try:
        updated = update_reservation(
            reservation,
            new_title=serializer.validated_data.get('title'),
            new_start_time=serializer.validated_data.get('start_time'),
            new_end_time=serializer.validated_data.get('end_time'),
        )
        return Response(ReservationSerializer(updated).data)
    except ValidationError as e:
        return Response({'error': ', '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reservation_cancel(request, reservation_id):
    try:
        if request.user.role == 'admin':
            reservation = Reservation.objects.get(id=reservation_id)
        else:
            reservation = Reservation.objects.get(id=reservation_id, user=request.user)
    except Reservation.DoesNotExist:
        return Response({'error': 'Reservation not found.'}, status=status.HTTP_404_NOT_FOUND)
    try:
        cancel_reservation(reservation)
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ValidationError as e:
        return Response({'error': ', '.join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)