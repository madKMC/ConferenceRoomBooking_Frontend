import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRouteProps {
	children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
			</div>
		);
	}

	if (!user) {
		return <Navigate to='/' replace />;
	}

	if (user.role !== 'admin') {
		return (
			<div className='flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900'>
				<div className='bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md text-center'>
					<div className='mb-4'>
						<svg
							className='mx-auto h-12 w-12 text-red-500'
							fill='none'
							viewBox='0 0 24 24'
							stroke='currentColor'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
							/>
						</svg>
					</div>
					<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
						Access Denied
					</h2>
					<p className='text-gray-600 dark:text-gray-400 mb-6'>
						You don't have permission to access this page. Admin access is
						required.
					</p>
					<button
						onClick={() => (window.location.href = '/dashboard')}
						className='px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors'
					>
						Go to Dashboard
					</button>
				</div>
			</div>
		);
	}

	return <>{children}</>;
};

export default AdminRoute;
