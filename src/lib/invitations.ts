import api from './api';
import type { Invitation, ApiResponse, User, Booking } from '../types';

export const invitationsApi = {
	// Get all invitations for current user (from their bookings)
	getMyInvitations: async (): Promise<Invitation[]> => {
		const response = await api.get<ApiResponse<User>>('/auth/me');
		const userId = response.data.data.id;

		const bookingsResponse = await api.get(`/users/${userId}/bookings`);
		const bookings = bookingsResponse.data.data || [];

		// Filter bookings where user is an invitee
		const invitedBookings = bookings.filter(
			(b: Booking) => b.role === 'invitee'
		);

		// Get full invitation details for each booking
		const invitations = await Promise.all(
			invitedBookings.map(async (booking: Booking) => {
				try {
					// Get the booking details
					const bookingDetails = await api.get(`/bookings/${booking.id}`);

					// Get the invitees list to find the current user's invitation status
					const inviteesResponse = await api.get(
						`/bookings/${booking.id}/invitees`
					);
					const invitees = inviteesResponse.data.data || [];

					// Find current user's invitation record
					const userInvitation = invitees.find(
						(inv: Invitation) => inv.user_id === userId
					);

					if (userInvitation) {
						return {
							...userInvitation,
							booking: bookingDetails.data.data,
						};
					}

					return null;
				} catch {
					return null;
				}
			})
		);

		return invitations.filter((inv): inv is Invitation => inv !== null);
	},

	// Get invitees for a specific booking
	getBookingInvitees: async (bookingId: number): Promise<Invitation[]> => {
		const response = await api.get<ApiResponse<Invitation[]>>(
			`/bookings/${bookingId}/invitees`
		);
		return response.data.data;
	},

	// Add invitees to a booking
	addInvitees: async (
		bookingId: number,
		userIds: number[]
	): Promise<Invitation[]> => {
		const response = await api.post<ApiResponse<Invitation[]>>(
			`/bookings/${bookingId}/invitees`,
			{
				user_ids: userIds,
			}
		);
		return response.data.data;
	},

	// Remove invitee from a booking
	removeInvitee: async (bookingId: number, userId: number): Promise<void> => {
		await api.delete(`/bookings/${bookingId}/invitees/${userId}`);
	},

	// Respond to an invitation
	respondToInvitation: async (
		bookingId: number,
		status: 'accepted' | 'declined'
	): Promise<void> => {
		await api.patch(`/bookings/${bookingId}/invitation`, { status });
	},

	// Get all users (for inviting)
	getUsers: async (
		search?: string,
		limit = 50,
		offset = 0
	): Promise<User[]> => {
		const params: Record<string, string | number> = { limit, offset };
		// Only add search if it has a value
		if (search && search.trim()) {
			params.search = search.trim();
		}

		console.log('📤 REQUEST to /api/users');
		console.log('Parameters being sent:', JSON.stringify(params, null, 2));
		console.log(
			'Query string will be:',
			new URLSearchParams(params as Record<string, string>).toString()
		);

		const response = await api.get('/users', { params });

		console.log('✅ SUCCESS: Users fetched');
		console.log('Response data:', response.data);
		return response.data.data;
	},
};
