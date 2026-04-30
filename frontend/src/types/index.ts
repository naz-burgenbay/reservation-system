export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Building {
  id: string;
  name: string;
  address: string;
  created_at: string;
}

export interface Room {
  id: string;
  building: string;
  name: string;
  floor: number;
  capacity: number;
  is_active: boolean;
  created_at: string;
}

export interface Reservation {
  id: string;
  room: string;
  user: string;
  title: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface NestedBuilding {
  name: string;
  address: string;
}

export interface NestedRoom {
  id: string;
  name: string;
  floor: number;
  building: NestedBuilding;
}

export interface ReservationItem {
  id: string;
  room: NestedRoom;
  title: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'canceled';
}
