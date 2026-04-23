from django.urls import path

from . import views

urlpatterns = [
    path('', views.room_list, name='room-list'),
    path('<uuid:room_id>/reservations/', views.room_reservations, name='room-reservations'),
]
