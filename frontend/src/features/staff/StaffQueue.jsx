import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI, departmentsAPI } from '@/api';
import { Badge, Spinner, EmptyState, Pagination, Button, Select, Input } from '@/components/ui';
import { TicketIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

const statusColors = {
  new: 'warning',
  doing: 'info',
  done: 'success',
  canceled: 'danger',
};

const priorityColors = {
  low: 'default',
  med: 'info',
  high: 'warning',
  urgent: 'danger',
};

const priorityLabels = {
  low: 'Low',
  med: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export default function StaffQueue() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [page, setPage] = useState(1);
  const perPage = 3;
  const [openHistory, setOpenHistory] = useState({});
  const [noteDrafts, setNoteDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets', user?.id, page, statusFilter, departmentFilter],
    queryFn: () =>
      ticketsAPI.getTickets({
        assigned_to: user?.id,
        page,
        per_page: perPage,
        status: statusFilter || undefined,
        department_id: departmentFilter || undefined,
      }),
    refetchInterval: 10000,
  });

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    isError: departmentsError,
  } = useQuery({
    queryKey: ['departments', 'staff-queue'],
    queryFn: () => departmentsAPI.getDepartments({ per_page: 100 }),
  });

  const { data: slaBreaches } = useQuery({
    queryKey: ['sla-breaches'],
    queryFn: ticketsAPI.getSlaBreaches,
  });

  const tickets = data?.items || [];
  const pagination = data?.pagination || null;

  const firstResponseBreaches = new Set(
    (slaBreaches?.first_response_breaches || []).map((ticket) => ticket.id)
  );
  const resolutionBreaches = new Set(
    (slaBreaches?.resolution_breaches || []).map((ticket) => ticket.id)
  );

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => ticketsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-tickets', user?.id]);
    },
    onError: () => {
      toast.error('Failed to update ticket status');
    },
  });

  const noteMutation = useMutation({
    mutationFn: ({ id, note }) => ticketsAPI.addNote(id, note),
    onSuccess: (_data, variables) => {
      setNoteDrafts((prev) => ({ ...prev, [variables.id]: '' }));
      queryClient.invalidateQueries(['ticket-events', variables.id]);
      toast.success('Note added');
    },
    onError: (error) => {
      if (error?.response?.status === 403) {
        toast.error(error.response?.data?.message || "You don't have permission to add a note");
        return;
      }
      toast.error('Failed to add note');
    },
  });

  const toggleHistory = (ticketId) => {
    setOpenHistory((prev) => ({ ...prev, [ticketId]: !prev[ticketId] }));
  };

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
        <h1 className="text-2xl font-bold text-gray-900">My Queue</h1>
        <p className="text-gray-600">Tickets assigned to you</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Select
            label="Department"
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            disabled={departmentsLoading || departmentsError}
          >
            <option value="">All Departments</option>
            {departmentsLoading && <option value="">Loading…</option>}
            {departmentsError && <option value="">Unable to load departments</option>}
            {(departmentsData?.items || []).map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
            <option value="canceled">Cancelled</option>
          </Select>
        </div>
      </div>

      {!tickets || tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets assigned"
          description="You don't have any tickets assigned to you yet"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => {
            const hasResolutionBreach = resolutionBreaches.has(ticket.id);
            const hasResponseBreach = firstResponseBreaches.has(ticket.id);
            const showHistory = !!openHistory[ticket.id];

            return (
            <div
              key={ticket.id}
              onClick={() => navigate(`/staff/tickets/${ticket.id}`)}
              className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  #{ticket.id.substring(0, 8)}
                </h3>
                <div className="flex items-center gap-2">
                  {hasResolutionBreach && (
                    <Badge variant="danger" size="sm">
                      SLA
                    </Badge>
                  )}
                  {!hasResolutionBreach && hasResponseBreach && (
                    <Badge variant="warning" size="sm">
                      SLA
                    </Badge>
                  )}
                  <Badge variant={statusColors[ticket.status]} size="sm">
                    {ticket.status}
                  </Badge>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {ticket.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Room:</span>
                  <span className="font-medium">{ticket.room?.number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="font-medium">{ticket.department?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium capitalize">{ticket.category?.replace('_', ' ') || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <Badge variant={priorityColors[ticket.priority]} size="sm">
                    {priorityLabels[ticket.priority] || ticket.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <select
                    value={ticket.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      e.stopPropagation();
                      statusMutation.mutate({ id: ticket.id, status: e.target.value });
                    }}
                    className="rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-sm"
                  >
                    <option value="new">New</option>
                    <option value="doing">Doing</option>
                    <option value="done">Done</option>
                    <option value="canceled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="text-xs">
                    {ticket.updated_at ? format(new Date(ticket.updated_at), 'MMM d, HH:mm') : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHistory(ticket.id);
                  }}
                >
                  {showHistory ? 'Hide History' : 'Show History'}
                </Button>
              </div>

              {showHistory && (
                <TicketHistory
                  ticketId={ticket.id}
                  noteValue={noteDrafts[ticket.id] || ''}
                  onNoteChange={(value) =>
                    setNoteDrafts((prev) => ({ ...prev, [ticket.id]: value }))
                  }
                  onSaveNote={() => {
                    const note = (noteDrafts[ticket.id] || '').trim();
                    if (!note) return;
                    noteMutation.mutate({ id: ticket.id, note });
                  }}
                />
              )}
            </div>
          )})}
        </div>
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
  );
}

function TicketHistory({ ticketId, noteValue, onNoteChange, onSaveNote }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ticket-events', ticketId],
    queryFn: () => ticketsAPI.getTicketEvents(ticketId),
    enabled: true,
  });

  const events = data?.data || data?.events?.data || [];

  return (
    <div
      className="mt-4 border-t border-gray-200 pt-4 space-y-3"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-sm font-medium text-gray-900">History</div>
      {isLoading ? (
        <div className="text-sm text-gray-500">Loading history...</div>
      ) : events.length === 0 ? (
        <div className="text-sm text-gray-500">No events yet</div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 5).map((event) => (
            <div key={event.id} className="text-xs text-gray-600">
              <div className="font-medium text-gray-800">
                {event.event_type?.replace('_', ' ')} · {event.staff_user?.name || 'System'}
              </div>
              <div>{event.note}</div>
              <div className="text-gray-400">
                {event.created_at ? format(new Date(event.created_at), 'MMM d, HH:mm') : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-2">
        <div className="text-xs font-medium text-gray-700 mb-2">Add note</div>
        <div className="flex items-center gap-2">
          <Input
            value={noteValue}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Add a note..."
          />
          <Button
            size="sm"
            onClick={() => {
              onSaveNote();
              refetch();
            }}
          >
            Save note
          </Button>
        </div>
      </div>
    </div>
  );
}
