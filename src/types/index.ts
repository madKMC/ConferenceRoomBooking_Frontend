export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'admin';
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  floor: number;
  description?: string;
  amenities?: Amenity[];
}

export interface Amenity {
  id: number;
  name: string;
  description?: string;
}

export interface Booking {
  id: number;
  room_id: number;
  user_id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  room?: Room;
  user?: User;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}
