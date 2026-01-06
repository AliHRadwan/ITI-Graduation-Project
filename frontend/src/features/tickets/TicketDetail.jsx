import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ticketsAPI, staffAPI } from '@/api';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, Select, Spinner } from '@/components/ui';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const statusColors = {
  new: 'warning',
  doing: 'info',
  done: 'success',
  canceled: 'danger',
};

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedStaff, setSelectedStaff] = useState('');

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsAPI.getTicket(id),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff-users'],
    queryFn: staffAPI.getUsers,
  });

  const staff = Array.isArray(staffData) ? staffData : staffData?.data || [];

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
            onClick={() => navigate('/admin/tickets')}
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
                    <p className="mt-1 text-gray-900 capitalize">{ticket.priority}</p>
                  </div>
                </div>
                {ticket.is_emergency && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm font-medium text-red-800">🚨 Emergency Ticket</p>
                  </div>
                )}
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
                  <p className="text-gray-900">{ticket.room?.room_number || 'N/A'}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Assigned Staff</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.assigned_staff ? (
                <div className="space-y-2">
                  <p className="font-medium">{ticket.assigned_staff.name}</p>
                  <p className="text-sm text-gray-600">{ticket.assigned_staff.email}</p>
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
        </div>
      </div>
    </div>
  );
}

