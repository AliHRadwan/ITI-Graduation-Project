import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { knowledgeAPI } from '@/api';
import { Button, Badge, Spinner, EmptyState } from '@/components/ui';
import { PlusIcon, DocumentTextIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import UploadDocumentModal from './UploadDocumentModal';

const statusColors = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'danger',
};

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Ready',
  failed: 'Failed',
};

const categoryLabels = {
  policies: 'Policies',
  rooms_amenities: 'Rooms & Amenities',
  local_guide: 'Local Guide',
  services: 'Services',
};

export default function KnowledgeBaseList() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['knowledge-documents', filterStatus, filterCategory, searchTerm, currentPage],
    queryFn: () => knowledgeAPI.getDocuments({
      status: filterStatus || undefined,
      category: filterCategory || undefined,
      search: searchTerm || undefined,
      page: currentPage,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: knowledgeAPI.deleteDocument,
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge-documents']);
    },
  });

  const reprocessMutation = useMutation({
    mutationFn: knowledgeAPI.reprocessDocument,
    onSuccess: () => {
      queryClient.invalidateQueries(['knowledge-documents']);
    },
  });

  const documents = data?.data || [];
  const pagination = data?.meta || data?.links || {};

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This will remove it from the knowledge base.`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        alert('Failed to delete document: ' + error.message);
      }
    }
  };

  const handleReprocess = async (id) => {
    try {
      await reprocessMutation.mutateAsync(id);
    } catch (error) {
      alert('Failed to reprocess document: ' + error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Manage documents for the AI assistant</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-md border-gray-300"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border-gray-300"
          >
            <option value="">All Statuses</option>
            <option value="completed">Ready</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-md border-gray-300"
          >
            <option value="">All Categories</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      {!documents || documents.length === 0 ? (
        <EmptyState
          icon={DocumentTextIcon}
          title="No documents found"
          description="Upload documents to build your knowledge base"
          action={
            <Button onClick={() => setShowUploadModal(true)}>
              <PlusIcon className="h-5 w-5 mr-2" />
              Upload First Document
            </Button>
          }
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chunks
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        <div className="text-sm text-gray-500">
                          {doc.file_name} • {formatFileSize(doc.file_size_bytes)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {categoryLabels[doc.category] || doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={statusColors[doc.status]}>
                      {statusLabels[doc.status] || doc.status}
                    </Badge>
                    {doc.status === 'failed' && doc.error_message && (
                      <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={doc.error_message}>
                        {doc.error_message}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {doc.chunks_count > 0 ? doc.chunks_count : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(doc.uploaded_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {doc.status === 'failed' && (
                      <button
                        onClick={() => handleReprocess(doc.id)}
                        disabled={reprocessMutation.isLoading}
                        className="text-blue-600 hover:text-blue-900"
                        title="Reprocess"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      disabled={deleteMutation.isLoading}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}





