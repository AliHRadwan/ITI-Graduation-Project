import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { staffAPI, departmentsAPI } from '@/api';
import { Modal, Button, Input, Select } from '@/components/ui';

const staffSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  staff_role_id: z.string().min(1, 'Role is required'),
  department_id: z.string().optional(),
  is_active: z.enum(['true', 'false']),
});

export default function EditStaffModal({ isOpen, user, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const { data: rolesData } = useQuery({
    queryKey: ['staff-roles'],
    queryFn: staffAPI.getRoles,
    enabled: isOpen,
  });

  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsAPI.getDepartments,
    enabled: isOpen,
  });

  const roles = Array.isArray(rolesData) ? rolesData : rolesData?.data || [];
  const departments = departmentsData?.items || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      staff_role_id: user?.role?.id || '',
      department_id: user?.department?.id || '',
      is_active: user?.is_active ? 'true' : 'false',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: user?.name || '',
        email: user?.email || '',
        staff_role_id: user?.role?.id || '',
        department_id: user?.department?.id || '',
        is_active: user?.is_active ? 'true' : 'false',
      });
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data) => {
    if (!user?.id) {
      toast.error('Staff user not found');
      return;
    }

    setIsLoading(true);
    try {
      await staffAPI.updateUser(user.id, {
        name: data.name,
        email: data.email,
        is_active: data.is_active === 'true',
        staff_role_id: data.staff_role_id,
        department_id: data.department_id || null,
      });
      toast.success('Staff member updated successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update staff member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Staff Member">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="John Doe"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="john@hotel.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Select
          label="Role"
          options={[
            { value: '', label: 'Select a role' },
            ...(roles?.map((role) => ({
              value: role.id,
              label: role.name,
            })) || []),
          ]}
          error={errors.staff_role_id?.message}
          {...register('staff_role_id')}
        />

        <Select
          label="Department"
          options={[
            { value: '', label: 'No department' },
            ...(departments?.map((department) => ({
              value: department.id,
              label: department.name,
            })) || []),
          ]}
          error={errors.department_id?.message}
          {...register('department_id')}
        />

        <Select
          label="Status"
          options={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
          error={errors.is_active?.message}
          {...register('is_active')}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            Update Staff
          </Button>
        </div>
      </form>
    </Modal>
  );
}
