import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { knowledgeAPI } from '@/api';
import { Modal, Button, Input, Select } from '@/components/ui';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  category: z.enum(['policies', 'rooms_amenities', 'local_guide', 'services'], {
    required_error: 'Category is required',
  }),
  file: z.any().refine((files) => files?.length > 0, 'File is required'),
});

const categoryOptions = [
  { value: 'policies', label: 'Policies' },
  { value: 'rooms_amenities', label: 'Rooms & Amenities' },
  { value: 'local_guide', label: 'Local Guide' },
  { value: 'services', label: 'Services' },
];

export default function UploadDocumentModal({ isOpen, onClose, onSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(uploadSchema),
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Only DOCX and PDF files are supported');
        e.target.value = '';
        setSelectedFile(null);
        setValue('file', null);
        return;
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        e.target.value = '';
        setSelectedFile(null);
        setValue('file', null);
        return;
      }

      setSelectedFile(file);
      setValue('file', e.target.files, { shouldValidate: true, shouldDirty: true });
    } else {
      setSelectedFile(null);
      setValue('file', null);
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    setUploadProgress(10);

    try {
      const uploadData = {
        title: data.title,
        category: data.category,
        file: selectedFile,
      };

      setUploadProgress(30);
      
      const response = await knowledgeAPI.uploadDocument(uploadData);
      
      setUploadProgress(100);

      // Check if processing succeeded
      if (response.document?.status === 'completed') {
        toast.success(`Document uploaded and processed successfully! ${response.document.chunks_count} chunks created.`);
      } else if (response.document?.status === 'failed') {
        toast.error(`Document uploaded but processing failed: ${response.error || 'Unknown error'}`);
      } else {
        toast.success('Document uploaded and is being processed...');
      }

      reset();
      setSelectedFile(null);
      setUploadProgress(0);
      onSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to upload document');
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      reset();
      setSelectedFile(null);
      setUploadProgress(0);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Knowledge Document">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Document Title"
          placeholder="e.g., Hotel Policies 2026"
          error={errors.title?.message}
          disabled={isLoading}
          {...register('title')}
        />

        <Select
          label="Category"
          error={errors.category?.message}
          disabled={isLoading}
          {...register('category')}
        >
          <option value="">Select a category...</option>
          {categoryOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document File
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-blue-600 dark:text-blue-300 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".docx,.pdf"
                    disabled={isLoading}
                    onChange={handleFileChange}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">DOCX or PDF up to 10MB</p>
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>
          {errors.file && (
            <p className="mt-1 text-sm text-red-600">{errors.file.message}</p>
          )}
        </div>

        {/* Upload Progress */}
        {isLoading && uploadProgress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Uploading and processing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> The document will be processed immediately and added to the AI knowledge base. 
            This may take a few moments depending on file size.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading} disabled={!selectedFile}>
            Upload & Process
          </Button>
        </div>
      </form>
    </Modal>
  );
}

