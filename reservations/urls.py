from django.urls import path

from . import views

urlpatterns = [
    path('', views.reservation_list, name='reservation-list'),
    path('create/', views.reservation_create, name='reservation-create'),
    path('<uuid:reservation_id>/', views.reservation_detail, name='reservation-detail'),
    path('<uuid:reservation_id>/update/', views.reservation_update, name='reservation-update'),
    path('<uuid:reservation_id>/cancel/', views.reservation_cancel, name='reservation-cancel'),
]
