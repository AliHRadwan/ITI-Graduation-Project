import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { staffAPI } from '@/api';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Spinner, EmptyState, Pagination } from '@/components/ui';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import InviteStaffModal from './InviteStaffModal';
import EditStaffModal from './EditStaffModal';

export default function StaffList() {
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 5;

  const { data, isLoading } = useQuery({
    queryKey: ['staff-users', page],
    queryFn: () => staffAPI.getUsers({ page, per_page: perPage }),
  });

  const staff = data?.items || [];
  const pagination = data?.pagination || null;

  const deactivateMutation = useMutation({
    mutationFn: (id) => staffAPI.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-users']);
      toast.success('Staff member deactivated');
    },
    onError: () => toast.error('Failed to deactivate staff member'),
  });

  const activateMutation = useMutation({
    mutationFn: (id) => staffAPI.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-users']);
      toast.success('Staff member activated');
    },
    onError: () => toast.error('Failed to activate staff member'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => staffAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['staff-users']);
      toast.success('Staff member deleted');
    },
    onError: () => toast.error('Failed to delete staff member'),
  });

  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDelete = (user) => {
    if (!user?.id) return;
    const confirmed = window.confirm(`Delete "${user.name}"? This cannot be undone.`);
    if (!confirmed) return;
    deleteMutation.mutate(user.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Members</h1>
          <p className="text-gray-600">Manage hotel staff and permissions</p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Invite Staff
        </Button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-12">
            <Spinner size="lg" />
          </div>
        ) : !staff || staff.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="No staff members"
            description="Invite staff members to get started"
            action={
              <Button onClick={() => setShowInviteModal(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Invite Staff
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Role</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge variant="info" size="sm">
                      {member.role?.name || 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.department?.name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={member.is_active ? 'success' : 'danger'}
                      size="sm"
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(member)}
                      >
                        Edit
                      </Button>
                      {member.is_active ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => deactivateMutation.mutate(member.id)}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => activateMutation.mutate(member.id)}
                        >
                          Activate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(member)}
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

      {/* Invite Modal */}
      <InviteStaffModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => {
          setShowInviteModal(false);
          queryClient.invalidateQueries(['staff-users']);
        }}
      />

      <EditStaffModal
        isOpen={showEditModal}
        user={selectedUser}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedUser(null);
          queryClient.invalidateQueries(['staff-users']);
        }}
      />

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
