import apiClient from './client';
import type { Reservation } from '../types';

export const getMyReservations = (params?: { start?: string; end?: string }) =>
  apiClient.get<Reservation[]>('/reservations/', { params });

export const getReservation = (id: string) =>
  apiClient.get<Reservation>(`/reservations/${id}/`);

export const createReservation = (data: { room: string; title: string; start_time: string; end_time: string }) =>
  apiClient.post<Reservation>('/reservations/create/', data);

export const updateReservation = (id: string, data: { title?: string; start_time?: string; end_time?: string }) =>
  apiClient.patch<Reservation>(`/reservations/${id}/update/`, data);

export const cancelReservation = (id: string) =>
  apiClient.post<void>(`/reservations/${id}/cancel/`);
