import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { slaAPI, departmentsAPI, authAPI, proactiveRulesAPI, routingRulesAPI } from '@/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Textarea, Modal, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Spinner, Pagination, Tabs, TabList, TabButton, TabPanels, TabPanel, Badge } from '@/components/ui';
import toast from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import useAuthStore from '@/store/authStore';

const emptyPolicy = {
  id: null,
  department_id: '',
  first_response_minutes: '',
  resolution_minutes: '',
};

const emptyProactiveRule = {
  id: null,
  trigger_type: 'ticket_created',
  trigger_config: '{}',
  message_template: '',
  is_active: true,
};

const emptyRoutingRule = {
  id: null,
  department_id: '',
  match_category: '',
  priority_default: 'low',
  is_active: true,
};

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [routingPage, setRoutingPage] = useState(1);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policyForm, setPolicyForm] = useState(emptyPolicy);
  const [showProactiveModal, setShowProactiveModal] = useState(false);
  const [proactiveForm, setProactiveForm] = useState(emptyProactiveRule);
  const [showRoutingModal, setShowRoutingModal] = useState(false);
  const [routingForm, setRoutingForm] = useState(emptyRoutingRule);
  const { theme, setTheme } = useTheme();
  const localUser = useAuthStore((state) => state.user);

  const { data: policiesData, isLoading } = useQuery({
    queryKey: ['sla-policies', page],
    queryFn: () => slaAPI.getPolicies({ page }),
  });

  const { data: proactiveRulesData, isLoading: proactiveLoading } = useQuery({
    queryKey: ['proactive-rules'],
    queryFn: proactiveRulesAPI.getRules,
  });

  const { data: routingRulesData, isLoading: routingLoading } = useQuery({
    queryKey: ['routing-rules', routingPage],
    queryFn: () => routingRulesAPI.getRules({ page: routingPage }),
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
  const proactiveRules = proactiveRulesData || [];
  const routingRules = routingRulesData?.items || [];
  const routingPagination = routingRulesData?.pagination || null;

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

  const handleOpenProactiveCreate = () => {
    setProactiveForm(emptyProactiveRule);
    setShowProactiveModal(true);
  };

  const handleOpenProactiveEdit = (rule) => {
    setProactiveForm({
      id: rule.id,
      trigger_type: rule.trigger_type || 'ticket_created',
      trigger_config: JSON.stringify(rule.trigger_config || {}, null, 2),
      message_template: rule.message_template || '',
      is_active: rule.is_active ?? true,
    });
    setShowProactiveModal(true);
  };

  const handleOpenRoutingCreate = () => {
    setRoutingForm(emptyRoutingRule);
    setShowRoutingModal(true);
  };

  const handleOpenRoutingEdit = (rule) => {
    setRoutingForm({
      id: rule.id,
      department_id: rule.department_id,
      match_category: rule.match_category,
      priority_default: rule.priority_default,
      is_active: rule.is_active ?? true,
    });
    setShowRoutingModal(true);
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

  const activateMutation = useMutation({
    mutationFn: (id) => slaAPI.updatePolicy(id, { is_active: true }),
    onSuccess: () => {
      toast.success('Policy activated');
      queryClient.invalidateQueries(['sla-policies']);
    },
    onError: () => toast.error('Failed to activate policy'),
  });

  const proactiveMutation = useMutation({
    mutationFn: (payload) => {
      let parsedConfig = {};
      try {
        parsedConfig = payload.trigger_config ? JSON.parse(payload.trigger_config) : {};
      } catch (error) {
        throw new Error('Trigger config must be valid JSON');
      }
      const data = {
        trigger_type: payload.trigger_type,
        trigger_config: parsedConfig,
        message_template: payload.message_template,
        is_active: payload.is_active,
      };
      if (payload.id) {
        return proactiveRulesAPI.updateRule(payload.id, data);
      }
      return proactiveRulesAPI.createRule(data);
    },
    onSuccess: () => {
      toast.success('Proactive rule saved');
      setShowProactiveModal(false);
      queryClient.invalidateQueries(['proactive-rules']);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save proactive rule');
    },
  });

  const proactiveDeactivateMutation = useMutation({
    mutationFn: (id) => proactiveRulesAPI.deactivateRule(id),
    onSuccess: () => {
      toast.success('Rule deactivated');
      queryClient.invalidateQueries(['proactive-rules']);
    },
    onError: () => toast.error('Failed to deactivate rule'),
  });

  const proactiveActivateMutation = useMutation({
    mutationFn: (id) => proactiveRulesAPI.updateRule(id, { is_active: true }),
    onSuccess: () => {
      toast.success('Rule activated');
      queryClient.invalidateQueries(['proactive-rules']);
    },
    onError: () => toast.error('Failed to activate rule'),
  });

  const proactiveDeleteMutation = useMutation({
    mutationFn: (id) => proactiveRulesAPI.deleteRule(id),
    onSuccess: () => {
      toast.success('Rule deleted');
      queryClient.invalidateQueries(['proactive-rules']);
    },
    onError: () => toast.error('Failed to delete rule'),
  });

  const routingMutation = useMutation({
    mutationFn: (payload) => {
      const data = {
        department_id: payload.department_id,
        match_category: payload.match_category,
        priority_default: payload.priority_default,
        is_active: payload.is_active,
      };
      if (payload.id) {
        return routingRulesAPI.updateRule(payload.id, data);
      }
      return routingRulesAPI.createRule(data);
    },
    onSuccess: () => {
      toast.success('Routing rule saved');
      setShowRoutingModal(false);
      queryClient.invalidateQueries(['routing-rules']);
    },
    onError: () => toast.error('Failed to save routing rule'),
  });

  const routingDeactivateMutation = useMutation({
    mutationFn: (id) => routingRulesAPI.deactivateRule(id),
    onSuccess: () => {
      toast.success('Rule deactivated');
      queryClient.invalidateQueries(['routing-rules']);
    },
    onError: () => toast.error('Failed to deactivate rule'),
  });

  const routingActivateMutation = useMutation({
    mutationFn: (id) => routingRulesAPI.updateRule(id, { is_active: true }),
    onSuccess: () => {
      toast.success('Rule activated');
      queryClient.invalidateQueries(['routing-rules']);
    },
    onError: () => toast.error('Failed to activate rule'),
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
                <TabButton>Theme</TabButton>
                <TabButton>SLA Policies</TabButton>
                <TabButton>SLA Breaches</TabButton>
                <TabButton>Proactive Rules</TabButton>
                <TabButton>Routing Rules</TabButton>
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
                </div>
              </TabPanel>

              <TabPanel>
                <div className="p-4 space-y-4">

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
                                {policy.is_active ? (
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => deactivateMutation.mutate(policy.id)}
                                  >
                                    Deactivate
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => activateMutation.mutate(policy.id)}
                                  >
                                    Activate
                                  </Button>
                                )}
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
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Proactive Rules</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Automate messages based on triggers.</p>
                    </div>
                    <Button onClick={handleOpenProactiveCreate}>Add Rule</Button>
                  </div>

                  {proactiveLoading ? (
                    <div className="py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : proactiveRules.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No proactive rules yet</div>
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeader>Trigger</TableHeader>
                          <TableHeader>Template</TableHeader>
                          <TableHeader>Status</TableHeader>
                          <TableHeader>Actions</TableHeader>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {proactiveRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>{rule.trigger_type}</TableCell>
                            <TableCell className="max-w-xs truncate">{rule.message_template}</TableCell>
                            <TableCell>
                              <Badge variant={rule.is_active ? 'success' : 'default'} size="sm">
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleOpenProactiveEdit(rule)}
                                >
                                  Edit
                                </Button>
                                {rule.is_active ? (
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => proactiveDeactivateMutation.mutate(rule.id)}
                                  >
                                    Deactivate
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => proactiveActivateMutation.mutate(rule.id)}
                                  >
                                    Activate
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => proactiveDeleteMutation.mutate(rule.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabPanel>

              <TabPanel>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Routing Rules</h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Route tickets by category and priority.</p>
                    </div>
                    <Button onClick={handleOpenRoutingCreate}>Add Rule</Button>
                  </div>

                  {routingLoading ? (
                    <div className="py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : routingRules.length === 0 ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No routing rules yet</div>
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeader>Department</TableHeader>
                          <TableHeader>Category</TableHeader>
                          <TableHeader>Priority</TableHeader>
                          <TableHeader>Status</TableHeader>
                          <TableHeader>Actions</TableHeader>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {routingRules.map((rule) => (
                          <TableRow key={rule.id}>
                            <TableCell>{rule.department?.name || 'N/A'}</TableCell>
                            <TableCell>{rule.match_category}</TableCell>
                            <TableCell>{rule.priority_default}</TableCell>
                            <TableCell>
                              <Badge variant={rule.is_active ? 'success' : 'default'} size="sm">
                                {rule.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => handleOpenRoutingEdit(rule)}
                                >
                                  Edit
                                </Button>
                                {rule.is_active ? (
                                  <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => routingDeactivateMutation.mutate(rule.id)}
                                  >
                                    Deactivate
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="success"
                                    onClick={() => routingActivateMutation.mutate(rule.id)}
                                  >
                                    Activate
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {routingPagination?.last_page > 1 && (
                    <Pagination
                      currentPage={routingPagination.current_page || 1}
                      totalPages={routingPagination.last_page || 1}
                      onPageChange={(nextPage) => {
                        if (nextPage < 1 || nextPage > (routingPagination.last_page || 1)) return;
                        setRoutingPage(nextPage);
                      }}
                    />
                  )}
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

      <Modal
        isOpen={showProactiveModal}
        onClose={() => setShowProactiveModal(false)}
        title={proactiveForm.id ? 'Edit Proactive Rule' : 'Create Proactive Rule'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Trigger Type</label>
            <select
              value={proactiveForm.trigger_type}
              onChange={(e) => setProactiveForm((prev) => ({ ...prev, trigger_type: e.target.value }))}
              className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="ticket_created">ticket_created</option>
              <option value="sla_breach">sla_breach</option>
              <option value="status_changed">status_changed</option>
              <option value="scheduled">scheduled</option>
            </select>
          </div>
          <Input
            label="Message Template"
            value={proactiveForm.message_template}
            onChange={(e) => setProactiveForm((prev) => ({ ...prev, message_template: e.target.value }))}
          />
          <Textarea
            label="Trigger Config (JSON)"
            rows={4}
            value={proactiveForm.trigger_config}
            onChange={(e) => setProactiveForm((prev) => ({ ...prev, trigger_config: e.target.value }))}
          />
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <input
              id="proactive-active"
              type="checkbox"
              checked={proactiveForm.is_active}
              onChange={(e) => setProactiveForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
            <label htmlFor="proactive-active">Active</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowProactiveModal(false)}>
              Cancel
            </Button>
            <Button onClick={() => proactiveMutation.mutate(proactiveForm)}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRoutingModal}
        onClose={() => setShowRoutingModal(false)}
        title={routingForm.id ? 'Edit Routing Rule' : 'Create Routing Rule'}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Department</label>
            <select
              value={routingForm.department_id}
              onChange={(e) => setRoutingForm((prev) => ({ ...prev, department_id: e.target.value }))}
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
            label="Match Category"
            value={routingForm.match_category}
            onChange={(e) => setRoutingForm((prev) => ({ ...prev, match_category: e.target.value }))}
          />
          <div>
            <label className="text-sm font-medium text-gray-700">Priority Default</label>
            <select
              value={routingForm.priority_default}
              onChange={(e) => setRoutingForm((prev) => ({ ...prev, priority_default: e.target.value }))}
              className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="low">low</option>
              <option value="med">med</option>
              <option value="high">high</option>
              <option value="urgent">urgent</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <input
              id="routing-active"
              type="checkbox"
              checked={routingForm.is_active}
              onChange={(e) => setRoutingForm((prev) => ({ ...prev, is_active: e.target.checked }))}
            />
            <label htmlFor="routing-active">Active</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowRoutingModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => routingMutation.mutate(routingForm)}
              disabled={!routingForm.department_id || !routingForm.match_category}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
