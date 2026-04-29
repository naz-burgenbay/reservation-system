from django.urls import path

from . import views

urlpatterns = [
    path('', views.room_list, name='room-list'),
    path('<uuid:room_id>/reservations/', views.room_reservations, name='room-reservations'),
    path('<uuid:room_id>/update/', views.room_update, name='room-update'),
    path('<uuid:room_id>/delete/', views.room_delete, name='room-delete'),
    path('create-room/', views.room_create, name='room-create'),
    path('buildings/', views.building_list, name='building-list'),
    path('buildings/create/', views.building_create, name='building-create'),
    path('buildings/<uuid:building_id>/', views.building_rooms, name='building-rooms'),
    path('buildings/<uuid:building_id>/update/', views.building_update, name='building-update'),
    path('buildings/<uuid:building_id>/delete/', views.building_delete, name='building-delete'),
]
