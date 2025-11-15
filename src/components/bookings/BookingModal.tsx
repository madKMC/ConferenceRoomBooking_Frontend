import { useState, useEffect, type FormEvent } from 'react';
import { X, UserPlus, XCircle, AlertCircle, Clock } from 'lucide-react';
import api from '../../lib/api';
import { invitationsApi } from '../../lib/invitations';
import type { Room, Booking, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface BookingModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	booking?: Booking | null;
}

const BookingModal = ({
	isOpen,
	onClose,
	onSuccess,
	booking,
}: BookingModalProps) => {
	const { user } = useAuth();
	const [rooms, setRooms] = useState<Room[]>([]);
	const [users, setUsers] = useState<User[]>([]);
	const [selectedInvitees, setSelectedInvitees] = useState<number[]>([]);
	const [existingInvitees, setExistingInvitees] = useState<number[]>([]);
	const [userSearch, setUserSearch] = useState('');
	const [existingBookings, setExistingBookings] = useState<Booking[]>([]);
	const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
	const [formData, setFormData] = useState({
		room_id: '',
		title: '',
		description: '',
		date: '',
		start_time: '',
		end_time: '',
	});
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen) {
			fetchRooms();
			fetchUsers();
			if (booking) {
				const start = new Date(booking.start_time);
				const end = new Date(booking.end_time);
				setFormData({
					room_id: booking.room_id.toString(),
					title: booking.title,
					description: booking.description || '',
					date: start.toISOString().split('T')[0],
					start_time: start.toTimeString().slice(0, 5),
					end_time: end.toTimeString().slice(0, 5),
				});
				fetchExistingInvitees(booking.id);
			} else {
				setFormData({
					room_id: '',
					title: '',
					description: '',
					date: '',
					start_time: '09:00',
					end_time: '10:00',
				});
				setSelectedInvitees([]);
				setExistingInvitees([]);
			}
			setError('');
			setUserSearch('');
		}
	}, [isOpen, booking]);

	const fetchRooms = async () => {
		try {
			const response = await api.get('/rooms');
			setRooms(response.data.data || []);
		} catch (err) {
			console.error('Error fetching rooms:', err);
		}
	};

	const fetchUsers = async () => {
		try {
			// Fetch all users for invitation dropdown
			const allUsers = await invitationsApi.getUsers(undefined, 100, 0);
			// Filter out the current user from the list
			setUsers(allUsers.filter((u) => u.id !== user?.id));
		} catch (err: any) {
			console.error('❌ Failed to load users for invitations');
			console.error('Error details:', err.response?.data);
			console.error('Status:', err.response?.status);
			console.error('Full error:', err);
			// Set empty array so the booking can still be created without invites
			setUsers([]);
		}
	};

	const fetchExistingInvitees = async (bookingId: number) => {
		try {
			const invitees = await invitationsApi.getBookingInvitees(bookingId);
			const inviteeIds = invitees.map((inv) => inv.user_id);
			setExistingInvitees(inviteeIds);
			setSelectedInvitees(inviteeIds);
		} catch (err) {
			console.error('Error fetching existing invitees:', err);
			setExistingInvitees([]);
			setSelectedInvitees([]);
		}
	};

	const fetchRoomBookings = async (roomId: string, date: string) => {
		if (!roomId || !date) {
			setExistingBookings([]);
			return;
		}

		try {
			setIsCheckingAvailability(true);
			const response = await api.get(`/rooms/${roomId}/bookings`, {
				params: { date },
			});
			// Filter out the current booking being edited to avoid self-conflict
			const bookings = response.data.data || [];
			const filteredBookings = booking
				? bookings.filter((b: Booking) => b.id !== booking.id)
				: bookings;
			setExistingBookings(filteredBookings);
		} catch (err) {
			console.error('Error fetching room bookings:', err);
			setExistingBookings([]);
		} finally {
			setIsCheckingAvailability(false);
		}
	};

	const checkTimeConflict = (
		startTime: string,
		endTime: string
	): Booking | null => {
		if (!startTime || !endTime || !formData.date || !formData.room_id)
			return null;

		const newStart = new Date(`${formData.date}T${startTime}:00`);
		const newEnd = new Date(`${formData.date}T${endTime}:00`);

		for (const existingBooking of existingBookings) {
			const existingStart = new Date(existingBooking.start_time);
			const existingEnd = new Date(existingBooking.end_time);

			// Check for overlap: new booking starts before existing ends AND new booking ends after existing starts
			if (newStart < existingEnd && newEnd > existingStart) {
				return existingBooking;
			}
		}

		return null;
	};

	// Fetch bookings when room or date changes
	useEffect(() => {
		if (formData.room_id && formData.date) {
			fetchRoomBookings(formData.room_id, formData.date);
		}
	}, [formData.room_id, formData.date, booking]);

	// Check for conflicts in real-time
	const currentConflict = checkTimeConflict(
		formData.start_time,
		formData.end_time
	);

	// Calculate booking duration and check if valid
	const calculateDuration = (): number | null => {
		if (!formData.start_time || !formData.end_time || !formData.date)
			return null;

		const start = new Date(`${formData.date}T${formData.start_time}:00`);
		const end = new Date(`${formData.date}T${formData.end_time}:00`);

		const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
		return durationMinutes;
	};

	const duration = calculateDuration();
	const isDurationTooShort = duration !== null && duration < 30;
	const isDurationTooLong = duration !== null && duration > 240;

	const handleAddInvitee = (userId: number) => {
		if (!selectedInvitees.includes(userId)) {
			setSelectedInvitees([...selectedInvitees, userId]);
		}
	};

	const handleRemoveInvitee = (userId: number) => {
		setSelectedInvitees(selectedInvitees.filter((id) => id !== userId));
	};

	const getFilteredUsers = () => {
		if (!userSearch) return users;
		const search = userSearch.toLowerCase();
		return users.filter(
			(u) =>
				u.email.toLowerCase().includes(search) ||
				u.first_name.toLowerCase().includes(search) ||
				u.last_name.toLowerCase().includes(search)
		);
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			// Check for time conflicts before submitting
			const conflict = checkTimeConflict(
				formData.start_time,
				formData.end_time
			);
			if (conflict) {
				const conflictStart = new Date(conflict.start_time).toLocaleTimeString(
					'en-US',
					{ hour: '2-digit', minute: '2-digit' }
				);
				const conflictEnd = new Date(conflict.end_time).toLocaleTimeString(
					'en-US',
					{ hour: '2-digit', minute: '2-digit' }
				);
				setError(
					`Time conflict: "${conflict.title}" is already booked from ${conflictStart} to ${conflictEnd}`
				);
				setIsLoading(false);
				return;
			}

			// Convert to ISO 8601 datetime format with timezone
			const startDateTime = new Date(
				`${formData.date}T${formData.start_time}:00`
			);
			const endDateTime = new Date(`${formData.date}T${formData.end_time}:00`);

			const payload: any = {
				room_id: parseInt(formData.room_id),
				user_id: user?.id,
				title: formData.title.trim(),
				start_time: startDateTime.toISOString(),
				end_time: endDateTime.toISOString(),
			};

			// Only include description if it's not empty
			if (formData.description.trim()) {
				payload.description = formData.description.trim();
			}

			console.log('=== BOOKING PAYLOAD ===', JSON.stringify(payload, null, 2));

			if (booking) {
				await api.patch(`/bookings/${booking.id}`, payload);

				// Handle invitee changes
				const inviteesToAdd = selectedInvitees.filter(
					(id) => !existingInvitees.includes(id)
				);
				const inviteesToRemove = existingInvitees.filter(
					(id) => !selectedInvitees.includes(id)
				);

				// Add new invitees
				if (inviteesToAdd.length > 0) {
					try {
						await invitationsApi.addInvitees(booking.id, inviteesToAdd);
					} catch (inviteErr) {
						console.error('Error adding invitees:', inviteErr);
					}
				}

				// Remove invitees
				if (inviteesToRemove.length > 0) {
					try {
						for (const userId of inviteesToRemove) {
							await invitationsApi.removeInvitee(booking.id, userId);
						}
					} catch (removeErr) {
						console.error('Error removing invitees:', removeErr);
					}
				}
			} else {
				const response = await api.post('/bookings', payload);
				const newBookingId = response.data.data.id;

				// Add invitees if any were selected
				if (selectedInvitees.length > 0) {
					try {
						await invitationsApi.addInvitees(newBookingId, selectedInvitees);
					} catch (inviteErr) {
						console.error('Error adding invitees:', inviteErr);
						// Don't fail the whole operation if invites fail
					}
				}
			}
			onSuccess();
			onClose();
		} catch (err: any) {
			console.error('=== BOOKING ERROR ===');
			console.error('Full error:', err);
			console.error('Response data:', err.response?.data);
			console.error(
				'Response details:',
				JSON.stringify(err.response?.data, null, 2)
			);

			let errorMessage = 'Failed to save booking';

			// Handle the new error format with details array
			if (
				err.response?.data?.details &&
				Array.isArray(err.response.data.details)
			) {
				const details = err.response.data.details;
				errorMessage = details
					.map((detail: any) => {
						const field = detail.path?.replace('body.', '') || 'Field';
						return `${field}: ${detail.message}`;
					})
					.join('; ');
			} else if (err.response?.data?.details?.issues) {
				// Legacy Zod validation errors format
				const issues = err.response.data.details.issues;
				errorMessage = issues
					.map(
						(issue: any) =>
							`${issue.path?.join('.') || 'Field'}: ${issue.message}`
					)
					.join('; ');
			} else if (err.response?.data?.message) {
				errorMessage = err.response.data.message;
			}

			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto'>
				<div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
					<h2 className='text-xl font-semibold'>
						{booking ? 'Edit Booking' : 'Create Booking'}
					</h2>
					<button
						onClick={onClose}
						className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
					>
						<X size={20} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='p-6 space-y-4'>
					<div>
						<label className='block text-sm font-medium mb-2'>Room</label>
						<select
							value={formData.room_id}
							onChange={(e) =>
								setFormData({ ...formData, room_id: e.target.value })
							}
							required
							className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
						>
							<option value=''>Select a room</option>
							{rooms.map((room) => (
								<option key={room.id} value={room.id}>
									{room.name} (Floor {room.floor}, Capacity: {room.capacity})
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-sm font-medium mb-2'>Title</label>
						<input
							type='text'
							value={formData.title}
							onChange={(e) =>
								setFormData({ ...formData, title: e.target.value })
							}
							required
							className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
							placeholder='Team Meeting'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-2'>
							Description (optional)
						</label>
						<textarea
							value={formData.description}
							onChange={(e) =>
								setFormData({ ...formData, description: e.target.value })
							}
							rows={3}
							className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
							placeholder='Weekly team sync...'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium mb-2'>Date</label>
						<input
							type='date'
							value={formData.date}
							onChange={(e) =>
								setFormData({ ...formData, date: e.target.value })
							}
							required
							min={new Date().toISOString().split('T')[0]}
							className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium mb-2'>
								Start Time
							</label>
							<input
								type='time'
								value={formData.start_time}
								onChange={(e) =>
									setFormData({ ...formData, start_time: e.target.value })
								}
								required
								min='09:00'
								max='17:00'
								className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:ring-2 ${
									currentConflict
										? 'border-red-500 dark:border-red-600 focus:ring-red-500'
										: 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
								}`}
							/>
						</div>

						<div>
							<label className='block text-sm font-medium mb-2'>End Time</label>
							<input
								type='time'
								value={formData.end_time}
								onChange={(e) =>
									setFormData({ ...formData, end_time: e.target.value })
								}
								required
								min='09:00'
								max='17:00'
								className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 focus:ring-2 ${
									currentConflict
										? 'border-red-500 dark:border-red-600 focus:ring-red-500'
										: 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'
								}`}
							/>
						</div>
					</div>

					{currentConflict && (
						<div className='flex items-start gap-2 text-sm text-red-600 dark:text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
							<AlertCircle className='shrink-0 mt-0.5' size={16} />
							<div>
								<span className='font-medium'>Time conflict: </span>
								<span>
									"{currentConflict.title}" is already booked from{' '}
									{new Date(currentConflict.start_time).toLocaleTimeString(
										'en-US',
										{ hour: '2-digit', minute: '2-digit' }
									)}{' '}
									to{' '}
									{new Date(currentConflict.end_time).toLocaleTimeString(
										'en-US',
										{ hour: '2-digit', minute: '2-digit' }
									)}
								</span>
							</div>
						</div>
					)}

					{/* Duration Validation Warning */}
					{isDurationTooShort && (
						<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
							<div className='flex items-start gap-2'>
								<AlertCircle
									className='text-red-600 dark:text-red-500 shrink-0 mt-0.5'
									size={18}
								/>
								<div className='flex-1'>
									<p className='text-sm font-medium text-red-800 dark:text-red-400'>
										Booking duration is too short
									</p>
									<p className='text-xs text-red-700 dark:text-red-500 mt-1'>
										Minimum booking duration is 30 minutes. Current duration:{' '}
										{duration} minutes.
									</p>
								</div>
							</div>
						</div>
					)}

					{isDurationTooLong && (
						<div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3'>
							<div className='flex items-start gap-2'>
								<AlertCircle
									className='text-red-600 dark:text-red-500 shrink-0 mt-0.5'
									size={18}
								/>
								<div className='flex-1'>
									<p className='text-sm font-medium text-red-800 dark:text-red-400'>
										Booking duration is too long
									</p>
									<p className='text-xs text-red-700 dark:text-red-500 mt-1'>
										Maximum booking duration is 4 hours (240 minutes). Current
										duration: {duration} minutes.
									</p>
								</div>
							</div>
						</div>
					)}

					<p className='text-xs text-gray-500 dark:text-gray-400'>
						Business hours: 9:00 AM - 5:00 PM
					</p>

					{/* Existing Bookings Warning */}
					{formData.room_id && formData.date && existingBookings.length > 0 && (
						<div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3'>
							<div className='flex items-start gap-2'>
								<AlertCircle
									className='text-amber-600 dark:text-amber-500 shrink-0 mt-0.5'
									size={18}
								/>
								<div className='flex-1'>
									<p className='text-sm font-medium text-amber-800 dark:text-amber-400 mb-2'>
										Existing bookings for this room:
									</p>
									<div className='space-y-1'>
										{existingBookings.map((booking) => {
											const start = new Date(
												booking.start_time
											).toLocaleTimeString('en-US', {
												hour: '2-digit',
												minute: '2-digit',
											});
											const end = new Date(booking.end_time).toLocaleTimeString(
												'en-US',
												{
													hour: '2-digit',
													minute: '2-digit',
												}
											);
											return (
												<div
													key={booking.id}
													className='flex items-center gap-2 text-xs text-amber-700 dark:text-amber-500'
												>
													<Clock size={14} />
													<span>
														{start} - {end}: {booking.title}
													</span>
												</div>
											);
										})}
									</div>
								</div>
							</div>
						</div>
					)}

					{isCheckingAvailability && (
						<div className='text-center py-2'>
							<div className='inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400'>
								<div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600'></div>
								<span>Checking availability...</span>
							</div>
						</div>
					)}

					{/* Invitees Section - For both new and existing bookings */}
					<div className='space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700'>
						<div className='flex items-center gap-2'>
							<UserPlus size={18} className='text-gray-500' />
							<label className='block text-sm font-medium'>
								Invite People (Optional)
							</label>
						</div>

						{/* Search and dropdown */}
						<div className='relative'>
							<input
								type='text'
								value={userSearch}
								onChange={(e) => setUserSearch(e.target.value)}
								placeholder='Search users by name or email...'
								className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
							/>

							{userSearch && (
								<div className='absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg'>
									{getFilteredUsers().length > 0 ? (
										getFilteredUsers().map((u) => (
											<button
												key={u.id}
												type='button'
												onClick={() => {
													handleAddInvitee(u.id);
													setUserSearch('');
												}}
												disabled={selectedInvitees.includes(u.id)}
												className='w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
											>
												<div className='font-medium text-sm'>
													{u.first_name} {u.last_name}
												</div>
												<div className='text-xs text-gray-500 dark:text-gray-400'>
													{u.email}
												</div>
											</button>
										))
									) : (
										<div className='px-4 py-2 text-sm text-gray-500'>
											No users found
										</div>
									)}
								</div>
							)}
						</div>

						{/* Selected invitees */}
						{selectedInvitees.length > 0 && (
							<div className='space-y-2'>
								<p className='text-xs text-gray-500'>
									{selectedInvitees.length}{' '}
									{selectedInvitees.length === 1 ? 'person' : 'people'} invited
								</p>
								<div className='space-y-2'>
									{selectedInvitees.map((userId) => {
										const invitedUser = users.find((u) => u.id === userId);
										if (!invitedUser) return null;
										return (
											<div
												key={userId}
												className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600'
											>
												<div className='flex-1 min-w-0'>
													<div className='font-medium text-sm'>
														{invitedUser.first_name} {invitedUser.last_name}
													</div>
													<div className='text-xs text-gray-500 dark:text-gray-400 truncate'>
														{invitedUser.email}
													</div>
												</div>
												<button
													type='button'
													onClick={() => handleRemoveInvitee(userId)}
													className='ml-3 p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors'
													title='Remove invitee'
												>
													<XCircle size={18} />
												</button>
											</div>
										);
									})}
								</div>
							</div>
						)}
					</div>

					{error && (
						<div className='p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm'>
							{error}
						</div>
					)}

					<div className='flex gap-3 pt-4'>
						<button
							type='button'
							onClick={onClose}
							className='flex-1 py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={
								isLoading ||
								!!currentConflict ||
								isDurationTooShort ||
								isDurationTooLong
							}
							className='flex-1 py-2 px-4 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isLoading ? 'Saving...' : booking ? 'Update' : 'Create'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default BookingModal;
