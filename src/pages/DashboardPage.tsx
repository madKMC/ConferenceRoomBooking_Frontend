import { useEffect, useState } from 'react';
import { Calendar, Clock, DoorOpen, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import type { Booking } from '../types';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
	const { user } = useAuth();
	const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userId, setUserId] = useState<number | null>(null);

	useEffect(() => {
		fetchUserId();
	}, []);

	useEffect(() => {
		if (userId) {
			fetchDashboardData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [userId]);

	const fetchUserId = async () => {
		try {
			const response = await api.get('/auth/me');
			setUserId(response.data.data.id);
		} catch (error) {
			console.error('Error fetching user ID:', error);
		}
	};

	const fetchDashboardData = async () => {
		if (!userId) return;

		try {
			setIsLoading(true);

			const bookingsResponse = await api.get(`/users/${userId}/bookings`);

			const userBookings = bookingsResponse.data.data || [];
			const now = new Date();
			const upcoming = userBookings
				.filter((b: Booking) => new Date(b.start_time) > now)
				.sort(
					(a: Booking, b: Booking) =>
						new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
				);

			const bookingsWithRooms = await Promise.all(
				upcoming.map(async (booking: Booking) => {
					try {
						const bookingWithRoom = await api.get(`/bookings/${booking.id}`);
						return bookingWithRoom.data.data;
					} catch {
						return booking;
					}
				})
			);

			setUpcomingBookings(bookingsWithRooms);
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDateTime = (dateString: string) => {
		const date = new Date(dateString);
		return {
			date: date.toLocaleDateString('en-US', {
				weekday: 'short',
				month: 'short',
				day: 'numeric',
			}),
			time: date.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
			}),
		};
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-full'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
					<p className='mt-4 text-gray-600 dark:text-gray-400'>
						Loading dashboard...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
					Dashboard
				</h1>
				<p className='text-gray-600 dark:text-gray-400 mt-1'>
					Welcome back, {user?.first_name}!
				</p>
			</div>

			<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
				<div className='flex items-center gap-3 mb-6'>
					<div className='p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'>
						<Calendar size={24} />
					</div>
					<h2 className='text-xl font-semibold'>Upcoming Bookings</h2>
				</div>

				{upcomingBookings.length > 0 ? (
					<div className='space-y-4'>
						{upcomingBookings.map((booking) => (
							<div
								key={booking.id}
								className='p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors'
							>
								<div className='space-y-3'>
									<div>
										<h3 className='font-semibold text-lg'>{booking.title}</h3>
										{booking.description && (
											<p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
												{booking.description}
											</p>
										)}
									</div>

									<div className='flex flex-wrap gap-4 text-sm'>
										<div className='flex items-center gap-2'>
											<DoorOpen size={16} className='text-gray-500' />
											<span className='font-medium'>{booking.room?.name}</span>
										</div>

										<div className='flex items-center gap-2'>
											<Clock size={16} className='text-gray-500' />
											<span>
												{formatDateTime(booking.start_time).date} at{' '}
												{formatDateTime(booking.start_time).time}
											</span>
										</div>

										<div className='flex items-center gap-2'>
											<CheckCircle size={16} className='text-success-500' />
											<span className='text-success-600 dark:text-success-400 font-medium capitalize'>
												{booking.status}
											</span>
										</div>
									</div>

									<div className='pt-2 border-t border-gray-200 dark:border-gray-700'>
										<p className='text-xs text-gray-500'>
											Ends at {formatDateTime(booking.end_time).time}
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className='text-center py-12'>
						<Calendar
							size={48}
							className='mx-auto text-gray-300 dark:text-gray-600 mb-3'
						/>
						<p className='text-gray-600 dark:text-gray-400'>
							No upcoming bookings
						</p>
						<p className='text-sm text-gray-500 dark:text-gray-500 mt-1'>
							Book a room to get started
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default DashboardPage;
