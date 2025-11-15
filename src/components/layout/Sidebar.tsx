import { NavLink } from 'react-router-dom';
import {
	LayoutDashboard,
	Calendar,
	DoorOpen,
	Bell,
	BarChart3,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
	isOpen?: boolean;
	onClose?: () => void;
}

const Sidebar = ({ isOpen: isOpenProp, onClose }: SidebarProps) => {
	const [isOpenDesktop] = useState(true);
	const { user } = useAuth();

	// On mobile, use prop; on desktop, use local state
	const isOpen = typeof isOpenProp !== 'undefined' ? isOpenProp : isOpenDesktop;

	const navItems = [
		{ to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
		{ to: '/bookings', icon: Calendar, label: 'Bookings' },
		{ to: '/rooms', icon: DoorOpen, label: 'Rooms' },
		{ to: '/invitations', icon: Bell, label: 'Invitations' },
	];

	const adminNavItems = [
		{ to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
	];

	return (
		<>
			<aside
				className={`fixed left-0 top-[57px] h-[calc(100vh-57px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-30 overflow-hidden ${
					isOpen ? 'w-64' : 'w-0 lg:w-16'
				}`}
			>
				<div className='flex flex-col h-full w-64 lg:w-full'>
					<nav
						className={`flex-1 p-4 space-y-2 ${!isOpen && 'hidden lg:block'}`}
					>
						{navItems.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
										isActive
											? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
											: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
									} ${!isOpen && 'lg:justify-center lg:px-2'}`
								}
								title={!isOpen ? item.label : ''}
							>
								<item.icon
									size={20}
									className={!isOpen ? 'lg:scale-110' : ''}
								/>
								<span className={!isOpen ? 'lg:hidden' : ''}>{item.label}</span>
							</NavLink>
						))}

						{user?.role === 'admin' && (
							<>
								<div className='border-t border-gray-200 dark:border-gray-700 my-2 pt-2'>
									{!isOpen && (
										<div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2 lg:hidden'>
											Admin
										</div>
									)}
									{isOpen && (
										<div className='text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 mb-2'>
											Admin
										</div>
									)}
								</div>
								{adminNavItems.map((item) => (
									<NavLink
										key={item.to}
										to={item.to}
										className={({ isActive }) =>
											`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
												isActive
													? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-semibold'
													: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
											} ${!isOpen && 'lg:justify-center lg:px-2'}`
										}
										title={!isOpen ? item.label : ''}
									>
										<item.icon
											size={20}
											className={!isOpen ? 'lg:scale-110' : ''}
										/>
										<span className={!isOpen ? 'lg:hidden' : ''}>
											{item.label}
										</span>
									</NavLink>
								))}
							</>
						)}
					</nav>
				</div>
			</aside>
			{isOpen && onClose && (
				<div
					className='fixed inset-0 bg-black/50 z-20 lg:hidden'
					onClick={onClose}
				/>
			)}
		</>
	);
};

export default Sidebar;
