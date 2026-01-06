import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { hasRole } from '@/utils/permissions';

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(user, allowedRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

