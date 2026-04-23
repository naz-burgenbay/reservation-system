from rest_framework import serializers

from .models import Reservation

class CreateReservationSerializer(serializers.Serializer):
    room = serializers.UUIDField()
    start_time = serializers.DateTimeField()
    end_time = serializers.DateTimeField()
    title = serializers.CharField(max_length=255)

class UpdateReservationSerializer(serializers.Serializer):
    start_time = serializers.DateTimeField(required=False)
    end_time = serializers.DateTimeField(required=False)
    title = serializers.CharField(max_length=255, required=False)

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'