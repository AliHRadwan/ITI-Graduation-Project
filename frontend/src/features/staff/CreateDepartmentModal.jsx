import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { departmentsAPI } from '@/api';
import { Modal, Button, Input, Textarea } from '@/components/ui';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});

export default function CreateDepartmentModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departmentSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await departmentsAPI.createDepartment(data);
      toast.success('Department created successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Department">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Department Name"
          placeholder="Housekeeping"
          error={errors.name?.message}
          {...register('name')}
        />

        <Textarea
          label="Description"
          rows={3}
          placeholder="Brief description of the department..."
          error={errors.description?.message}
          {...register('description')}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            Create Department
          </Button>
        </div>
      </form>
    </Modal>
  );
}

