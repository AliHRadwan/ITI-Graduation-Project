import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { roomsAPI } from '@/api';
import { Modal, Button, Input, Select } from '@/components/ui';

const roomSchema = z.object({
  room_number: z.string().min(1, 'Room number is required'),
  status: z.enum(['available', 'occupied', 'maintenance', 'cleaning']).optional(),
});

export default function CreateRoomModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      status: 'available',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await roomsAPI.createRoom(data);
      toast.success('Room created successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create room');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Room">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Room Number"
          placeholder="101"
          error={errors.room_number?.message}
          {...register('room_number')}
        />

        <Select
          label="Status"
          options={[
            { value: 'available', label: 'Available' },
            { value: 'occupied', label: 'Occupied' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'cleaning', label: 'Cleaning' },
          ]}
          error={errors.status?.message}
          {...register('status')}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            Create Room
          </Button>
        </div>
      </form>
    </Modal>
  );
}
