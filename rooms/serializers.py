from rest_framework import serializers

from .models import Building, Room

class CreateBuildingSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)

class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = '__all__'

class UpdateBuildingSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)

    def validate(self, data):
        if not data:
            raise serializers.ValidationError("At least one field must be provided.")
        return data


class CreateRoomSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    building = serializers.UUIDField()
    capacity = serializers.IntegerField(min_value=1)
    is_active = serializers.BooleanField(default=True)

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class UpdateRoomSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=False)
    capacity = serializers.IntegerField(min_value=1, required=False)
    is_active = serializers.BooleanField(required=False)

    def validate(self, data):
        if not data:
            raise serializers.ValidationError("At least one field must be provided.")
        return data
