import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attachmentsAPI } from '@/api';
import {
  Button,
  Badge,
  Input,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  Spinner,
  EmptyState,
  Pagination,
} from '@/components/ui';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AttachmentsList() {
  const [page, setPage] = useState(1);
  const perPage = 6;
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ['attachments', page, debouncedSearch],
    queryFn: () =>
      attachmentsAPI.getAttachments({
        page,
        per_page: perPage,
        q: debouncedSearch || undefined,
      }),
  });

  const attachments = data?.items || [];
  const pagination = data?.pagination || null;

  const formatSize = (bytes) => {
    if (!Number.isFinite(bytes) || bytes <= 0) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const handleOpen = async (attachment) => {
    if (!attachment?.id) {
      toast.error('Attachment not available');
      return;
    }
    try {
      const detail = await attachmentsAPI.getAttachment(attachment.id);
      if (!detail?.storage_url) {
        toast.error('No file URL available');
        return;
      }
      window.open(detail.storage_url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Failed to open attachment');
    }
  };

  const statusVariant = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'open') return 'success';
    if (normalized === 'handoff') return 'warning';
    if (normalized === 'closed') return 'danger';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attachments</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Review uploaded files and related conversations.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-xs">
            <Input
              placeholder="Search attachments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {attachments.length} result{attachments.length === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        {isLoading ? (
          <div className="p-12">
            <Spinner size="lg" />
          </div>
        ) : attachments.length === 0 ? (
          <EmptyState title="No attachments found" description="Upload files to see them here." />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>File</TableHeader>
                <TableHeader>Type</TableHeader>
                <TableHeader>Size</TableHeader>
                <TableHeader>Created</TableHeader>
                <TableHeader>Conversation</TableHeader>
                <TableHeader>Channel User</TableHeader>
                <TableHeader>Room</TableHeader>
                <TableHeader>Message</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {attachments.map((attachment) => (
                <TableRow key={attachment.id}>
                  <TableCell className="font-medium">
                    {attachment.file_name || 'Attachment'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {attachment.type || 'file'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {attachment.mime_type || 'unknown'}
                    </div>
                  </TableCell>
                  <TableCell>{formatSize(attachment.size_bytes)}</TableCell>
                  <TableCell>
                    {attachment.created_at ? format(new Date(attachment.created_at), 'PPpp') : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {attachment.conversation?.id ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {attachment.conversation.id.slice(0, 8)}
                        </div>
                        <Badge variant={statusVariant(attachment.conversation.status)} size="sm">
                          {attachment.conversation.status || 'unknown'}
                        </Badge>
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell>
                    {attachment.conversation?.channel_user_id || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {attachment.room?.number || 'N/A'}
                  </TableCell>
                  <TableCell>
                    {attachment.message?.id ? attachment.message.id.slice(0, 8) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="secondary" onClick={() => handleOpen(attachment)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

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
