import uuid
from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Upper

class Building(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(Upper('name'), name='building_name_unique_ci'),
        ]
        indexes = [
            models.Index(fields=['name'], name='building_name_idx'),
        ]


class Room(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    capacity = models.IntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            UniqueConstraint(Upper('name'), 'building', name='room_name_building_unique_ci'),
        ]
        indexes = [
            models.Index(fields=['building', 'is_active'], name='room_building_active_idx'),
            models.Index(fields=['building', 'name'], name='room_building_name_idx'),
            models.Index(fields=['name'], name='room_name_idx'),
        ]