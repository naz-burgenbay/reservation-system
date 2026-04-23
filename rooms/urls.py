from django.urls import path

from . import views

urlpatterns = [
    path('', views.room_list, name='room-list'),
    path('<uuid:room_id>/reservations/', views.room_reservations, name='room-reservations'),
    path('create-room/', views.room_create, name='room-create'),
    path('create-building/', views.building_create, name='building-create'),
]
