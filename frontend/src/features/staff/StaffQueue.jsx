import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI } from '@/api';
import { Badge, Spinner, EmptyState } from '@/components/ui';
import { TicketIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import useAuthStore from '@/store/authStore';

const statusColors = {
  new: 'warning',
  doing: 'info',
  done: 'success',
  canceled: 'danger',
};

const priorityColors = {
  low: 'default',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

export default function StaffQueue() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ['my-tickets', user?.id],
    queryFn: () => ticketsAPI.getTickets({ assigned_to: user?.id }),
    refetchInterval: 10000,
  });

  const tickets = Array.isArray(data) ? data : data?.data || [];

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
              onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
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
                  <span className="font-medium">{ticket.room?.room_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <Badge variant={priorityColors[ticket.priority]} size="sm">
                    {ticket.priority}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-xs">
                    {ticket.created_at ? format(new Date(ticket.created_at), 'MMM d, HH:mm') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

