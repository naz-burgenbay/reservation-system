from rest_framework import serializers

from .models import Building, Room


class CreateBuildingSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)

class CreateRoomSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    building_id = serializers.UUIDField()
    capacity = serializers.IntegerField()
    is_active = serializers.BooleanField(default=True)

class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
