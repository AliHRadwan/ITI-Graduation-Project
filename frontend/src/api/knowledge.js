import apiClient from './client';

export const knowledgeAPI = {
  /**
   * Get all knowledge documents with optional filters
   * @param {Object} params - Query parameters (status, category, search, page)
   * @returns {Promise} Response with paginated documents
   */
  getDocuments: async (params) => {
    const response = await apiClient.get('/knowledge-documents', { params });
    return response.data;
  },

  /**
   * Get a single knowledge document by ID
   * @param {string} id - Document ID
   * @returns {Promise} Document data
   */
  getDocument: async (id) => {
    const response = await apiClient.get(`/knowledge-documents/${id}`);
    return response.data;
  },

  /**
   * Upload a new knowledge document
   * @param {Object} data - { title, category, file }
   * @returns {Promise} Uploaded document data
   */
  uploadDocument: async (data) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('category', data.category);
    formData.append('file', data.file);

    const response = await apiClient.post('/knowledge-documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete a knowledge document
   * @param {string} id - Document ID
   * @returns {Promise} Success message
   */
  deleteDocument: async (id) => {
    const response = await apiClient.delete(`/knowledge-documents/${id}`);
    return response.data;
  },

  /**
   * Reprocess a failed document
   * @param {string} id - Document ID
   * @returns {Promise} Reprocessed document data
   */
  reprocessDocument: async (id) => {
    const response = await apiClient.post(`/knowledge-documents/${id}/reprocess`);
    return response.data;
  },

  /**
   * Test RAG API connection
   * @returns {Promise} Connection status
   */
  testConnection: async () => {
    const response = await apiClient.get('/knowledge-documents/test/connection');
    return response.data;
  },
};





