import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { hasRole, isStaffRole } from '@/utils/permissions';

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(user, allowedRoles)) {
    if (isStaffRole(user)) {
      return <Navigate to="/staff/queue" replace />;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
