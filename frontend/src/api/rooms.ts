import apiClient from './client';
import type { Building, Room, ReservationItem } from '../types';

export function getBuildings() {
  const url = '/rooms/buildings/';
  return apiClient.get<Building[]>(url);
}

export function getBuilding(id: string) {
  const url = `/rooms/buildings/${id}/`;
  return apiClient.get<Building>(url);
}

export function createBuilding(data: { name: string; address: string }) {
  const url = '/rooms/buildings/create/';
  return apiClient.post<Building>(url, data);
}

export function updateBuilding(id: string, data: { name?: string; address?: string }) {
  const url = `/rooms/buildings/${id}/update/`;
  return apiClient.patch<Building>(url, data);
}

export function deleteBuilding(id: string) {
  const url = `/rooms/buildings/${id}/delete/`;
  return apiClient.delete<void>(url);
}

export function getRooms() {
  const url = '/rooms/';
  return apiClient.get<Room[]>(url);
}

export function getRoom(id: string) {
  const url = `/rooms/${id}/`;
  return apiClient.get<Room>(url);
}

export function createRoom(data: { building: string; name: string; floor: number; capacity: number }) {
  const url = '/rooms/create-room/';
  return apiClient.post<Room>(url, data);
}

export function updateRoom(id: string, data: { name?: string; floor?: number; capacity?: number; is_active?: boolean }) {
  const url = `/rooms/${id}/update/`;
  return apiClient.patch<Room>(url, data);
}

export function deleteRoom(id: string) {
  const url = `/rooms/${id}/delete/`;
  return apiClient.delete<void>(url);
}

export function getBuildingRooms(buildingId: string) {
  const url = `/rooms/buildings/${buildingId}/rooms/`;
  return apiClient.get<Room[]>(url);
}

export function getRoomReservations(roomId: string, params?: { start?: string; end?: string }) {
  const url = `/rooms/${roomId}/reservations/`;
  return apiClient.get<ReservationItem[]>(url, { params });
}
