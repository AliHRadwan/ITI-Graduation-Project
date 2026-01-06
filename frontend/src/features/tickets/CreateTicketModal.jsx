import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ticketsAPI, roomsAPI, conversationsAPI } from '@/api';
import { Modal, Button, Input, Select, Textarea } from '@/components/ui';

const ticketSchema = z.object({
  conversation_id: z.string().optional(),
  room_id: z.string().min(1, 'Room is required'),
  category: z.enum(['housekeeping', 'food_and_drinks', 'maintenance', 'room_service', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  is_emergency: z.boolean().optional(),
});

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsAPI.getRooms,
    enabled: isOpen,
  });

  const rooms = Array.isArray(data) ? data : data?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'medium',
      category: 'other',
      is_emergency: false,
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await ticketsAPI.createTicket({
        ...data,
        source: 'staff',
      });
      toast.success('Ticket created successfully!');
      reset();
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Ticket" size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Select
          label="Room"
          options={[
            { value: '', label: 'Select a room' },
            ...(rooms?.map((room) => ({
              value: room.id,
              label: `${room.room_number} - ${room.room_type}`,
            })) || []),
          ]}
          error={errors.room_id?.message}
          {...register('room_id')}
        />

        <Select
          label="Category"
          options={[
            { value: 'housekeeping', label: 'Housekeeping' },
            { value: 'food_and_drinks', label: 'Food & Drinks' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'room_service', label: 'Room Service' },
            { value: 'other', label: 'Other' },
          ]}
          error={errors.category?.message}
          {...register('category')}
        />

        <Select
          label="Priority"
          options={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
          error={errors.priority?.message}
          {...register('priority')}
        />

        <Textarea
          label="Description"
          rows={4}
          placeholder="Describe the issue or request..."
          error={errors.description?.message}
          {...register('description')}
        />

        <label className="flex items-center">
          <input type="checkbox" className="rounded" {...register('is_emergency')} />
          <span className="ml-2 text-sm text-gray-700">Mark as emergency</span>
        </label>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            Create Ticket
          </Button>
        </div>
      </form>
    </Modal>
  );
}

