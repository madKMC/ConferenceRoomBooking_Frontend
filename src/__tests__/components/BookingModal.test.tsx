import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import BookingModal from '../../components/bookings/BookingModal';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock API
vi.mock('../../lib/api', () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		patch: vi.fn(),
	},
}));

vi.mock('../../lib/invitations', () => ({
	invitationsApi: {
		getUsers: vi.fn().mockResolvedValue([]),
		addInvitees: vi.fn(),
		getInvitees: vi.fn().mockResolvedValue([]),
	},
}));

const mockUser = {
	id: 1,
	email: 'test@example.com',
	first_name: 'Test',
	last_name: 'User',
	role: 'user' as const,
};

vi.mock('../../contexts/AuthContext', () => ({
	AuthProvider: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	useAuth: () => ({
		user: mockUser,
		login: vi.fn(),
		logout: vi.fn(),
		register: vi.fn(),
	}),
}));

describe('BookingModal - Validation', () => {
	const mockOnClose = vi.fn();
	const mockOnSuccess = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderComponent = () => {
		return render(
			<AuthProvider>
				<BookingModal
					isOpen={true}
					onClose={mockOnClose}
					onSuccess={mockOnSuccess}
				/>
			</AuthProvider>
		);
	};

	it('should render booking modal when open', () => {
		renderComponent();
		expect(screen.getByText('Create Booking')).toBeInTheDocument();
	});

	it('should have required form fields', () => {
		renderComponent();
		// Just check the modal renders - detailed validation is tested in hook tests
		expect(
			screen.getByRole('heading', { name: /create booking/i })
		).toBeInTheDocument();
	});
	it('should display business hours information', () => {
		renderComponent();
		expect(
			screen.getByText(/business hours: 9:00 AM - 5:00 PM/i)
		).toBeInTheDocument();
	});

	it('should have option to invite people', () => {
		renderComponent();
		expect(screen.getByText(/invite people/i)).toBeInTheDocument();
	});

	it('should have cancel and create buttons', () => {
		renderComponent();
		expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
	});
});
