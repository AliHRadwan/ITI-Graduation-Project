import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ROLES } from '@/utils/permissions';

// Auth
import LoginPage from '@/features/auth/LoginPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import UnauthorizedPage from '@/features/auth/UnauthorizedPage';

// Admin Layout & Pages
import AdminLayout from '@/components/layout/AdminLayout';
import AnalyticsDashboard from '@/features/analytics/AnalyticsDashboard';
import TicketList from '@/features/tickets/TicketList';
import TicketDetail from '@/features/tickets/TicketDetail';
import ConversationList from '@/features/conversations/ConversationList';
import ConversationView from '@/features/conversations/ConversationView';
import RoomList from '@/features/rooms/RoomList';
import StaffList from '@/features/staff/StaffList';
import DepartmentList from '@/features/staff/DepartmentList';
import KnowledgeBaseList from '@/features/knowledge/KnowledgeBaseList';

// Staff Layout & Pages
import StaffLayout from '@/components/layout/StaffLayout';
import StaffQueue from '@/features/staff/StaffQueue';
import StaffMetrics from '@/features/staff/StaffMetrics';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  // Admin Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AnalyticsDashboard />,
      },
      {
        path: 'tickets',
        element: <TicketList />,
      },
      {
        path: 'tickets/:id',
        element: <TicketDetail />,
      },
      {
        path: 'conversations',
        element: <ConversationList />,
      },
      {
        path: 'conversations/:id',
        element: <ConversationView />,
      },
      {
        path: 'rooms',
        element: <RoomList />,
      },
      {
        path: 'staff/users',
        element: <StaffList />,
      },
      {
        path: 'staff/departments',
        element: <DepartmentList />,
      },
      {
        path: 'knowledge-base',
        element: <KnowledgeBaseList />,
      },
    ],
  },
  // Staff Routes
  {
    path: '/staff',
    element: (
      <ProtectedRoute>
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'queue',
        element: <StaffQueue />,
      },
      {
        path: 'conversations',
        element: <ConversationList />,
      },
      {
        path: 'conversations/:id',
        element: <ConversationView />,
      },
      {
        path: 'metrics',
        element: <StaffMetrics />,
      },
    ],
  },
]);

export default router;

