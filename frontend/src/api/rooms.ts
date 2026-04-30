import apiClient from './client';
import type { Building, Room, Reservation } from '../types';

export const getBuildings = () =>
  apiClient.get<Building[]>('/rooms/buildings/');

export const getBuilding = (id: string) =>
  apiClient.get<Building>(`/rooms/buildings/${id}/`);

export const createBuilding = (data: { name: string }) =>
  apiClient.post<Building>('/rooms/buildings/create/', data);

export const updateBuilding = (id: string, data: { name: string }) =>
  apiClient.patch<Building>(`/rooms/buildings/${id}/update/`, data);

export const deleteBuilding = (id: string) =>
  apiClient.delete<void>(`/rooms/buildings/${id}/delete/`);

export const getRooms = () =>
  apiClient.get<Room[]>('/rooms/');

export const getRoom = (id: string) =>
  apiClient.get<Room>(`/rooms/${id}/`);

export const createRoom = (data: { building: string; name: string; capacity: number }) =>
  apiClient.post<Room>('/rooms/create-room/', data);

export const updateRoom = (id: string, data: { name?: string; capacity?: number; is_active?: boolean }) =>
  apiClient.patch<Room>(`/rooms/${id}/update/`, data);

export const deleteRoom = (id: string) =>
  apiClient.delete<void>(`/rooms/${id}/delete/`);

export const getBuildingRooms = (buildingId: string) =>
  apiClient.get<Room[]>(`/rooms/buildings/${buildingId}/rooms/`);

export const getRoomReservations = (roomId: string, params?: { start?: string; end?: string }) =>
  apiClient.get<Reservation[]>(`/rooms/${roomId}/reservations/`, { params });
