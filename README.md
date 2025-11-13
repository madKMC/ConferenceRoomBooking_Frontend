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
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC
