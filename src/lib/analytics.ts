import api from './api';
import type { ApiResponse } from '../types';
import type {
	RoomUtilization,
	DailyBookingTrend,
	UserBookingSummary,
} from '../types/analytics';

export const analyticsApi = {
	// Get room utilization statistics
	getUtilization: async (
		startDate: string,
		endDate: string
	): Promise<RoomUtilization[]> => {
		const response = await api.get<ApiResponse<RoomUtilization[]>>(
			'/analytics/utilization',
			{
				params: { start: startDate, end: endDate },
			}
		);
		return response.data.data;
	},

	// Get daily booking trends
	getDailyBookings: async (
		startDate: string,
		endDate: string
	): Promise<DailyBookingTrend[]> => {
		const response = await api.get<ApiResponse<DailyBookingTrend[]>>(
			'/analytics/bookings/daily',
			{
				params: { start: startDate, end: endDate },
			}
		);
		return response.data.data;
	},

	// Get user booking history summary
	getUserSummary: async (
		userId: number,
		startDate?: string,
		endDate?: string
	): Promise<UserBookingSummary> => {
		const params: Record<string, string> = {};
		if (startDate && endDate) {
			params.start = startDate;
			params.end = endDate;
		}

		const response = await api.get<ApiResponse<UserBookingSummary>>(
			`/analytics/users/${userId}/summary`,
			{ params }
		);
		return response.data.data;
	},
};
