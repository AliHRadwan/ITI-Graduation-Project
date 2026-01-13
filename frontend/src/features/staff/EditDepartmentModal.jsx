import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { departmentsAPI } from '@/api';
import { Modal, Button, Input } from '@/components/ui';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export default function EditDepartmentModal({ isOpen, department, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: department?.name || '',
      });
    }
  }, [department, isOpen, reset]);

  const onSubmit = async (data) => {
    if (!department?.id) {
      toast.error('Department not found');
      return;
    }

    setIsLoading(true);
    try {
      await departmentsAPI.updateDepartment(department.id, data);
      toast.success('Department updated successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update department');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Department">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Department Name"
          placeholder="Housekeeping"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            Update Department
          </Button>
        </div>
      </form>
    </Modal>
  );
}
