# Conference Room Booking System - Frontend

A modern, responsive React frontend for managing conference room bookings. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Authentication**: Login and registration with JWT token management
- **Dashboard**: View next upcoming booking and available rooms for the next time slot
- **Bookings Management**: Create, view, update, and cancel room bookings with invitations
- **Invitations**: Send and receive booking invitations, accept or decline invites
- **Rooms Browser**: View all available rooms with their amenities and capacity
- **Admin Analytics**: Comprehensive analytics dashboard with room utilization, booking trends, and user history
- **Input Validation**: Client-side validation for booking times, date ranges, and phone numbers (South African format)
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Retractable Sidebar**: Collapsible navigation for optimal screen space

## Tech Stack

- **React 19** with TypeScript
- **Vite 7** for fast development and building
- **Tailwind CSS v4** for styling
- **React Router v7** for navigation
- **Axios** for API communication
- **Lucide React** for icons
- **Vitest** for testing
- **React Testing Library** for component testing

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend README)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api
```

Make sure the backend server is running on `http://localhost:3000`.

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Project Structure

```
src/
├── components/
│   ├── auth/              # Login, registration forms, and admin route guard
│   ├── bookings/          # Booking modal with invitations
│   └── layout/            # Sidebar, header, and main layout
├── contexts/
│   ├── AuthContext.tsx    # Authentication state management
│   └── ThemeContext.tsx   # Dark mode state management
├── hooks/
│   └── useBookingValidation.ts  # Custom validation hook
├── lib/
│   ├── api.ts             # Axios configuration with interceptors
│   ├── analytics.ts       # Analytics API functions
│   ├── constants.ts       # Validation constants and rules
│   └── invitations.ts     # Invitations API functions
├── pages/
│   ├── admin/             # Admin-only pages
│   │   ├── AdminAnalyticsOverview.tsx  # Analytics overview
│   │   ├── BookingTrendsPage.tsx       # Booking trends chart
│   │   ├── UserHistoryPage.tsx         # User booking history
│   │   └── UtilizationDashboard.tsx    # Room utilization dashboard
│   ├── BookingsPage.tsx   # Bookings management
│   ├── DashboardPage.tsx  # Dashboard view
│   ├── InvitationsPage.tsx # Invitations management
│   ├── LoginPage.tsx      # Login and registration page
│   └── RoomsPage.tsx      # Rooms browser with availability checker
├── types/
│   └── index.ts           # TypeScript interfaces
├── __tests__/             # Test files
│   ├── components/        # Component tests
│   ├── hooks/             # Hook tests
│   └── lib/               # Library tests
├── test/
│   └── setup.ts           # Test environment setup
├── App.tsx                # Main app component with routing
├── main.tsx               # Application entry point
└── index.css              # Global styles with Tailwind
```

## Features Walkthrough

### Authentication

- Login with existing credentials or register a new account
- Demo admin account: `admin@example.com` / `admin123`
- JWT tokens stored in localStorage
- Automatic redirect on token expiration

### Dashboard

- Shows your next upcoming booking with details
- Displays rooms available for the next 30-minute time slot
- Quick overview of your schedule

### Bookings

- View all your bookings with filters (all/upcoming/past)
- Create new bookings with room selection and time slots
- Invite other users to your bookings
- Edit existing bookings and manage invitees
- Cancel bookings
- Conflict detection with real-time availability checking
- Business hours enforcement (9 AM - 5 PM)
- Duration limits (30 minutes to 4 hours)

### Invitations

- Receive booking invitations from other users
- Accept or decline invitations
- View invitation status (pending/accepted/declined/expired)
- Automatic expiration for past bookings
- Real-time pending invitation badge in header

### Rooms

- Browse all available conference rooms
- Filter by capacity and floor
- Search by room name
- View room amenities (projector, WiFi, monitors, etc.)
- See room capacity and location
- Check real-time availability for specific dates
- View existing bookings on timeline

### Admin Analytics (Admin Users Only)

- **Analytics Overview**: High-level metrics and trends
- **Room Utilization**: Track usage patterns across all rooms
- **Booking Trends**: Visualize booking patterns over time
- **User History**: View detailed booking history for all users
- Date range filters with validation (max 365 days)
- Export-ready data views

### Dark Mode

- Toggle between light and dark themes
- Preference saved in localStorage
- Respects system preference by default

## Input Validation & Security

The application implements comprehensive client-side validation to ensure data integrity and user experience:

### Validation Rules

**Booking Constraints:**

- Minimum duration: 30 minutes
- Maximum duration: 4 hours (240 minutes)
- Business hours: 09:00 - 17:00
- Maximum invitees per booking: 20

**Date Range Constraints:**

- Maximum analytics date range: 365 days
- Start date must be before end date
- Both dates required for range queries

**Phone Number Validation (South African):**

- Landline formats: `012-345-6789`, `012 345 6789`, `0123456789`
- Mobile formats: `071 234 5678`, `0712345678`
- International: `+27 12 345 6789`, `+27123456789`
- Phone field is optional

### Production-Ready Error Handling

All error logging has been sanitized for production to prevent information leakage:

- ✅ No sensitive user data exposed in console logs
- ✅ No API response structures revealed
- ✅ No SQL queries or database information logged
- ✅ Generic error messages for security
- ✅ Silent failures with appropriate user feedback

Validation is implemented in:

- `src/lib/constants.ts` - Centralized validation rules
- `src/hooks/useBookingValidation.ts` - Reusable validation logic
- Component-level validation for real-time feedback

## API Integration

The frontend connects to the backend API for all data operations:

