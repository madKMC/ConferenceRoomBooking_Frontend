import { useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';
import { analyticsApi } from '../../lib/analytics';
import type { DailyBookingTrend } from '../../types/analytics';

const BookingTrendsPage = () => {
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [trends, setTrends] = useState<DailyBookingTrend[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [hasSearched, setHasSearched] = useState(false);

	const handleFetchData = async () => {
		if (!startDate || !endDate) {
			setError('Please select both start and end dates');
			return;
		}

		if (new Date(startDate) > new Date(endDate)) {
			setError('Start date must be before end date');
			return;
		}

		try {
			setIsLoading(true);
			setError('');
			const data = await analyticsApi.getDailyBookings(startDate, endDate);
			setTrends(data);
			setHasSearched(true);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to fetch booking trends';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	const maxBookings = Math.max(...trends.map((t) => t.total_bookings), 1);
	const maxHours = Math.max(...trends.map((t) => t.total_booked_hours), 1);

	const totalBookings = trends.reduce(
		(sum, day) => sum + day.total_bookings,
		0
	);
	const totalHours = trends.reduce(
		(sum, day) => sum + day.total_booked_hours,
		0
	);
	const avgBookingsPerDay =
		trends.length > 0 ? totalBookings / trends.length : 0;

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
					Booking Trends
				</h1>
				<p className='text-gray-600 dark:text-gray-400 mt-1'>
					Daily booking statistics and patterns
				</p>
			</div>

			{/* Filters */}
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<div>
						<label className='block text-sm font-medium mb-2'>Start Date</label>
						<input
							type='date'
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium mb-2'>End Date</label>
						<input
							type='date'
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
						/>
					</div>
					<div className='flex items-end'>
						<button
							onClick={handleFetchData}
							disabled={isLoading}
							className='w-full px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{isLoading ? 'Loading...' : 'Apply'}
						</button>
					</div>
				</div>

				{error && (
					<div className='mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm'>
						{error}
					</div>
				)}
			</div>

			{/* Summary Cards */}
			{hasSearched && trends.length > 0 && (
				<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
						<h3 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
							Total Bookings
						</h3>
						<div className='text-3xl font-bold text-gray-800 dark:text-white'>
							{totalBookings}
						</div>
					</div>
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
						<h3 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
							Total Hours Booked
						</h3>
						<div className='text-3xl font-bold text-gray-800 dark:text-white'>
							{totalHours.toFixed(1)}
						</div>
					</div>
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
						<h3 className='text-sm font-medium text-gray-600 dark:text-gray-400 mb-2'>
							Avg Bookings/Day
						</h3>
						<div className='text-3xl font-bold text-gray-800 dark:text-white'>
							{avgBookingsPerDay.toFixed(1)}
						</div>
					</div>
				</div>
			)}

			{/* Results */}
			{isLoading ? (
				<div className='flex items-center justify-center py-12'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
						<p className='mt-4 text-gray-600 dark:text-gray-400'>
							Loading booking trends...
						</p>
					</div>
				</div>
			) : hasSearched && trends.length === 0 ? (
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center'>
					<Calendar
						size={48}
						className='mx-auto text-gray-300 dark:text-gray-600 mb-4'
					/>
					<h2 className='text-xl font-semibold mb-2'>No data available</h2>
					<p className='text-gray-600 dark:text-gray-400'>
						No booking data found for the selected date range.
					</p>
				</div>
			) : hasSearched ? (
				<>
					{/* Chart - Bookings */}
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
						<h2 className='text-xl font-semibold mb-6'>Daily Bookings</h2>
						<div className='space-y-3'>
							{trends.map((day) => (
								<div key={day.date} className='flex items-center gap-4'>
									<div className='w-24 text-sm text-gray-600 dark:text-gray-400'>
										{formatDate(day.date)}
									</div>
									<div className='flex-1'>
										<div className='flex items-center gap-2'>
											<div className='flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-6'>
												<div
													className='bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2'
													style={{
														width: `${
															(day.total_bookings / maxBookings) * 100
														}%`,
														minWidth: day.total_bookings > 0 ? '40px' : '0',
													}}
												>
													<span className='text-xs font-medium text-white'>
														{day.total_bookings}
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Chart - Hours */}
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
						<h2 className='text-xl font-semibold mb-6'>Daily Hours Booked</h2>
						<div className='space-y-3'>
							{trends.map((day) => (
								<div key={day.date} className='flex items-center gap-4'>
									<div className='w-24 text-sm text-gray-600 dark:text-gray-400'>
										{formatDate(day.date)}
									</div>
									<div className='flex-1'>
										<div className='flex items-center gap-2'>
											<div className='flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-6'>
												<div
													className='bg-green-500 h-6 rounded-full flex items-center justify-end pr-2'
													style={{
														width: `${
															(day.total_booked_hours / maxHours) * 100
														}%`,
														minWidth: day.total_booked_hours > 0 ? '60px' : '0',
													}}
												>
													<span className='text-xs font-medium text-white'>
														{day.total_booked_hours.toFixed(1)} hrs
													</span>
												</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Table */}
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50 dark:bg-gray-700'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Date
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Total Bookings
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Total Hours
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Avg Hours/Booking
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
									{trends.map((day) => (
										<tr
											key={day.date}
											className='hover:bg-gray-50 dark:hover:bg-gray-700'
										>
											<td className='px-6 py-4 whitespace-nowrap'>
												{formatDate(day.date)}
											</td>
											<td className='px-6 py-4 whitespace-nowrap font-medium'>
												{day.total_bookings}
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{day.total_booked_hours.toFixed(1)} hrs
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{(day.total_booked_hours / day.total_bookings).toFixed(
													1
												)}{' '}
												hrs
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</>
			) : (
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center'>
					<TrendingUp
						size={48}
						className='mx-auto text-gray-300 dark:text-gray-600 mb-4'
					/>
					<h2 className='text-xl font-semibold mb-2'>
						Select a date range to view trends
					</h2>
					<p className='text-gray-600 dark:text-gray-400'>
						Choose start and end dates above and click Apply to see booking
						trends.
					</p>
				</div>
			)}
		</div>
	);
};

export default BookingTrendsPage;
