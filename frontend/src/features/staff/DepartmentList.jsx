import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { departmentsAPI } from '@/api';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Spinner, EmptyState } from '@/components/ui';
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import CreateDepartmentModal from './CreateDepartmentModal';

export default function DepartmentList() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsAPI.getDepartments,
  });

  const departments = Array.isArray(data) ? data : data?.data || [];

  const deactivateMutation = useMutation({
    mutationFn: (id) => departmentsAPI.deactivateDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast.success('Department deactivated');
    },
    onError: () => toast.error('Failed to deactivate department'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage hotel departments</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {isLoading ? (
          <div className="p-12">
            <Spinner size="lg" />
          </div>
        ) : !departments || departments.length === 0 ? (
          <EmptyState
            icon={BuildingOfficeIcon}
            title="No departments"
            description="Create departments to organize your staff"
            action={
              <Button onClick={() => setShowCreateModal(true)}>
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Department
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Description</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell className="text-gray-600">
                    {dept.description || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={dept.is_active ? 'success' : 'danger'}
                      size="sm"
                    >
                      {dept.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {dept.is_active && (
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deactivateMutation.mutate(dept.id)}
                      >
                        Deactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Modal */}
      <CreateDepartmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          queryClient.invalidateQueries(['departments']);
        }}
      />
    </div>
  );
}

