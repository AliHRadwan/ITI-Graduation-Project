import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { slaAPI, departmentsAPI, authAPI } from '@/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Spinner, Pagination, Tabs, TabList, TabButton, TabPanels, TabPanel, Badge } from '@/components/ui';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import useAuthStore from '@/store/authStore';

const emptyPolicy = {
  id: null,
  department_id: '',
  first_response_minutes: '',
  resolution_minutes: '',
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyForm, setPolicyForm] = useState(emptyPolicy);
  const { theme, setTheme } = useTheme();
  const localUser = useAuthStore((state) => state.user);

  const { data: policiesData, isLoading } = useQuery({
    queryKey: ['sla-policies', page],
    queryFn: () => slaAPI.getPolicies({ page }),
  });

  const { data: meData } = useQuery({
    queryKey: ['auth-me'],
    queryFn: authAPI.me,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsAPI.getDepartments,
  });

  const { data: breachesData } = useQuery({
    queryKey: ['sla-breaches'],
    queryFn: slaAPI.getBreaches,
  });

  const policies = policiesData?.items || [];
  const pagination = policiesData?.pagination || null;
  const departments = departmentsData?.items || [];
  const user = meData?.user || meData || localUser;
  const memberships = user?.memberships || [];

  const handleOpenCreate = () => {
    setPolicyForm(emptyPolicy);
    setShowPolicyModal(true);
  };

  const handleOpenEdit = (policy) => {
    setPolicyForm({
      id: policy.id,
      department_id: policy.department_id,
      first_response_minutes: policy.first_response_minutes ?? '',
      resolution_minutes: policy.resolution_minutes ?? '',
    });
    setShowPolicyModal(true);
  };

  const policyMutation = useMutation({
    mutationFn: (payload) => {
      const data = {
        department_id: payload.department_id,
        first_response_minutes: Number(payload.first_response_minutes),
        resolution_minutes: Number(payload.resolution_minutes),
      };
      if (payload.id) {
        return slaAPI.updatePolicy(payload.id, data);
      }
      return slaAPI.createPolicy(data);
    },
    onSuccess: () => {
      toast.success('SLA policy saved');
      setShowPolicyModal(false);
      queryClient.invalidateQueries(['sla-policies']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save SLA policy');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => slaAPI.deactivatePolicy(id),
    onSuccess: () => {
      toast.success('Policy deactivated');
      queryClient.invalidateQueries(['sla-policies']);
    },
    onError: () => toast.error('Failed to deactivate policy'),
  });

  const breachesSummary = useMemo(() => {
    return {
      firstResponse: breachesData?.first_response_breaches || [],
      resolution: breachesData?.resolution_breaches || [],
    };
  }, [breachesData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage SLA policies and staff access</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Tabs selectedIndex={activeTab} onChange={setActiveTab}>
            <div className="border-b border-gray-200 px-4 py-3">
              <TabList className="border-b-0">
                <TabButton>Profile</TabButton>
                <TabButton>SLA Policies</TabButton>
                <TabButton>SLA Breaches</TabButton>
                <TabButton>Staff Users</TabButton>
              </TabList>
            </div>
            <TabPanels>
              <TabPanel>
                <div className="p-4 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Profile</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your account information.</p>
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
                            {memberships[0]?.role || memberships[0]?.staff_role?.name || user?.role || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Department</div>
                          <div className="font-medium">
                            {memberships[0]?.department || memberships[0]?.department?.name || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Created</div>
                          <div className="font-medium">
                            {user?.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabPanel>

              <TabPanel>
                <div className="p-4 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Theme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">Appearance</div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Choose Light or Dark mode for the dashboard.
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant={theme === 'light' ? 'primary' : 'secondary'}
                            onClick={() => {
                              setTheme('light');
                            }}
                          >
                            Light
                          </Button>
                          <Button
                            size="sm"
                            variant={theme === 'dark' ? 'primary' : 'secondary'}
                            onClick={() => {
                              setTheme('dark');
                            }}
                          >
                            Dark
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SLA Policies</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Define response and resolution targets per department.</p>
                    </div>
                    <Button onClick={handleOpenCreate}>Add Policy</Button>
                  </div>

                  {isLoading ? (
                    <div className="py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : policies.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No policies yet</div>
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeader>Department</TableHeader>
                          <TableHeader>First Response (min)</TableHeader>
                          <TableHeader>Resolution (min)</TableHeader>
                          <TableHeader>Status</TableHeader>
                          <TableHeader>Actions</TableHeader>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {policies.map((policy) => (
                          <TableRow key={policy.id}>
                            <TableCell>{policy.department?.name || 'N/A'}</TableCell>
                            <TableCell>{policy.first_response_minutes}</TableCell>
                            <TableCell>{policy.resolution_minutes}</TableCell>
                            <TableCell>
                              <Badge variant={policy.is_active ? 'success' : 'default'} size="sm">
                                {policy.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleOpenEdit(policy)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  disabled={!policy.is_active}
                                  onClick={() => deactivateMutation.mutate(policy.id)}
                                >
                                  Deactivate
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {pagination?.last_page > 1 && (
                    <Pagination
                      currentPage={pagination.current_page || 1}
                      totalPages={pagination.last_page || 1}
                      onPageChange={(nextPage) => {
                        if (nextPage < 1 || nextPage > (pagination.last_page || 1)) return;
                        setPage(nextPage);
                      }}
                    />
                  )}
                </div>
              </TabPanel>

              <TabPanel>
                <div className="p-4 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SLA Breaches</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitor tickets that exceed SLA response or resolution targets.</p>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>First Response Breaches</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {breachesSummary.firstResponse.length === 0 ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400">No breaches</div>
                        ) : (
                          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            {breachesSummary.firstResponse.map((ticket) => (
                              <div key={ticket.id} className="flex items-center justify-between">
                                <span>#{ticket.id?.substring(0, 8)}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {ticket.department?.name || 'N/A'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Resolution Breaches</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {breachesSummary.resolution.length === 0 ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400">No breaches</div>
                        ) : (
                          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            {breachesSummary.resolution.map((ticket) => (
                              <div key={ticket.id} className="flex items-center justify-between">
                                <span>#{ticket.id?.substring(0, 8)}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {ticket.department?.name || 'N/A'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabPanel>

              <TabPanel>
                <div className="p-4 space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Staff Users</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage staff accounts and access in the Staff module.</p>
                  <div>
                    <Link to="/admin/staff/users">
                      <Button>Go to Staff Users</Button>
                    </Link>
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </CardContent>
      </Card>

      <Modal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
        title={policyForm.id ? 'Edit SLA Policy' : 'Create SLA Policy'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Department</label>
            <select
              value={policyForm.department_id}
              onChange={(e) => setPolicyForm((prev) => ({ ...prev, department_id: e.target.value }))}
              className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">Select department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="First Response Minutes"
            type="number"
            min="1"
            value={policyForm.first_response_minutes}
            onChange={(e) => setPolicyForm((prev) => ({ ...prev, first_response_minutes: e.target.value }))}
          />
          <Input
            label="Resolution Minutes"
            type="number"
            min="1"
            value={policyForm.resolution_minutes}
            onChange={(e) => setPolicyForm((prev) => ({ ...prev, resolution_minutes: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowPolicyModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => policyMutation.mutate(policyForm)}
              disabled={!policyForm.department_id || !policyForm.first_response_minutes || !policyForm.resolution_minutes}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
