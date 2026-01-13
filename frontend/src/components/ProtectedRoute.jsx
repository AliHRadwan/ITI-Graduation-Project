import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { hasRole, isStaffRole, isManagerOrAdmin } from '@/utils/permissions';

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has any memberships/roles at all
  const hasMemberships = user?.memberships && user.memberships.length > 0;
  
  if (!hasMemberships) {
    // User is authenticated but has no roles assigned
    // Clear the auth state and redirect to login
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(user, allowedRoles)) {
    // User has roles but not the required ones for this route
    if (isStaffRole(user)) {
      return <Navigate to="/staff/queue" replace />;
    }
    if (isManagerOrAdmin(user)) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
