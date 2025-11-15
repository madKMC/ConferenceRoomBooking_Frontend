import type { ReactNode } from 'react';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
	children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	const closeSidebar = () => {
		setIsSidebarOpen(false);
	};

	return (
		<div className='flex flex-col h-screen overflow-hidden'>
			<Header onToggleSidebar={toggleSidebar} />
			<div className='flex flex-1 overflow-hidden'>
				<Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
				<main className='flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 p-6'>
					{children}
				</main>
			</div>
		</div>
	);
};

export default Layout;
