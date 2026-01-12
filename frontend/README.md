# Hotel AI Concierge - Frontend

A modern React-based frontend for the Hotel AI Concierge system with multi-dashboard support for Admin and Staff roles.

## Features

- **Admin Dashboard**: Analytics, tickets, conversations, rooms, and staff management
- **Staff Dashboard**: Personal ticket queue and performance metrics
- **Real-time Updates**: Automatic polling for live data
- **Responsive Design**: Mobile-first, works on all devices
- **Authentication**: Role-based access control with Laravel Sanctum
- **Modern UI**: Built with Tailwind CSS and Headless UI

## Tech Stack

- React 19
- React Router v7
- Tailwind CSS
- Headless UI
- React Query (TanStack Query)
- Zustand (State Management)
- Recharts (Analytics)
- React Hook Form + Zod (Form Validation)
- Axios (API Client)
- date-fns (Date Formatting)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8001

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Start development server:

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── api/              # API client and endpoint modules
├── components/       # Reusable components
│   ├── ui/          # UI component library
│   └── layout/      # Layout components
├── features/        # Feature modules
│   ├── auth/
│   ├── analytics/
│   ├── tickets/
│   ├── conversations/
│   ├── rooms/
│   └── staff/
├── hooks/           # Custom React hooks
├── store/           # Zustand stores
├── utils/           # Helper functions
├── routes/          # Route definitions
└── App.jsx          # Main app component
```

## Available Routes

### Public
- `/login` - Login page
- `/forgot-password` - Password reset

### Admin (Requires Admin/Manager role)
- `/admin/dashboard` - Analytics dashboard
- `/admin/tickets` - Ticket management
- `/admin/conversations` - Guest conversations
- `/admin/rooms` - Room management
- `/admin/staff/users` - Staff management
- `/admin/staff/departments` - Department management

### Staff
- `/staff/queue` - Personal ticket queue
- `/staff/conversations` - Active conversations
- `/staff/metrics` - Personal performance metrics

## Real-time Updates

The application uses polling for real-time updates:
- **Dashboard metrics**: Every 30 seconds
- **Tickets**: Every 15 seconds
- **Conversations**: Every 5 seconds

## Authentication

Uses Laravel Sanctum for authentication. Tokens are stored in localStorage and automatically included in API requests.

## Development

### Linting

```bash
npm run lint
```

### Code Style

The project uses ESLint with React-specific rules. Please ensure your code passes linting before committing.

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:8001/api)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
