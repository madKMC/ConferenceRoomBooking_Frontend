import { useState } from 'react';
import { BarChart3, Calendar } from 'lucide-react';
import { analyticsApi } from '../../lib/analytics';
import type { RoomUtilization } from '../../types/analytics';

const UtilizationDashboard = () => {
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [utilization, setUtilization] = useState<RoomUtilization[]>([]);
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
			const data = await analyticsApi.getUtilization(startDate, endDate);
			setUtilization(data);
			setHasSearched(true);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to fetch utilization data';
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const getUtilizationColor = (percentage: number) => {
		if (percentage >= 75) return 'bg-red-500';
		if (percentage >= 50) return 'bg-yellow-500';
		if (percentage >= 25) return 'bg-green-500';
		return 'bg-gray-300';
	};

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
					Room Utilization Dashboard
				</h1>
				<p className='text-gray-600 dark:text-gray-400 mt-1'>
					Analyze room usage and booking patterns
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

			{/* Results */}
			{isLoading ? (
				<div className='flex items-center justify-center py-12'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
						<p className='mt-4 text-gray-600 dark:text-gray-400'>
							Loading utilization data...
						</p>
					</div>
				</div>
			) : hasSearched && utilization.length === 0 ? (
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center'>
					<Calendar
						size={48}
						className='mx-auto text-gray-300 dark:text-gray-600 mb-4'
					/>
					<h2 className='text-xl font-semibold mb-2'>No data available</h2>
					<p className='text-gray-600 dark:text-gray-400'>
						No room utilization data found for the selected date range.
					</p>
				</div>
			) : hasSearched ? (
				<>
					{/* Table */}
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden'>
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-50 dark:bg-gray-700'>
									<tr>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Room
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Booked Hours
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Available Hours
										</th>
										<th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider'>
											Utilization
										</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
									{utilization.map((room) => (
										<tr
											key={room.room_id}
											className='hover:bg-gray-50 dark:hover:bg-gray-700'
										>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex items-center'>
													<BarChart3 size={16} className='text-gray-400 mr-2' />
													<span className='font-medium'>{room.room_name}</span>
												</div>
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{room.total_booked_hours.toFixed(1)} hrs
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												{room.total_available_hours.toFixed(1)} hrs
											</td>
											<td className='px-6 py-4 whitespace-nowrap'>
												<div className='flex items-center gap-3'>
													<div className='flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2 max-w-[100px]'>
														<div
															className={`h-2 rounded-full ${getUtilizationColor(
																room.utilization_percentage
															)}`}
															style={{
																width: `${Math.min(
																	100,
																	room.utilization_percentage
																)}%`,
															}}
														></div>
													</div>
													<span className='font-semibold text-sm'>
														{room.utilization_percentage.toFixed(1)}%
													</span>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					{/* Visual Bar Chart */}
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
						<h2 className='text-xl font-semibold mb-6'>Utilization Overview</h2>
						<div className='space-y-4'>
							{utilization.map((room) => (
								<div key={room.room_id}>
									<div className='flex items-center justify-between mb-1'>
										<span className='text-sm font-medium'>
											{room.room_name}
										</span>
										<span className='text-sm text-gray-600 dark:text-gray-400'>
											{room.utilization_percentage.toFixed(1)}%
										</span>
									</div>
									<div className='w-full bg-gray-200 dark:bg-gray-600 rounded-full h-4'>
										<div
											className={`h-4 rounded-full ${getUtilizationColor(
												room.utilization_percentage
											)}`}
											style={{
												width: `${Math.min(100, room.utilization_percentage)}%`,
											}}
										></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</>
			) : (
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center'>
					<BarChart3
						size={48}
						className='mx-auto text-gray-300 dark:text-gray-600 mb-4'
					/>
					<h2 className='text-xl font-semibold mb-2'>
						Select a date range to view utilization
					</h2>
					<p className='text-gray-600 dark:text-gray-400'>
						Choose start and end dates above and click Apply to see room
						utilization statistics.
					</p>
				</div>
			)}
		</div>
	);
};

export default UtilizationDashboard;
