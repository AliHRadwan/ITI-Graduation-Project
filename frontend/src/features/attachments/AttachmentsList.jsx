import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { attachmentsAPI } from '@/api';
import { Card, Button, Input, Spinner, EmptyState } from '@/components/ui';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AttachmentsList() {
  const [attachmentId, setAttachmentId] = useState('');
  const [attachment, setAttachment] = useState(null);

  const fetchMutation = useMutation({
    mutationFn: (id) => attachmentsAPI.getAttachment(id),
    onSuccess: (data) => {
      setAttachment(data || null);
      if (!data) {
        toast.error('Attachment not found');
      }
    },
    onError: () => toast.error('Failed to load attachment'),
  });

  const handleLookup = () => {
    if (!attachmentId.trim()) {
      toast.error('Enter an attachment ID');
      return;
    }
    fetchMutation.mutate(attachmentId.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Attachments</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Lookup attachments by ID. Listing requires a backend list endpoint.
        </p>
      </div>

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Attachment ID"
            placeholder="Enter attachment UUID"
            value={attachmentId}
            onChange={(e) => setAttachmentId(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleLookup} disabled={fetchMutation.isLoading}>
            {fetchMutation.isLoading ? 'Loading…' : 'Lookup'}
          </Button>
        </div>
      </Card>

      {fetchMutation.isLoading ? (
        <div className="py-12 flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : attachment ? (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <div className="text-gray-500 dark:text-gray-400">Type</div>
              <div className="font-medium">{attachment.type || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">MIME</div>
              <div className="font-medium">{attachment.mime_type || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Size</div>
              <div className="font-medium">{attachment.size_bytes ? `${attachment.size_bytes} bytes` : 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-500 dark:text-gray-400">Created</div>
              <div className="font-medium">
                {attachment.created_at ? format(new Date(attachment.created_at), 'PPpp') : 'N/A'}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-gray-500 dark:text-gray-400">Storage URL</div>
              {attachment.storage_url ? (
                <a
                  href={attachment.storage_url}
                  className="text-blue-600 dark:text-blue-400 underline break-all"
                  target="_blank"
                  rel="noreferrer"
                >
                  {attachment.storage_url}
                </a>
              ) : (
                <div className="font-medium">N/A</div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <EmptyState title="No attachment loaded" description="Enter an attachment ID to view details." />
      )}
    </div>
  );
}
