import { LogOut, User, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { invitationsApi } from '../../lib/invitations';

const Header = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [pendingCount, setPendingCount] = useState(0);

	useEffect(() => {
		if (user) {
			fetchPendingInvitations();
			// Poll for new invitations every 30 seconds
			const interval = setInterval(fetchPendingInvitations, 30000);
			return () => clearInterval(interval);
		}
	}, [user]);

	const fetchPendingInvitations = async () => {
		try {
			const invitations = await invitationsApi.getMyInvitations();
			const pending = invitations.filter(
				(inv) =>
					inv.status === 'pending' &&
					(inv.display_status || inv.status) !== 'expired'
			).length;
			setPendingCount(pending);
		} catch (error) {
			console.error('Error fetching invitations:', error);
		}
	};

	return (
		<header className='sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4'>
			<div className='flex items-center justify-between'>
				<div className='flex items-center gap-4'>
					<h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
						Room Booking System
					</h2>
				</div>

				<div className='flex items-center gap-4'>
					{user && (
						<>
							<button
								onClick={() => navigate('/invitations')}
								className='relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
								aria-label='Invitations'
							>
								<Bell size={20} />
								{pendingCount > 0 && (
									<span className='absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full'>
										{pendingCount > 9 ? '9+' : pendingCount}
									</span>
								)}
							</button>

							<div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700'>
								<User size={18} />
								<span className='text-sm font-medium'>
									{user.first_name} {user.last_name}
								</span>
								{user.role === 'admin' && (
									<span className='px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'>
										Admin
									</span>
								)}
							</div>

							<button
								onClick={logout}
								className='flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors'
							>
								<LogOut size={18} />
								<span className='hidden sm:inline'>Logout</span>
							</button>
						</>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
