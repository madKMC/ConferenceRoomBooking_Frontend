import { useEffect, useState } from 'react';
import { Plus, Calendar, Clock, DoorOpen, Edit, Trash2 } from 'lucide-react';
import api from '../lib/api';
import type { Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';
import BookingModal from '../components/bookings/BookingModal';

const BookingsPage = () => {
	const { user } = useAuth();
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
	const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');

	useEffect(() => {
		fetchBookings();
	}, [user]);

	const fetchBookings = async () => {
		try {
			setIsLoading(true);
			const response = await api.get(`/users/${user?.id}/bookings`);
			const allBookings = response.data.data || [];

			// Transform bookings to use room_name if available
			const bookingsWithRooms = allBookings.map((booking: any) => {
				// If the booking has room_name directly (from some endpoints), create a room object
				if (booking.room_name) {
					return {
						...booking,
						room: {
							id: booking.room_id,
							name: booking.room_name,
							capacity: booking.room_capacity,
						},
					};
				}
				// Otherwise return as-is (might already have room object)
				return booking;
			});

			setBookings(bookingsWithRooms);
		} catch {
			// Failed to fetch bookings
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm('Are you sure you want to cancel this booking?')) return;

		try {
			await api.delete(`/bookings/${id}`);
			fetchBookings();
		} catch (error: any) {
			alert(error.response?.data?.message || 'Failed to cancel booking');
		}
	};

	const handleEdit = (booking: Booking) => {
		setSelectedBooking(booking);
		setIsModalOpen(true);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedBooking(null);
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return {
			date: date.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			}),
			time: date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
			}),
		};
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'confirmed':
				return 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400';
			case 'pending':
				return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400';
			case 'cancelled':
				return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
			case 'completed':
				return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
			default:
				return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400';
		}
	};

	const filterBookings = () => {
		const now = new Date();
		switch (filter) {
			case 'upcoming':
				return bookings.filter(
					(b) => new Date(b.start_time) > now && b.status !== 'cancelled'
				);
			case 'past':
				return bookings.filter(
					(b) => new Date(b.end_time) < now || b.status === 'cancelled'
				);
			default:
				return bookings;
		}
	};

	const filteredBookings = filterBookings();

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-full'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
					<p className='mt-4 text-gray-600 dark:text-gray-400'>
						Loading bookings...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
						My Bookings
					</h1>
					<p className='text-gray-600 dark:text-gray-400 mt-1'>
						Manage your conference room reservations
					</p>
				</div>

				<button
					onClick={() => {
						setSelectedBooking(null);
						setIsModalOpen(true);
					}}
					className='flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors'
				>
					<Plus size={20} />
					New Booking
				</button>
			</div>

			<div className='flex gap-2'>
				{(['all', 'upcoming', 'past'] as const).map((f) => (
					<button
						key={f}
						onClick={() => setFilter(f)}
						className={`px-4 py-2 rounded-lg font-medium transition-colors ${
							filter === f
								? 'bg-primary-600 text-white'
								: 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
						}`}
					>
						{f.charAt(0).toUpperCase() + f.slice(1)}
					</button>
				))}
			</div>

			{filteredBookings.length === 0 ? (
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center'>
					<Calendar
						size={64}
						className='mx-auto text-gray-300 dark:text-gray-600 mb-4'
					/>
					<h2 className='text-xl font-semibold mb-2'>No bookings found</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>
						{filter === 'all'
							? "You haven't made any bookings yet"
							: filter === 'upcoming'
							? 'No upcoming bookings'
							: 'No past bookings'}
					</p>
					<button
						onClick={() => {
							setSelectedBooking(null);
							setIsModalOpen(true);
						}}
						className='inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors'
					>
						<Plus size={20} />
						Create Your First Booking
					</button>
				</div>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{filteredBookings.map((booking) => (
						<div
							key={booking.id}
							className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow'
						>
							<div className='flex items-start justify-between mb-4'>
								<div className='flex-1'>
									<h3 className='text-lg font-semibold mb-1'>
										{booking.title}
									</h3>
									{booking.description && (
										<p className='text-sm text-gray-600 dark:text-gray-400'>
											{booking.description}
										</p>
									)}
								</div>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
										booking.status
									)}`}
								>
									{booking.status}
								</span>
							</div>

							<div className='space-y-2 mb-4'>
								<div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
									<DoorOpen size={16} className='text-gray-500' />
									<span>
										{booking.room_name ||
											booking.room?.name ||
											`Room ${booking.room_id}`}
									</span>
								</div>

								<div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
									<Calendar size={16} className='text-gray-500' />
									<span>{formatDateTime(booking.start_time).date}</span>
								</div>

								<div className='flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300'>
									<Clock size={16} className='text-gray-500' />
									<span>
										{formatDateTime(booking.start_time).time} -{' '}
										{formatDateTime(booking.end_time).time}
									</span>
								</div>
							</div>

							{booking.status !== 'cancelled' &&
								booking.status !== 'completed' && (
									<div className='flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700'>
										<button
											onClick={() => handleEdit(booking)}
											className='flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors'
										>
											<Edit size={16} />
											Edit
										</button>
										<button
											onClick={() => handleDelete(booking.id)}
											className='flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors'
										>
											<Trash2 size={16} />
											Cancel
										</button>
									</div>
								)}
						</div>
					))}
				</div>
			)}

			<BookingModal
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onSuccess={fetchBookings}
				booking={selectedBooking}
			/>
		</div>
	);
};

export default BookingsPage;
