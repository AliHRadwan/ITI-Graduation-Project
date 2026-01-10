import { Link } from 'react-router-dom';
import { Button, Card } from '@/components/ui';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import useAuthStore from '@/store/authStore';
import { isManagerOrAdmin, isStaffRole } from '@/utils/permissions';

export default function UnauthorizedPage() {
  const user = useAuthStore((state) => state.user);
  const dashboardPath = isManagerOrAdmin(user)
    ? '/admin/dashboard'
    : isStaffRole(user)
      ? '/staff/queue'
      : '/login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8 text-center">
        <ShieldExclamationIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <Link to={dashboardPath}>
          <Button variant="primary">Go to Dashboard</Button>
        </Link>
      </Card>
    </div>
  );
}
