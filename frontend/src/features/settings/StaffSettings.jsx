import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authAPI } from '@/api';
import { Card, CardHeader, CardTitle, CardContent, Spinner, Tabs, TabList, TabButton, TabPanels, TabPanel, Button } from '@/components/ui';
import useAuthStore from '@/store/authStore';
import { useTheme } from '@/context/ThemeContext';

export default function StaffSettings() {
  const localUser = useAuthStore((state) => state.user);
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Profile information</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs selectedIndex={activeTab} onChange={setActiveTab}>
            <div className="border-b border-gray-200 px-4 py-3">
              <TabList className="border-b-0">
                <TabButton>Profile</TabButton>
                <TabButton>Theme</TabButton>
              </TabList>
            </div>
            <TabPanels>
              <TabPanel>
                <div className="p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Name</div>
                          <div className="font-medium">{user?.name || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Email</div>
                          <div className="font-medium">{user?.email || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Role</div>
                          <div className="font-medium">
                            {memberships[0]?.role || memberships[0]?.staff_role?.name || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Department</div>
                          <div className="font-medium">
                            {memberships[0]?.department || memberships[0]?.department?.name || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabPanel>
              <TabPanel>
                <div className="p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Theme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Appearance</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            Choose Light or Dark mode for the dashboard.
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={theme === 'light' ? 'primary' : 'secondary'}
                            onClick={() => setTheme('light')}
                          >
                            Light
                          </Button>
                          <Button
                            size="sm"
                            variant={theme === 'dark' ? 'primary' : 'secondary'}
                            onClick={() => setTheme('dark')}
                          >
                            Dark
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
