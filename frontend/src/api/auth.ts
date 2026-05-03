import apiClient from './client';
import type { User } from '../types';

export function login(username: string, password: string) {
  const url = '/users/login/';
  return apiClient.post<{ access: string; refresh: string }>(url, { username, password });
}

export function register(username: string, email: string, password: string) {
  const url = '/users/register/';
  return apiClient.post<{ user: User; access: string; refresh: string }>(url, { username, email, password });
}

export function getMe() {
  const url = '/users/me/';
  return apiClient.get<User>(url);
}
