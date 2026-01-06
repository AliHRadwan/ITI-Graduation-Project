import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketsAPI } from '@/api';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Spinner, EmptyState } from '@/components/ui';
import { PlusIcon, TicketIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import CreateTicketModal from './CreateTicketModal';

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

export default function TicketList() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketsAPI.getTickets(filters),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const tickets = Array.isArray(data) ? data : data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
          <p className="text-gray-600">Manage guest service requests</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Ticket
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-md border-gray-300"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="doing">Doing</option>
            <option value="done">Done</option>
            <option value="canceled">Canceled</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="rounded-md border-gray-300"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="rounded-md border-gray-300"
          >
            <option value="">All Categories</option>
            <option value="housekeeping">Housekeeping</option>
            <option value="food_and_drinks">Food & Drinks</option>
            <option value="maintenance">Maintenance</option>
            <option value="room_service">Room Service</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-12">
            <Spinner size="lg" />
          </div>
        ) : !tickets || tickets.length === 0 ? (
          <EmptyState
            icon={TicketIcon}
            title="No tickets found"
            description="Create a new ticket to get started"
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Ticket
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>ID</TableHeader>
                <TableHeader>Room</TableHeader>
                <TableHeader>Category</TableHeader>
                <TableHeader>Priority</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  onClick={() => navigate(`/admin/tickets/${ticket.id}`)}
                >
                  <TableCell>#{ticket.id.substring(0, 8)}</TableCell>
                  <TableCell>{ticket.room?.room_number || 'N/A'}</TableCell>
                  <TableCell className="capitalize">
                    {ticket.category.replace('_', ' ')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityColors[ticket.priority]} size="sm">
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[ticket.status]} size="sm">
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ticket.created_at ? format(new Date(ticket.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/tickets/${ticket.id}`);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Ticket Modal */}
      <CreateTicketModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />
    </div>
  );
}

