# Conference Room Booking System - Frontend

A modern, responsive React frontend for managing conference room bookings. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Authentication**: Login and registration with JWT token management
- **Dashboard**: View next upcoming booking and available rooms for the next time slot
- **Bookings Management**: Create, view, update, and cancel room bookings
- **Rooms Browser**: View all available rooms with their amenities and capacity
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Retractable Sidebar**: Collapsible navigation for optimal screen space

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Lucide React** for icons

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
│   ├── auth/              # Login and registration forms
│   ├── bookings/          # Booking modal and components
│   ├── layout/            # Sidebar, header, and main layout
│   └── rooms/             # Room-related components
├── contexts/
│   ├── AuthContext.tsx    # Authentication state management
│   └── ThemeContext.tsx   # Dark mode state management
├── lib/
│   └── api.ts             # Axios configuration with interceptors
├── pages/
│   ├── DashboardPage.tsx  # Dashboard view
│   ├── BookingsPage.tsx   # Bookings management
│   ├── LoginPage.tsx      # Login and registration page
│   └── RoomsPage.tsx      # Rooms browser
├── types/
│   └── index.ts           # TypeScript interfaces
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
- Edit existing bookings
- Cancel bookings
- Business hours enforcement (9 AM - 5 PM)

### Rooms

- Browse all available conference rooms
- Filter by capacity and floor
- View room amenities (projector, WiFi, monitors, etc.)
- See room capacity and location

### Dark Mode

- Toggle between light and dark themes
- Preference saved in localStorage
- Respects system preference by default

## API Integration

The frontend connects to the backend API for all data operations:

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user
- `GET /rooms` - List all rooms
- `GET /rooms/:id/availability` - Check room availability
- `GET /bookings` - List all bookings (admin only)
- `POST /bookings` - Create a booking
- `GET /bookings/:id` - Get booking details
- `PATCH /bookings/:id` - Update a booking
- `DELETE /bookings/:id` - Cancel a booking
- `GET /users/:id/bookings` - Get user's bookings

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

- ✓ Enforces 30-minute minimum duration
- ✓ Enforces 4-hour maximum duration
- ✓ Enforces business hours (09:00 start)
- ✓ Enforces business hours (17:00 end)
- ✓ Requires title field
- ✓ Validates time logic (end > start)

**UtilizationDashboard:**

- ✓ Requires both start and end dates
- ✓ Rejects start after end
- ✓ Rejects ranges > 365 days
- ✓ Accepts valid date ranges
- ✓ Calls API with correct parameters

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
