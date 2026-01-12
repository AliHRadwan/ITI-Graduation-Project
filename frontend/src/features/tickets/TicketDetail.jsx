import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ticketsAPI, staffAPI } from '@/api';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Select, Spinner } from '@/components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import useAuthStore from '@/store/authStore';
import { isStaffRole } from '@/utils/permissions';

const statusColors = {
  new: 'warning',
  doing: 'info',
  done: 'success',
  canceled: 'danger',
};

const priorityLabels = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const staffView = isStaffRole(user) || location.pathname.startsWith('/staff');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsList, setEventsList] = useState([]);
  const [eventsPagination, setEventsPagination] = useState(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsAPI.getTicket(id),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff-users'],
    queryFn: staffAPI.getUsers,
    enabled: !staffView,
  });

  const { data: eventsData, isLoading: isEventsLoading } = useQuery({
    queryKey: ['ticket-events', id, eventsPage],
    queryFn: () => ticketsAPI.getTicketEvents(id, { page: eventsPage }),
    enabled: !!id,
    keepPreviousData: true,
  });

  useEffect(() => {
    if (!eventsData) return;
    const pageEvents = eventsData?.data || eventsData?.events?.data || [];
    const pagination = eventsData?.meta || eventsData?.events?.meta || eventsData;
    setEventsPagination(pagination);
    setEventsList((prev) => {
      const next = eventsPage === 1 ? [] : prev;
      return [...next, ...pageEvents];
    });
  }, [eventsData, eventsPage]);

  const staff = staffData?.items || [];

  const updateStatusMutation = useMutation({
    mutationFn: (status) => ticketsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['ticket', id]);
      toast.success('Status updated successfully');
    },
    onError: () => toast.error('Failed to update status'),
  });

  const assignStaffMutation = useMutation({
    mutationFn: (staffId) => ticketsAPI.assignStaff(id, staffId),
    onSuccess: () => {
      queryClient.invalidateQueries(['ticket', id]);
      toast.success('Staff assigned successfully');
      setSelectedStaff('');
    },
    onError: () => toast.error('Failed to assign staff'),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return <div>Ticket not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(staffView ? '/staff/queue' : '/admin/tickets')}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Ticket #{ticket.id ? ticket.id.substring(0, 8) : 'Loading...'}
            </h1>
            <p className="text-gray-600">
              Created {ticket.created_at ? format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}
            </p>
          </div>
        </div>
        <Badge variant={statusColors[ticket.status]}>{ticket.status}</Badge>
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900">{ticket.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-gray-900 capitalize">
                      {ticket.category.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Priority</label>
                    <p className="mt-1 text-gray-900">
                      {priorityLabels[ticket.priority] || ticket.priority}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={ticket.status === 'new' ? 'primary' : 'secondary'}
                  onClick={() => updateStatusMutation.mutate('new')}
                  disabled={ticket.status === 'new'}
                >
                  New
                </Button>
                <Button
                  size="sm"
                  variant={ticket.status === 'doing' ? 'primary' : 'secondary'}
                  onClick={() => updateStatusMutation.mutate('doing')}
                  disabled={ticket.status === 'doing'}
                >
                  Doing
                </Button>
                <Button
                  size="sm"
                  variant={ticket.status === 'done' ? 'success' : 'secondary'}
                  onClick={() => updateStatusMutation.mutate('done')}
                  disabled={ticket.status === 'done'}
                >
                  Done
                </Button>
                <Button
                  size="sm"
                  variant={ticket.status === 'canceled' ? 'danger' : 'secondary'}
                  onClick={() => updateStatusMutation.mutate('canceled')}
                  disabled={ticket.status === 'canceled'}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              {isEventsLoading && eventsPage === 1 ? (
                <div className="text-sm text-gray-500">Loading history...</div>
              ) : eventsList.length === 0 ? (
                <div className="text-sm text-gray-500">No history yet</div>
              ) : (
                <div className="space-y-3 text-sm text-gray-700">
                  {eventsList.map((event) => (
                    <div key={event.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="font-medium text-gray-900">
                        {event.event_type?.replace('_', ' ')}
                      </div>
                      {event.note && <div className="text-gray-600">{event.note}</div>}
                      <div className="text-xs text-gray-500">
                        {event.staff_user?.name || event.staff_user?.email || 'System'} ·{' '}
                        {event.created_at ? format(new Date(event.created_at), 'MMM d, HH:mm') : 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {eventsPagination?.current_page < eventsPagination?.last_page && (
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEventsPage((prev) => prev + 1)}
                  >
                    Load more
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Room Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Room Number</label>
                  <p className="text-gray-900">{ticket.room?.number || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Room Type</label>
                  <p className="text-gray-900">{ticket.room?.room_type || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Floor</label>
                  <p className="text-gray-900">{ticket.room?.floor || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {!staffView && (
            <Card>
              <CardHeader>
                <CardTitle>Assigned Staff</CardTitle>
              </CardHeader>
              <CardContent>
                {ticket.staff_user ? (
                  <div className="space-y-2">
                    <p className="font-medium">{ticket.staff_user.name}</p>
                    <p className="text-sm text-gray-600">{ticket.staff_user.email}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">Not assigned yet</p>
                    <Select
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value)}
                      options={[
                        { value: '', label: 'Select staff member' },
                        ...(staff?.map((s) => ({
                          value: s.id,
                          label: s.name,
                        })) || []),
                      ]}
                    />
                    <Button
                      fullWidth
                      size="sm"
                      disabled={!selectedStaff}
                      onClick={() => assignStaffMutation.mutate(selectedStaff)}
                    >
                      Assign
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
