import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { authAPI, staffAPI } from '@/api';
import { Modal, Button, Input, Select } from '@/components/ui';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role_id: z.string().min(1, 'Role is required'),
});

export default function InviteStaffModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useQuery({
    queryKey: ['staff-roles'],
    queryFn: staffAPI.getRoles,
    enabled: isOpen,
  });

  const roles = Array.isArray(data) ? data : data?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inviteSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authAPI.invite(data);
      toast.success('Invitation sent successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Staff Member">
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
          error={errors.role_id?.message}
          {...register('role_id')}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
}

