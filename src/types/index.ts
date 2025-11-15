export interface User {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	role: 'user' | 'admin';
	phone?: string;
	created_at?: string;
	updated_at?: string;
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
	room_name?: string;
	room_capacity?: number;
	user?: User;
	role?: 'owner' | 'invitee';
}

export interface Invitation {
	id: number;
	booking_id: number;
	user_id: number;
	status: 'pending' | 'accepted' | 'declined';
	display_status?: 'pending' | 'accepted' | 'declined' | 'expired';
	start_time?: string;
	invited_at: string;
	responded_at?: string | null;
	email?: string;
	first_name?: string;
	last_name?: string;
	booking?: Booking;
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
