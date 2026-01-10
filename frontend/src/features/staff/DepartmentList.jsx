import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { departmentsAPI } from '@/api';
import { Button, Badge, Table, TableHead, TableBody, TableRow, TableHeader, TableCell, Spinner, EmptyState, Pagination, Input } from '@/components/ui';
import { PlusIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import CreateDepartmentModal from './CreateDepartmentModal';
import EditDepartmentModal from './EditDepartmentModal';

export default function DepartmentList() {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['departments', page, debouncedSearch],
    queryFn: () => departmentsAPI.getDepartments({ page, per_page: perPage, q: debouncedSearch || undefined }),
  });

  const departments = data?.items || [];
  const pagination = data?.pagination || null;

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const deactivateMutation = useMutation({
    mutationFn: (id) => departmentsAPI.deactivateDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast.success('Department deactivated');
    },
    onError: () => toast.error('Failed to deactivate department'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => departmentsAPI.deleteDepartment(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['departments']);
      toast.success('Department deleted');
    },
    onError: () => toast.error('Failed to delete department'),
  });

  const handleEdit = (department) => {
    setSelectedDepartment(department);
    setShowEditModal(true);
  };

  const handleDelete = (department) => {
    if (!department?.id) return;
    const confirmed = window.confirm(`Delete "${department.name}"? This cannot be undone.`);
    if (!confirmed) return;
    deleteMutation.mutate(department.id);
  };

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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500">
            {departments.length} result{departments.length === 1 ? '' : 's'}
          </div>
        </div>
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
            description={debouncedSearch ? 'No results found' : 'Create departments to organize your staff'}
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
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={dept.is_active ? 'success' : 'danger'}
                      size="sm"
                    >
                      {dept.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleEdit(dept)}
                      >
                        Edit
                      </Button>
                      {dept.is_active && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => deactivateMutation.mutate(dept.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(dept)}
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

      {/* Create Modal */}
      <CreateDepartmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          queryClient.invalidateQueries(['departments']);
        }}
      />

      <EditDepartmentModal
        isOpen={showEditModal}
        department={selectedDepartment}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDepartment(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedDepartment(null);
          queryClient.invalidateQueries(['departments']);
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
