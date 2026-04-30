import apiClient from './client';
import type { User } from '../types';

export const login = (username: string, password: string) =>
  apiClient.post<{ access: string; refresh: string }>('/users/login/', { username, password });

export const register = (username: string, email: string, password: string) =>
  apiClient.post<{ user: User; access: string; refresh: string }>('/users/register/', { username, email, password });

export const getMe = () =>
  apiClient.get<User>('/users/me/');
