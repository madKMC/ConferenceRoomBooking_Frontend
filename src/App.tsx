import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import AdminRoute from './components/auth/AdminRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BookingsPage from './pages/BookingsPage';
import RoomsPage from './pages/RoomsPage';
import InvitationsPage from './pages/InvitationsPage';
import AdminAnalyticsOverview from './pages/admin/AdminAnalyticsOverview';
import UtilizationDashboard from './pages/admin/UtilizationDashboard';
import BookingTrendsPage from './pages/admin/BookingTrendsPage';
import UserHistoryPage from './pages/admin/UserHistoryPage';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
	const { user, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
			</div>
		);
	}

	return user ? <>{children}</> : <Navigate to='/' />;
};

const AppRoutes = () => {
	const { user } = useAuth();

	return (
		<Routes>
			<Route
				path='/'
				element={user ? <Navigate to='/dashboard' /> : <LoginPage />}
			/>
			<Route
				path='/dashboard'
				element={
					<PrivateRoute>
						<Layout>
							<DashboardPage />
						</Layout>
					</PrivateRoute>
				}
			/>
			<Route
				path='/bookings'
				element={
					<PrivateRoute>
						<Layout>
							<BookingsPage />
						</Layout>
					</PrivateRoute>
				}
			/>
			<Route
				path='/rooms'
				element={
					<PrivateRoute>
						<Layout>
							<RoomsPage />
						</Layout>
					</PrivateRoute>
				}
			/>
			<Route
				path='/invitations'
				element={
					<PrivateRoute>
						<Layout>
							<InvitationsPage />
						</Layout>
					</PrivateRoute>
				}
			/>
			<Route
				path='/admin/analytics'
				element={
					<PrivateRoute>
						<AdminRoute>
							<Layout>
								<AdminAnalyticsOverview />
							</Layout>
						</AdminRoute>
					</PrivateRoute>
				}
			/>
			<Route
				path='/admin/analytics/utilization'
				element={
					<PrivateRoute>
						<AdminRoute>
							<Layout>
								<UtilizationDashboard />
							</Layout>
						</AdminRoute>
					</PrivateRoute>
				}
			/>
			<Route
				path='/admin/analytics/booking-trends'
				element={
					<PrivateRoute>
						<AdminRoute>
							<Layout>
								<BookingTrendsPage />
							</Layout>
						</AdminRoute>
					</PrivateRoute>
				}
			/>
			<Route
				path='/admin/analytics/user-history'
				element={
					<PrivateRoute>
						<AdminRoute>
							<Layout>
								<UserHistoryPage />
							</Layout>
						</AdminRoute>
					</PrivateRoute>
				}
			/>
			<Route path='*' element={<Navigate to='/' />} />
		</Routes>
	);
};

function App() {
	return (
		<BrowserRouter>
			<ThemeProvider>
				<AuthProvider>
					<AppRoutes />
				</AuthProvider>
			</ThemeProvider>
		</BrowserRouter>
	);
}

export default App;
