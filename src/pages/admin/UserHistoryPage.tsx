import { useState, useEffect } from 'react';
import { Users, Calendar, Clock, DoorOpen } from 'lucide-react';
import { analyticsApi } from '../../lib/analytics';
import { invitationsApi } from '../../lib/invitations';
import type { UserBookingSummary } from '../../types/analytics';
import type { User } from '../../types';
import { useBookingValidation } from '../../hooks/useBookingValidation';

const UserHistoryPage = () => {
	const [users, setUsers] = useState<User[]>([]);
	const [selectedUserId, setSelectedUserId] = useState('');
	const [userSearch, setUserSearch] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [summary, setSummary] = useState<UserBookingSummary | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [hasSearched, setHasSearched] = useState(false);
	const { validateDateRange } = useBookingValidation();

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		try {
			const allUsers = await invitationsApi.getUsers(undefined, 100, 0);
			setUsers(allUsers);
		} catch (err) {
			console.error('Error fetching users:', err);
		}
	};

	const filteredUsers = users.filter(
		(u) =>
			u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
			u.first_name.toLowerCase().includes(userSearch.toLowerCase()) ||
			u.last_name.toLowerCase().includes(userSearch.toLowerCase())
	);

	const handleFetchSummary = async () => {
		if (!selectedUserId) {
			setError('Please select a user');
			return;
		}

		// Ensure both dates are provided together or both are empty
		if ((startDate && !endDate) || (!startDate && endDate)) {
			setError(
				'Please provide both start and end dates, or leave both empty for all-time summary'
			);
			return;
		}

		// Validate date range if both dates are provided
		if (startDate && endDate) {
			const dateError = validateDateRange(startDate, endDate);
			if (dateError) {
				setError(dateError);
				return;
			}
		}

		try {
			setIsLoading(true);
			setError('');
			const data = await analyticsApi.getUserSummary(
				parseInt(selectedUserId),
				startDate || undefined,
				endDate || undefined
			);
			setSummary(data);
			setHasSearched(true);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error ? err.message : 'Failed to fetch user summary';
			setError(errorMessage);
			setSummary(null);
		} finally {
			setIsLoading(false);
		}
	};

	const selectedUser = users.find((u) => u.id === parseInt(selectedUserId));

	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'N/A';
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
		});
	};

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
					User Booking History
				</h1>
				<p className='text-gray-600 dark:text-gray-400 mt-1'>
					View detailed booking statistics for individual users
				</p>
			</div>

			{/* Filters */}
			<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
				<div className='space-y-4'>
					{/* User Selection */}
					<div>
						<label className='block text-sm font-medium mb-2'>
							Select User
						</label>
						<div className='relative'>
							<input
								type='text'
								value={userSearch}
								onChange={(e) => setUserSearch(e.target.value)}
								placeholder='Search by name or email...'
								className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
							/>
							{userSearch && filteredUsers.length > 0 && (
								<div className='absolute z-10 w-full mt-1 max-h-48 overflow-y-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg'>
									{filteredUsers.slice(0, 10).map((user) => (
										<button
											key={user.id}
											onClick={() => {
												setSelectedUserId(user.id.toString());
												setUserSearch(
													`${user.first_name} ${user.last_name} (${user.email})`
												);
											}}
											className='w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors'
										>
											<div className='font-medium'>
												{user.first_name} {user.last_name}
											</div>
											<div className='text-sm text-gray-600 dark:text-gray-400'>
												{user.email}
											</div>
										</button>
									))}
								</div>
							)}
						</div>
					</div>

					{/* Date Range (Optional) */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-sm font-medium mb-2'>
								Start Date (Optional)
							</label>
							<input
								type='date'
								value={startDate}
								onChange={(e) => setStartDate(e.target.value)}
								className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium mb-2'>
								End Date (Optional)
							</label>
							<input
								type='date'
								value={endDate}
								onChange={(e) => setEndDate(e.target.value)}
								className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
							/>
						</div>
					</div>

					<button
						onClick={handleFetchSummary}
						disabled={isLoading || !selectedUserId}
						className='w-full px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
					>
						{isLoading ? 'Loading...' : 'Load Summary'}
					</button>

					{error && (
						<div className='p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm'>
							{error}
						</div>
					)}
				</div>
			</div>

			{/* Results */}
			{isLoading ? (
				<div className='flex items-center justify-center py-12'>
					<div className='text-center'>
						<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
						<p className='mt-4 text-gray-600 dark:text-gray-400'>
							Loading user summary...
						</p>
					</div>
				</div>
			) : hasSearched && summary ? (
				<>
					{/* User Info */}
					{selectedUser && (
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
							<div className='flex items-center gap-4'>
								<div className='p-3 bg-primary-100 dark:bg-primary-900/30 rounded-full'>
									<Users
										className='text-primary-600 dark:text-primary-400'
										size={24}
									/>
								</div>
								<div>
									<h2 className='text-xl font-semibold'>
										{selectedUser.first_name} {selectedUser.last_name}
									</h2>
									<p className='text-gray-600 dark:text-gray-400'>
										{selectedUser.email}
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Summary Cards */}
					<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6'>
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6'>
							<h3 className='text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate'>
								Total Bookings
							</h3>
							<div className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white break-all'>
								{summary.total_bookings}
							</div>
						</div>
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6'>
							<h3 className='text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate'>
								Canceled Bookings
							</h3>
							<div className='text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 break-all'>
								{summary.total_canceled_bookings}
							</div>
						</div>
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6'>
							<h3 className='text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate'>
								Total Hours
							</h3>
							<div className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white break-all'>
								{summary.total_booked_hours.toFixed(1)}
							</div>
						</div>
						<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 md:p-6'>
							<h3 className='text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 truncate'>
								Rooms Used
							</h3>
							<div className='text-2xl md:text-3xl font-bold text-gray-800 dark:text-white break-all'>
								{summary.rooms_used.length}
							</div>
						</div>
					</div>

					{/* Date Range */}
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
						<h2 className='text-xl font-semibold mb-4'>Booking Timeline</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
							<div className='flex items-center gap-3'>
								<div className='p-2 bg-green-100 dark:bg-green-900/30 rounded-lg'>
									<Calendar
										className='text-green-600 dark:text-green-400'
										size={20}
									/>
								</div>
								<div>
									<div className='text-sm text-gray-600 dark:text-gray-400'>
										First Booking
									</div>
									<div className='font-semibold'>
										{formatDate(summary.first_booking_date)}
									</div>
								</div>
							</div>
							<div className='flex items-center gap-3'>
								<div className='p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg'>
									<Calendar
										className='text-blue-600 dark:text-blue-400'
										size={20}
									/>
								</div>
								<div>
									<div className='text-sm text-gray-600 dark:text-gray-400'>
										Last Booking
									</div>
									<div className='font-semibold'>
										{formatDate(summary.last_booking_date)}
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Rooms Used */}
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
						<h2 className='text-xl font-semibold mb-4'>Rooms Used</h2>
						{summary.rooms_used.length > 0 ? (
							<div className='space-y-3'>
								{summary.rooms_used.map((room) => (
									<div
										key={room.room_id}
										className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'
									>
										<div className='flex items-center gap-3'>
											<DoorOpen size={20} className='text-gray-400' />
											<span className='font-medium'>{room.room_name}</span>
										</div>
										<div className='flex items-center gap-2'>
											<Clock size={16} className='text-gray-400' />
											<span className='font-semibold'>{room.count}</span>
											<span className='text-sm text-gray-600 dark:text-gray-400'>
												{room.count === 1 ? 'booking' : 'bookings'}
											</span>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className='text-gray-600 dark:text-gray-400 text-center py-8'>
								No rooms used in the selected period
							</p>
						)}
					</div>
				</>
			) : hasSearched ? (
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center'>
					<Calendar
						size={48}
						className='mx-auto text-gray-300 dark:text-gray-600 mb-4'
					/>
					<h2 className='text-xl font-semibold mb-2'>No bookings found</h2>
					<p className='text-gray-600 dark:text-gray-400'>
						This user has no bookings in the selected period.
					</p>
				</div>
			) : (
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center'>
					<Users
						size={48}
						className='mx-auto text-gray-300 dark:text-gray-600 mb-4'
					/>
					<h2 className='text-xl font-semibold mb-2'>Select a user to begin</h2>
					<p className='text-gray-600 dark:text-gray-400'>
						Search for and select a user above to view their booking history.
					</p>
				</div>
			)}
		</div>
	);
};

export default UserHistoryPage;
