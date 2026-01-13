import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import useAuthStore from '@/store/authStore';
import { ROLES, isManagerOrAdmin } from '@/utils/permissions';

// Auth
import LoginPage from '@/features/auth/LoginPage';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';
import UnauthorizedPage from '@/features/auth/UnauthorizedPage';
import AcceptInvitePage from '@/features/auth/AcceptInvitePage';

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
import AdminSettings from '@/features/settings/AdminSettings';
import AttachmentsList from '@/features/attachments/AttachmentsList';
import NotificationsLog from '@/features/notifications/NotificationsLog';

// Staff Layout & Pages
import StaffLayout from '@/components/layout/StaffLayout';
import StaffQueue from '@/features/staff/StaffQueue';
import StaffActionCenter from '@/features/staff/StaffActionCenter';
import StaffMetrics from '@/features/staff/StaffMetrics';
import StaffSettings from '@/features/settings/StaffSettings';

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return isManagerOrAdmin(user) ? (
    <Navigate to="/admin/dashboard" replace />
  ) : (
    <Navigate to="/staff/queue" replace />
  );
}

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
    path: '/accept-invite',
    element: <AcceptInvitePage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/',
    element: <RootRedirect />,
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
        path: 'attachments',
        element: <AttachmentsList />,
      },
      {
        path: 'notifications-logs',
        element: <NotificationsLog />,
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
      {
        path: 'settings',
        element: <AdminSettings />,
      },
    ],
  },
  // Staff Routes
  {
    path: '/staff',
    element: (
      <ProtectedRoute allowedRoles={[ROLES.STAFF, ROLES.READONLY]}>
        <StaffLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'queue',
        element: <StaffQueue />,
      },
      {
        path: 'action-center',
        element: <StaffActionCenter />,
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
      {
        path: 'settings',
        element: <StaffSettings />,
      },
      {
        path: 'tickets/:id',
        element: <TicketDetail />,
      },
    ],
  },
]);

export default router;
