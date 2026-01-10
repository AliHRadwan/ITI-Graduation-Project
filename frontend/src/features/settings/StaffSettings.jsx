import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/api';
import { Card, CardHeader, CardTitle, CardContent, Spinner } from '@/components/ui';
import useAuthStore from '@/store/authStore';

export default function StaffSettings() {
  const localUser = useAuthStore((state) => state.user);
  const { data, isLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: authAPI.me,
  });

  const user = data?.user || data || localUser;
  const memberships = user?.memberships || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <div className="text-gray-500">Name</div>
              <div className="font-medium">{user?.name || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500">Email</div>
              <div className="font-medium">{user?.email || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500">Role</div>
              <div className="font-medium">
                {memberships[0]?.role || memberships[0]?.staff_role?.name || 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Department</div>
              <div className="font-medium">
                {memberships[0]?.department || memberships[0]?.department?.name || 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
