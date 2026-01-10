import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI } from '@/api';
import { Badge, Spinner, EmptyState, Pagination } from '@/components/ui';
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

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets', user?.id, page],
    queryFn: () => ticketsAPI.getTickets({ assigned_to: user?.id, page, per_page: perPage }),
    refetchInterval: 10000,
  });

  const tickets = data?.items || [];
  const pagination = data?.pagination || null;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => ticketsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-tickets', user?.id]);
    },
    onError: () => {
      toast.error('Failed to update ticket status');
    },
  });

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

      {!tickets || tickets.length === 0 ? (
        <EmptyState
          icon={TicketIcon}
          title="No tickets assigned"
          description="You don't have any tickets assigned to you yet"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/staff/tickets/${ticket.id}`)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md cursor-pointer transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">
                  #{ticket.id.substring(0, 8)}
                </h3>
                <Badge variant={statusColors[ticket.status]} size="sm">
                  {ticket.status}
                </Badge>
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
                    className="rounded-md border-gray-300 text-sm"
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
            </div>
          ))}
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
