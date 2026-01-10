import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ticketsAPI, roomsAPI, conversationsAPI, departmentsAPI } from '@/api';
import { Modal, Button, Input, Select, Textarea } from '@/components/ui';

const ticketSchema = z.object({
  conversation_id: z.string().min(1, 'Conversation is required'),
  room_id: z.string().min(1, 'Room is required'),
  department_id: z.string().min(1, 'Department is required'),
  category: z.enum(['housekeeping', 'food_and_drinks', 'maintenance', 'room_service', 'other']),
  priority: z.enum(['low', 'med', 'high', 'urgent']),
  status: z.enum(['new', 'doing', 'done', 'canceled']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

export default function CreateTicketModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsAPI.getRooms,
    enabled: isOpen,
  });

  const rooms = data?.items || [];
  const { data: departmentsData } = useQuery({
    queryKey: ['departments'],
    queryFn: departmentsAPI.getDepartments,
    enabled: isOpen,
  });

  const { data: conversationsData } = useQuery({
    queryKey: ['conversations', 'open'],
    queryFn: () => conversationsAPI.getConversations({ status: 'open' }),
    enabled: isOpen,
  });

  const departments = departmentsData?.items || [];
  const conversations = conversationsData?.items || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: 'med',
      category: 'other',
      status: 'new',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await ticketsAPI.createTicket(data);
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
          label="Department"
          options={[
            { value: '', label: 'Select a department' },
            ...(departments?.map((department) => ({
              value: department.id,
              label: department.name,
            })) || []),
          ]}
          error={errors.department_id?.message}
          {...register('department_id')}
        />

        <Select
          label="Conversation"
          options={[
            { value: '', label: 'Select a conversation' },
            ...(conversations?.map((conversation) => ({
              value: conversation.id,
              label: `${conversation.participant?.name || 'Guest'} (${conversation.room?.room_number || 'No room'})`,
            })) || []),
          ]}
          error={errors.conversation_id?.message}
          {...register('conversation_id')}
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
            { value: 'med', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
          error={errors.priority?.message}
          {...register('priority')}
        />

        <Select
          label="Status"
          options={[
            { value: 'new', label: 'New' },
            { value: 'doing', label: 'Doing' },
            { value: 'done', label: 'Done' },
            { value: 'canceled', label: 'Canceled' },
          ]}
          error={errors.status?.message}
          {...register('status')}
        />

        <Textarea
          label="Description"
          rows={4}
          placeholder="Describe the issue or request..."
          error={errors.description?.message}
          {...register('description')}
        />

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
