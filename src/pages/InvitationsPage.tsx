import { useEffect, useState } from 'react';
import {
	Bell,
	Calendar,
	Clock,
	DoorOpen,
	CheckCircle,
	XCircle,
	AlertCircle,
} from 'lucide-react';
import { invitationsApi } from '../lib/invitations';
import type { Invitation } from '../types';

const InvitationsPage = () => {
	const [invitations, setInvitations] = useState<Invitation[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [filter, setFilter] = useState<
		'all' | 'pending' | 'accepted' | 'declined' | 'expired'
	>('all');

	useEffect(() => {
		fetchInvitations();
	}, []);

	const fetchInvitations = async () => {
		try {
			setIsLoading(true);
			const data = await invitationsApi.getMyInvitations();
			setInvitations(data);
		} catch (error) {
			console.error('Error fetching invitations:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRespond = async (
		bookingId: number,
		status: 'accepted' | 'declined'
	) => {
		try {
			await invitationsApi.respondToInvitation(bookingId, status);
			await fetchInvitations();
		} catch (error) {
			console.error('Error responding to invitation:', error);
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

	const filteredInvitations =
		filter === 'all'
			? invitations
			: invitations.filter(
					(inv) => (inv.display_status || inv.status) === filter
			  );

	const pendingCount = invitations.filter(
		(inv) =>
			inv.status === 'pending' &&
			(inv.display_status || inv.status) !== 'expired'
	).length;

	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-full'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto'></div>
					<p className='mt-4 text-gray-600 dark:text-gray-400'>
						Loading invitations...
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
						Invitations
					</h1>
					<p className='text-gray-600 dark:text-gray-400 mt-1'>
						Manage your booking invitations
					</p>
				</div>
				{pendingCount > 0 && (
					<div className='px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'>
						<span className='font-semibold'>{pendingCount}</span> pending
					</div>
				)}
			</div>

			{/* Filter Tabs */}
			<div className='flex gap-2 border-b border-gray-200 dark:border-gray-700'>
				{(['all', 'pending', 'accepted', 'declined', 'expired'] as const).map(
					(filterOption) => (
						<button
							key={filterOption}
							onClick={() => setFilter(filterOption)}
							className={`px-4 py-2 font-medium capitalize transition-colors border-b-2 ${
								filter === filterOption
									? 'border-primary-600 text-primary-600 dark:text-primary-400'
									: 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
							}`}
						>
							{filterOption}
							{filterOption !== 'all' && (
								<span className='ml-2 text-sm'>
									(
									{
										invitations.filter(
											(inv) =>
												(inv.display_status || inv.status) === filterOption
										).length
									}
									)
								</span>
							)}
						</button>
					)
				)}
			</div>

			{/* Invitations List */}
			{filteredInvitations.length > 0 ? (
				<div className='space-y-4'>
					{filteredInvitations.map((invitation) => (
						<div
							key={invitation.id || invitation.booking_id}
							className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6'
						>
							<div className='flex items-start justify-between mb-4'>
								<div className='flex items-start gap-3'>
									<div
										className={`p-2 rounded-lg ${
											(invitation.display_status || invitation.status) ===
											'expired'
												? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
												: invitation.status === 'pending'
												? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
												: invitation.status === 'accepted'
												? 'bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400'
												: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
										}`}
									>
										{(invitation.display_status || invitation.status) ===
										'expired' ? (
											<Clock size={24} />
										) : invitation.status === 'pending' ? (
											<AlertCircle size={24} />
										) : invitation.status === 'accepted' ? (
											<CheckCircle size={24} />
										) : (
											<XCircle size={24} />
										)}
									</div>
									<div>
										<h3 className='font-semibold text-lg'>
											{invitation.booking?.title}
										</h3>
										{invitation.booking?.description && (
											<p className='text-gray-600 dark:text-gray-400 text-sm mt-1'>
												{invitation.booking.description}
											</p>
										)}
									</div>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
										(invitation.display_status || invitation.status) ===
										'expired'
											? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
											: invitation.status === 'pending'
											? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
											: invitation.status === 'accepted'
											? 'bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300'
											: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
									}`}
								>
									{invitation.display_status || invitation.status}
								</span>
							</div>

							<div className='space-y-2 mb-4'>
								<div className='flex items-center gap-2 text-sm'>
									<DoorOpen size={16} className='text-gray-500' />
									<span className='font-medium'>
										{invitation.booking?.room_name ||
											invitation.booking?.room?.name ||
											'Room information unavailable'}
									</span>
								</div>{' '}
								<div className='flex items-center gap-2 text-sm'>
									<Clock size={16} className='text-gray-500' />
									<span>
										{invitation.booking?.start_time &&
											formatDateTime(invitation.booking.start_time).date}{' '}
										at{' '}
										{invitation.booking?.start_time &&
											formatDateTime(invitation.booking.start_time).time}
									</span>
								</div>
								<div className='flex items-center gap-2 text-sm'>
									<Calendar size={16} className='text-gray-500' />
									<span className='text-gray-600 dark:text-gray-400'>
										Invited{' '}
										{new Date(invitation.invited_at).toLocaleDateString()}
									</span>
								</div>
							</div>

							{invitation.status === 'pending' &&
								(invitation.display_status || invitation.status) !==
									'expired' && (
									<div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
										<div className='flex gap-3'>
											<button
												onClick={() =>
													handleRespond(invitation.booking_id, 'accepted')
												}
												className='flex-1 px-4 py-2 rounded-lg bg-success-600 text-white hover:bg-success-700 transition-colors font-medium'
											>
												Accept
											</button>
											<button
												onClick={() =>
													handleRespond(invitation.booking_id, 'declined')
												}
												className='flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium'
											>
												Decline
											</button>
										</div>
									</div>
								)}

							{invitation.status === 'pending' &&
								(invitation.display_status || invitation.status) ===
									'expired' && (
									<div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
										<div className='p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm text-center'>
											<Clock size={16} className='inline mr-2' />
											This invitation has expired - the booking has already
											started
										</div>
									</div>
								)}

							{invitation.responded_at && (
								<div className='pt-4 border-t border-gray-200 dark:border-gray-700'>
									<p className='text-xs text-gray-500'>
										Responded on{' '}
										{new Date(invitation.responded_at).toLocaleString()}
									</p>
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center'>
					<Bell
						size={48}
						className='mx-auto text-gray-300 dark:text-gray-600 mb-3'
					/>
					<p className='text-gray-600 dark:text-gray-400'>
						No {filter !== 'all' ? filter : ''} invitations
					</p>
					<p className='text-sm text-gray-500 dark:text-gray-500 mt-1'>
						You'll see booking invitations here
					</p>
				</div>
			)}
		</div>
	);
};

export default InvitationsPage;
