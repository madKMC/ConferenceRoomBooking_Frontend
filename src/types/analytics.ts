export interface RoomUtilization {
	room_id: number;
	room_name: string;
	total_booked_hours: number;
	total_available_hours: number;
	utilization_percentage: number;
}

export interface DailyBookingTrend {
	date: string;
	total_bookings: number;
	total_booked_hours: number;
}

export interface UserBookingSummary {
	user_id: number;
	total_bookings: number;
	total_canceled_bookings: number;
	total_booked_hours: number;
	first_booking_date: string | null;
	last_booking_date: string | null;
	rooms_used: RoomUsage[];
}

export interface RoomUsage {
	room_id: number;
	room_name: string;
	count: number;
}
