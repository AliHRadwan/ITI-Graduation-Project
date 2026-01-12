# Hotel AI Concierge Frontend - Setup Guide

## Prerequisites

- Node.js 18+ and npm
- Backend API running on http://localhost:8001

## Installation Steps

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install all required packages including:
- React 19
- React Router
- Tailwind CSS
- Headless UI
- React Query
- Zustand
- Recharts
- And more...

### 2. Configure Environment (Optional)

If your backend runs on a different port, create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` and update the API URL:

```
VITE_API_URL=http://localhost:YOUR_PORT/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will start at http://localhost:5173

### 4. Login Credentials

Use the credentials from your Laravel backend. Default admin credentials should be:
- Email: admin@hotel.com
- Password: (as configured in your backend seeders)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Default Routes

### Admin Dashboard
- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/admin/dashboard
- **Tickets**: http://localhost:5173/admin/tickets
- **Conversations**: http://localhost:5173/admin/conversations
- **Rooms**: http://localhost:5173/admin/rooms
- **Staff**: http://localhost:5173/admin/staff/users
- **Departments**: http://localhost:5173/admin/staff/departments

### Staff Dashboard
- **Queue**: http://localhost:5173/staff/queue
- **Conversations**: http://localhost:5173/staff/conversations
- **Metrics**: http://localhost:5173/staff/metrics

## Troubleshooting

### API Connection Issues

If you see network errors:
1. Ensure backend is running on port 8001
2. Check CORS is enabled in Laravel backend
3. Verify Vite proxy configuration in `vite.config.js`

### Build Errors

If you encounter build errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use

If port 5173 is taken:
```bash
npm run dev -- --port 3000
```

## Features Overview

### Admin Features
- ✅ Analytics dashboard with real-time metrics
- ✅ Ticket management (create, assign, update status)
- ✅ Live conversation interface with handoff
- ✅ Room management with QR code generation
- ✅ Staff and department management
- ✅ Invite staff members

### Staff Features
- ✅ Personal ticket queue
- ✅ Active conversations
- ✅ Performance metrics

### Real-time Updates
- Dashboard metrics: Every 30 seconds
- Tickets: Every 15 seconds
- Conversations: Every 5 seconds

### Authentication
- Role-based access control
- Laravel Sanctum integration
- Automatic token refresh
- Protected routes

## Next Steps

1. **Seed Sample Data**: Use Laravel seeders to create test data
2. **Configure N8N**: Set up the AI chatbot integration
3. **Test Flows**: Try creating tickets, managing conversations
4. **Customize**: Adjust colors, branding in `tailwind.config.js`

## Production Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

### Deploy to Hosting

You can deploy to:
- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **Static Hosting**: Upload `dist/` folder

### Environment Variables

Set these in your hosting platform:
- `VITE_API_URL` - Your production API URL

## Support

For issues or questions:
1. Check the backend is running and accessible
2. Review browser console for errors
3. Check network tab for failed API calls
4. Verify authentication tokens are being sent

## License

MIT

