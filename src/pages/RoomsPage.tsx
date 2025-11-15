import { useEffect, useState } from 'react';
import {
	DoorOpen,
	Users,
	MapPin,
	Tv,
	Wifi,
	Monitor,
	Coffee,
	Phone,
	Search,
	Calendar,
	Clock,
	X,
} from 'lucide-react';
import api from '../lib/api';
import type { Room, Booking } from '../types';

const RoomsPage = () => {
	const [rooms, setRooms] = useState<Room[]>([]);
	const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [filterCapacity, setFilterCapacity] = useState<string>('');
	const [filterFloor, setFilterFloor] = useState<string>('');
	const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
	const [availabilityDate, setAvailabilityDate] = useState<string>('');
	const [roomBookings, setRoomBookings] = useState<Booking[]>([]);
	const [isLoadingBookings, setIsLoadingBookings] = useState(false);

	useEffect(() => {
		fetchRooms();
		// Set default date (today or next business day if after hours)
		const now = new Date();
		const currentHour = now.getHours();
		// If it's after 5 PM (17:00), default to next day
		if (currentHour >= 17) {
			const tomorrow = new Date(now);
			tomorrow.setDate(tomorrow.getDate() + 1);
			setAvailabilityDate(tomorrow.toISOString().split('T')[0]);
		} else {
			setAvailabilityDate(now.toISOString().split('T')[0]);
		}
	}, []);

	useEffect(() => {
		applyFilters();
	}, [rooms, searchTerm, filterCapacity, filterFloor]);

	const fetchRooms = async () => {
		try {
			setIsLoading(true);
			const response = await api.get('/rooms');
			setRooms(response.data.data || []);
		} catch (error) {
			console.error('Error fetching rooms:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const applyFilters = () => {
		let filtered = [...rooms];

		// Apply search filter
		if (searchTerm) {
			const search = searchTerm.toLowerCase();
			filtered = filtered.filter(
				(room) =>
					room.name.toLowerCase().includes(search) ||
					room.description?.toLowerCase().includes(search) ||
					room.amenities?.some((amenity) =>
						typeof amenity === 'string'
							? amenity.toLowerCase().includes(search)
							: amenity.name?.toLowerCase().includes(search)
					)
			);
		}

		// Apply capacity filter
		if (filterCapacity) {
			const capacity = parseInt(filterCapacity);
			if (!isNaN(capacity) && capacity > 0) {
				filtered = filtered.filter((room) => room.capacity >= capacity);
			}
		}

		// Apply floor filter
		if (filterFloor) {
			const floor = parseInt(filterFloor);
			if (!isNaN(floor)) {
				filtered = filtered.filter((room) => room.floor === floor);
			}
		}

		setFilteredRooms(filtered);
	};

	const fetchRoomBookings = async (roomId: number, date: string) => {
		try {
			setIsLoadingBookings(true);
			// Use the new user-accessible endpoint: GET /rooms/:id/bookings?date=YYYY-MM-DD
			const response = await api.get(`/rooms/${roomId}/bookings`, {
				params: {
					date: date,
				},
			});

			setRoomBookings(response.data.data || []);
		} catch (error: unknown) {
			console.error('Error fetching room bookings:', error);
			setRoomBookings([]);
		} finally {
			setIsLoadingBookings(false);
		}
	};

	const handleViewAvailability = (room: Room) => {
		setSelectedRoom(room);
		fetchRoomBookings(room.id, availabilityDate);
	};

	const handleDateChange = (newDate: string) => {
		setAvailabilityDate(newDate);
		if (selectedRoom) {
			fetchRoomBookings(selectedRoom.id, newDate);
		}
	};

	const formatTime = (dateTime: string) => {
		const date = new Date(dateTime);
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true,
		});
	};

	const formatBookingTime = (booking: Booking) => {
		return `${formatTime(booking.start_time)} - ${formatTime(
			booking.end_time
		)}`;
	};

	const getAmenityIcon = (amenityName: string) => {
		const name = amenityName.toLowerCase();
		if (name.includes('projector') || name.includes('screen')) return Tv;
		if (name.includes('wifi') || name.includes('internet')) return Wifi;
		if (name.includes('monitor') || name.includes('display')) return Monitor;
		if (name.includes('coffee') || name.includes('refreshment')) return Coffee;
		if (name.includes('phone') || name.includes('conference call'))
			return Phone;
		return DoorOpen;
	};

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-full'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
					<p className='mt-4 text-gray-600 dark:text-gray-400'>
						Loading rooms...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div>
				<h1 className='text-3xl font-bold text-gray-800 dark:text-white'>
					Conference Rooms
				</h1>
				<p className='text-gray-600 dark:text-gray-400 mt-1'>
					Browse available meeting spaces and their amenities
				</p>
			</div>

			<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'>
				<h2 className='text-lg font-semibold mb-4'>Search & Filters</h2>

				{/* Search Bar */}
				<div className='mb-4'>
					<label className='block text-sm font-medium mb-2'>Search</label>
					<div className='relative'>
						<Search
							className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
							size={20}
						/>
						<input
							type='text'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							placeholder='Search by room name, description, or amenities...'
							className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
						/>
					</div>
				</div>

				{/* Filters */}
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div>
						<label className='block text-sm font-medium mb-2'>
							Minimum Capacity
						</label>
						<input
							type='number'
							value={filterCapacity}
							onChange={(e) => setFilterCapacity(e.target.value)}
							placeholder='e.g., 10'
							min='1'
							className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium mb-2'>Floor</label>
						<input
							type='number'
							value={filterFloor}
							onChange={(e) => setFilterFloor(e.target.value)}
							placeholder='e.g., 3'
							min='1'
							className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
						/>
					</div>
				</div>

				{/* Clear filters and results count */}
				<div className='flex items-center justify-between mt-4'>
					<div className='text-sm text-gray-600 dark:text-gray-400'>
						Showing {filteredRooms.length} of {rooms.length} room
						{rooms.length !== 1 ? 's' : ''}
					</div>
					{(searchTerm || filterCapacity || filterFloor) && (
						<button
							onClick={() => {
								setSearchTerm('');
								setFilterCapacity('');
								setFilterFloor('');
							}}
							className='text-sm text-primary-600 dark:text-primary-400 hover:underline'
						>
							Clear all filters
						</button>
					)}
				</div>
			</div>

			{filteredRooms.length === 0 ? (
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center'>
					<DoorOpen
						size={64}
						className='mx-auto text-gray-300 dark:text-gray-600 mb-4'
					/>
					<h2 className='text-xl font-semibold mb-2'>No rooms found</h2>
					<p className='text-gray-600 dark:text-gray-400'>
						{searchTerm || filterCapacity || filterFloor
							? 'Try adjusting your search or filters'
							: 'No rooms available at the moment'}
					</p>
				</div>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
					{filteredRooms.map((room) => {
						return (
							<div
								key={room.id}
								className='bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col'
							>
								<div className='bg-linear-to-br from-primary-500 to-primary-600 p-6 text-white'>
									<div className='flex items-start justify-between'>
										<div>
											<h3 className='text-xl font-bold mb-1'>{room.name}</h3>
											<div className='flex items-center gap-4 text-sm opacity-90'>
												<div className='flex items-center gap-1'>
													<MapPin size={14} />
													<span>Floor {room.floor}</span>
												</div>
												<div className='flex items-center gap-1'>
													<Users size={14} />
													<span>{room.capacity} people</span>
												</div>
											</div>
										</div>
										<div className='p-3 bg-white/20 rounded-lg'>
											<DoorOpen size={24} />
										</div>
									</div>
								</div>

								<div className='p-6 flex-1 flex flex-col'>
									{room.description && (
										<p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
											{room.description}
										</p>
									)}

									<div className='flex-1'>
										{room.amenities && room.amenities.length > 0 && (
											<div>
												<h4 className='text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300'>
													Amenities
												</h4>
												<div className='space-y-2'>
													{room.amenities.map((amenity) => {
														const Icon = getAmenityIcon(amenity.name);
														return (
															<div
																key={amenity.id}
																className='flex items-center gap-2 text-sm'
															>
																<Icon
																	size={16}
																	className='text-primary-600 dark:text-primary-400'
																/>
																<span className='text-gray-700 dark:text-gray-300'>
																	{amenity.name}
																</span>
															</div>
														);
													})}
												</div>
											</div>
										)}

										{(!room.amenities || room.amenities.length === 0) && (
											<p className='text-sm text-gray-500 dark:text-gray-400 italic'>
												No amenities listed
											</p>
										)}
									</div>
								</div>

								<div className='px-6 pb-6'>
									<button
										onClick={() => handleViewAvailability(room)}
										className='w-full py-2 px-4 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50 font-medium transition-colors'
									>
										View Availability
									</button>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* Availability Modal */}
			{selectedRoom && (
				<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
					<div className='bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
						<div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
							<div>
								<h2 className='text-xl font-semibold'>{selectedRoom.name}</h2>
								<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
									Check room availability
								</p>
							</div>
							<button
								onClick={() => setSelectedRoom(null)}
								className='p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'
							>
								<X size={20} />
							</button>
						</div>

						<div className='p-6 space-y-6'>
							{/* Date Picker */}
							<div>
								<label className='block text-sm font-medium mb-2'>
									Select Date
								</label>
								<div className='relative'>
									<Calendar
										className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'
										size={20}
									/>
									<input
										type='date'
										value={availabilityDate}
										onChange={(e) => handleDateChange(e.target.value)}
										min={new Date().toISOString().split('T')[0]}
										className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-primary-500'
									/>
								</div>
							</div>

							{/* Room Info */}
							<div className='bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4'>
								<div className='flex items-center gap-6 text-sm'>
									<div className='flex items-center gap-2'>
										<MapPin size={16} className='text-gray-500' />
										<span>Floor {selectedRoom.floor}</span>
									</div>
									<div className='flex items-center gap-2'>
										<Users size={16} className='text-gray-500' />
										<span>Capacity: {selectedRoom.capacity}</span>
									</div>
								</div>
							</div>

							{/* Bookings List */}
							<div>
								<h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
									<Clock size={20} />
									Bookings for{' '}
									{new Date(availabilityDate).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric',
										year: 'numeric',
									})}
								</h3>

								{isLoadingBookings ? (
									<div className='text-center py-8'>
										<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto'></div>
										<p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
											Loading bookings...
										</p>
									</div>
								) : roomBookings.length === 0 ? (
									<div className='text-center py-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800'>
										<p className='text-green-700 dark:text-green-400 font-medium'>
											No bookings for this date
										</p>
										<p className='text-sm text-green-600 dark:text-green-500 mt-1'>
											Room is available all day (9:00 AM - 5:00 PM)
										</p>
									</div>
								) : (
									<div className='space-y-3'>
										{roomBookings.map((booking) => (
											<div
												key={booking.id}
												className='p-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg'
											>
												<div className='flex items-start justify-between'>
													<div className='flex-1'>
														<h4 className='font-medium text-gray-900 dark:text-white'>
															{booking.title}
														</h4>
														{booking.description && (
															<p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
																{booking.description}
															</p>
														)}
													</div>
												</div>
												<div className='flex items-center gap-2 mt-3 text-sm text-gray-600 dark:text-gray-400'>
													<Clock size={16} />
													<span className='font-medium'>
														{formatBookingTime(booking)}
													</span>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							{/* Business Hours Note */}
							<div className='text-xs text-gray-500 dark:text-gray-400 text-center'>
								Business hours: 9:00 AM - 5:00 PM
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RoomsPage;
