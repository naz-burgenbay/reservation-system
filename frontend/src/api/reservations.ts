import apiClient from './client';
import type { Reservation, ReservationItem } from '../types';

export function getMyReservations(params?: { start?: string; end?: string }) {
  const url = '/reservations/my/';
  return apiClient.get<ReservationItem[]>(url, { params });
}

export function getReservation(id: string) {
  const url = `/reservations/${id}/`;
  return apiClient.get<Reservation>(url);
}

export function createReservation(data: { room: string; title: string; start_time: string; end_time: string }) {
  const url = '/reservations/create/';
  return apiClient.post<Reservation>(url, data);
}

export function updateReservation(id: string, data: { title?: string; start_time?: string; end_time?: string }) {
  const url = `/reservations/${id}/update/`;
  return apiClient.patch<Reservation>(url, data);
}

export function cancelReservation(id: string) {
  const url = `/reservations/${id}/cancel/`;
  return apiClient.post<void>(url);
}