**Authentication:**

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

**Rooms:**

- `GET /rooms` - List all rooms
- `GET /rooms/:id` - Get room details
- `GET /rooms/:id/bookings` - Get room bookings for a specific date

**Bookings:**

- `GET /bookings` - List all bookings (admin only)
- `POST /bookings` - Create a booking
- `GET /bookings/:id` - Get booking details
- `PATCH /bookings/:id` - Update a booking
- `DELETE /bookings/:id` - Cancel a booking
- `GET /users/:id/bookings` - Get user's bookings

**Invitations:**

- `GET /invitations/my-invitations` - Get user's invitations
- `POST /invitations/:bookingId/invitees` - Add invitees to booking
- `DELETE /invitations/:bookingId/invitees/:userId` - Remove invitee
- `GET /invitations/:bookingId/invitees` - Get booking invitees
- `PATCH /invitations/:bookingId/respond` - Accept/decline invitation
- `GET /users` - Search users for invitations

**Analytics (Admin):**

- `GET /analytics/utilization` - Room utilization data
- `GET /analytics/daily-bookings` - Daily booking trends
- `GET /analytics/user-summary` - User booking summary

## Color Scheme

The application uses a professional color palette:

- **Primary**: Blue tones for main actions and navigation
- **Success**: Green tones for confirmations and available status
- **White/Gray**: Clean backgrounds and text
- **Dark Mode**: Carefully balanced dark grays for comfortable viewing

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm test             # Run tests in watch mode
npm run test:ui      # Run tests with UI dashboard
npm run test:coverage # Generate test coverage report
```

## Testing

The application uses **Vitest** and **React Testing Library** for comprehensive testing.

### Test Structure

```
src/
├── __tests__/
│   ├── components/
│   │   ├── BookingModal.test.tsx        # Booking form validation tests
│   │   └── RegisterForm.test.tsx        # Registration form tests
│   ├── hooks/
│   │   └── useBookingValidation.test.ts # Validation hook tests
│   └── lib/
│       └── constants.test.ts            # Constants and patterns tests
└── test/
    └── setup.ts                          # Test environment setup
```

**Total: 50 passing tests**

### Running Tests

**Run all tests in watch mode:**

```bash
npm test
```

**Run tests with interactive UI:**

```bash
npm run test:ui
```

Opens a browser-based UI at `http://localhost:51204/__vitest__/` where you can:

- View test results in real-time
- Filter and search tests
- See code coverage
- Debug failing tests

**Generate coverage report:**

```bash
npm run test:coverage
```

Creates an HTML coverage report in `coverage/` directory.

### Test Coverage

The test suite covers critical functionality:

#### ✅ Validation Tests (100% coverage)

**Phone Number Validation:**

- ✓ South African landline formats: `012-345-6789`
- ✓ Mobile formats: `071 234 5678`, `0712345678`
- ✓ International formats: `+27 12 345 6789`, `+27123456789`
- ✓ Rejects invalid formats and international numbers
- ✓ Allows empty phone (optional field)

**Booking Time Validation:**

- ✓ Minimum duration: 30 minutes
- ✓ Maximum duration: 4 hours
- ✓ Business hours: 09:00 - 17:00
- ✓ End time after start time
- ✓ Required fields validation
- ✓ Edge cases (exactly 30 min, exactly 4 hours)

**Date Range Validation:**

- ✓ Maximum range: 365 days
- ✓ Start date before end date
- ✓ Both dates required together
- ✓ Edge case: exactly 365 days allowed

#### ✅ Component Tests

**RegisterForm:**

- ✓ Renders all form fields correctly
- ✓ Validates South African phone numbers
- ✓ Accepts valid phone formats
- ✓ Allows optional phone field
- ✓ Displays API error messages
- ✓ Navigates on successful registration
- ✓ Calls switch to login callback

**BookingModal:**

- ✓ Renders booking form with all fields
- ✓ Displays business hours information
- ✓ Shows invitation options
- ✓ Includes cancel and create buttons

### Test Configuration

**vitest.config.ts:**

- Uses `happy-dom` for fast DOM simulation
- Global test utilities available
- Coverage reporting with v8 provider
- HTML, JSON, and text coverage formats

**Test Setup (src/test/setup.ts):**

- Includes `@testing-library/jest-dom` matchers
- Automatic cleanup after each test
- Custom matchers for better assertions

### Writing New Tests

Example test structure:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import YourComponent from './YourComponent';

describe('YourComponent', () => {
	it('should render correctly', () => {
		render(<YourComponent />);
		expect(screen.getByText('Expected Text')).toBeInTheDocument();
	});

	it('should handle user interaction', async () => {
		render(<YourComponent />);
		const button = screen.getByRole('button');
		fireEvent.click(button);
		// Add assertions
	});
});
```

### Continuous Integration

Tests can be integrated into CI/CD pipelines:

```bash
# Run tests once (non-interactive)
npm test -- --run

# Generate coverage and fail if below threshold
npm run test:coverage -- --coverage.statements=80
```

### Coverage Thresholds

Current coverage targets:

- **Validation logic**: 100% (critical for data integrity)
- **Form components**: 90%+ (user input validation)
- **API integration**: 80%+ (mocked network calls)
- **UI components**: 70%+ (visual components)

### Best Practices

1. **Test behavior, not implementation** - Test what users see and do
2. **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Mock external dependencies** - API calls, context providers, routers
4. **Test edge cases** - Minimum/maximum values, empty states, errors
5. **Keep tests isolated** - Each test should run independently
6. **Descriptive test names** - Clearly state what is being tested

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC
