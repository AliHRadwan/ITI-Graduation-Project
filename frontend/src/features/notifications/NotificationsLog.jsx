import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '@/api';
import { Card, Button, Badge, Spinner, Pagination, EmptyState, Input } from '@/components/ui';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function NotificationsLog() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [conversationId, setConversationId] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notification-logs', { page, status, ticketId, conversationId }],
    queryFn: () =>
      notificationsAPI.getLogs({
        page,
        status: status || undefined,
        ticket_id: ticketId || undefined,
        conversation_id: conversationId || undefined,
      }),
  });

  const logs = data?.items || [];
  const pagination = data?.pagination || null;

  const markSentMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markSent(id),
    onSuccess: () => {
      toast.success('Marked as sent');
      queryClient.invalidateQueries(['notification-logs']);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const markFailedMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markFailed(id),
    onSuccess: () => {
      toast.success('Marked as failed');
      queryClient.invalidateQueries(['notification-logs']);
    },
    onError: () => toast.error('Failed to update status'),
  });

  const toggleExpanded = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications Log</h1>
        <p className="text-gray-600 dark:text-gray-400">Review delivery logs and payloads.</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="">All</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Ticket ID</label>
            <Input
              value={ticketId}
              onChange={(e) => {
                setTicketId(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by ticket"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversation ID</label>
            <Input
              value={conversationId}
              onChange={(e) => {
                setConversationId(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by conversation"
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="secondary"
              onClick={() => {
                setStatus('');
                setTicketId('');
                setConversationId('');
                setPage(1);
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <div className="py-10 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState title="No logs found" description="Try adjusting filters." />
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {log.message_type || 'Notification'}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Channel: {log.channel_type || 'N/A'}</span>
                    <span>Status: {log.status || 'N/A'}</span>
                    <span>
                      Created: {log.created_at ? format(new Date(log.created_at), 'PPpp') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Ticket: {log.ticket_id || 'N/A'}</span>
                    <span>Conversation: {log.conversation_id || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      log.status === 'sent' ? 'success' : log.status === 'failed' ? 'danger' : 'warning'
                    }
                    size="sm"
                  >
                    {log.status || 'pending'}
                  </Badge>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => toggleExpanded(log.id)}
                  >
                    {expandedId === log.id ? 'Hide payload' : 'View payload'}
                  </Button>
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => markSentMutation.mutate(log.id)}
                  >
                    Mark sent
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => markFailedMutation.mutate(log.id)}
                  >
                    Mark failed
                  </Button>
                </div>
              </div>
              {expandedId === log.id && (
                <div className="mt-4 rounded-md border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-3 text-xs text-gray-700 dark:text-gray-200">
                  <pre className="whitespace-pre-wrap break-words">
                    {log.payload || 'No payload'}
                  </pre>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

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
