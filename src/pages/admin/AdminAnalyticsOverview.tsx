import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
	BarChart3,
	TrendingUp,
	Users,
	Calendar,
	DoorOpen,
	ArrowRight,
} from 'lucide-react';
import { analyticsApi } from '../../lib/analytics';
import type { RoomUtilization, DailyBookingTrend } from '../../types/analytics';

const AdminAnalyticsOverview = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [utilization, setUtilization] = useState<RoomUtilization[]>([]);
	const [dailyTrends, setDailyTrends] = useState<DailyBookingTrend[]>([]);

	useEffect(() => {
		fetchOverviewData();
	}, []);

	const fetchOverviewData = async () => {
		try {
			setIsLoading(true);
			const endDate = new Date().toISOString().split('T')[0];
			const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				.toISOString()
				.split('T')[0];

			const [utilizationData, trendsData] = await Promise.all([
				analyticsApi.getUtilization(startDate, endDate),
				analyticsApi.getDailyBookings(startDate, endDate),
			]);

			setUtilization(utilizationData);
			setDailyTrends(trendsData);
		} catch {
			// Failed to fetch analytics data
		} finally {
			setIsLoading(false);
		}
	};

	const totalBookings = dailyTrends.reduce(
		(sum, day) => sum + day.total_bookings,
		0
	);
	const avgUtilization =
		utilization.length > 0
			? utilization.reduce(
					(sum, room) => sum + room.utilization_percentage,
					0
			  ) / utilization.length
			: 0;
	const topRooms = [...utilization]
		.sort((a, b) => b.total_booked_hours - a.total_booked_hours)
		.slice(0, 3);

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-full'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
					<p className='mt-4 text-gray-600 dark:text-gray-400'>
						Loading analytics...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
					Admin Analytics
				</h1>
				<p className='text-gray-600 dark:text-gray-400 mt-1'>
					Overview of booking statistics and room utilization
				</p>
			</div>

			{/* Summary Cards */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6'>
					<div className='flex items-center justify-between mb-4'>
						<div className='p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
							<Calendar
								className='text-blue-600 dark:text-blue-400'
								size={24}
							/>
						</div>
					</div>
					<h3 className='text-xl md:text-2xl font-bold text-gray-800 dark:text-white break-all'>
						{totalBookings}
					</h3>
					<p className='text-gray-600 dark:text-gray-400 text-xs md:text-sm'>
						Total Bookings (Last 30 Days)
					</p>
				</div>

				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6'>
					<div className='flex items-center justify-between mb-4'>
						<div className='p-3 bg-green-100 dark:bg-green-900/30 rounded-lg'>
							<BarChart3
								className='text-green-600 dark:text-green-400'
								size={24}
							/>
						</div>
					</div>
					<h3 className='text-xl md:text-2xl font-bold text-gray-800 dark:text-white break-all'>
						{avgUtilization.toFixed(1)}%
					</h3>
					<p className='text-gray-600 dark:text-gray-400 text-xs md:text-sm'>
						Average Room Utilization
					</p>
				</div>

				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6'>
					<div className='flex items-center justify-between mb-4'>
						<div className='p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg'>
							<DoorOpen
								className='text-purple-600 dark:text-purple-400'
								size={24}
							/>
						</div>
					</div>
					<h3 className='text-xl md:text-2xl font-bold text-gray-800 dark:text-white break-all'>
						{utilization.length}
					</h3>
					<p className='text-gray-600 dark:text-gray-400 text-sm'>
						Active Rooms
					</p>
				</div>
			</div>

			{/* Top Rooms */}
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
				<h2 className='text-xl font-semibold mb-4'>Top 3 Most Used Rooms</h2>
				<div className='space-y-4'>
					{topRooms.map((room, index) => (
						<div
							key={room.room_id}
							className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
						>
							<div className='flex items-center gap-4'>
								<div className='flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold'>
									{index + 1}
								</div>
								<div>
									<h3 className='font-semibold text-gray-800 dark:text-white'>
										{room.room_name}
									</h3>
									<p className='text-sm text-gray-600 dark:text-gray-400'>
										{room.total_booked_hours.toFixed(1)} hours booked
									</p>
								</div>
							</div>
							<div className='text-right'>
								<div className='text-lg font-bold text-gray-800 dark:text-white'>
									{room.utilization_percentage.toFixed(1)}%
								</div>
								<div className='text-xs text-gray-600 dark:text-gray-400'>
									utilization
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Quick Links */}
			<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
				<Link
					to='/admin/analytics/utilization'
					className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group'
				>
					<div className='flex items-center justify-between'>
						<div>
							<div className='p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg inline-block mb-4'>
								<BarChart3
									className='text-blue-600 dark:text-blue-400'
									size={24}
								/>
							</div>
							<h3 className='text-lg font-semibold mb-2'>
								Utilization Dashboard
							</h3>
							<p className='text-sm text-gray-600 dark:text-gray-400'>
								View detailed room utilization metrics
							</p>
						</div>
						<ArrowRight className='text-gray-400 group-hover:text-primary-600 transition-colors' />
					</div>
				</Link>

				<Link
					to='/admin/analytics/booking-trends'
					className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group'
				>
					<div className='flex items-center justify-between'>
						<div>
							<div className='p-3 bg-green-100 dark:bg-green-900/30 rounded-lg inline-block mb-4'>
								<TrendingUp
									className='text-green-600 dark:text-green-400'
									size={24}
								/>
							</div>
							<h3 className='text-lg font-semibold mb-2'>Booking Trends</h3>
							<p className='text-sm text-gray-600 dark:text-gray-400'>
								Analyze daily booking patterns
							</p>
						</div>
						<ArrowRight className='text-gray-400 group-hover:text-primary-600 transition-colors' />
					</div>
				</Link>

				<Link
					to='/admin/analytics/user-history'
					className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow group'
				>
					<div className='flex items-center justify-between'>
						<div>
							<div className='p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg inline-block mb-4'>
								<Users
									className='text-purple-600 dark:text-purple-400'
									size={24}
								/>
							</div>
							<h3 className='text-lg font-semibold mb-2'>User History</h3>
							<p className='text-sm text-gray-600 dark:text-gray-400'>
								View user booking statistics
							</p>
						</div>
						<ArrowRight className='text-gray-400 group-hover:text-primary-600 transition-colors' />
					</div>
				</Link>
			</div>
		</div>
	);
};

export default AdminAnalyticsOverview;
