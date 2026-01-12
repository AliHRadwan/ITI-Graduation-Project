import apiClient from './client';

export const attachmentsAPI = {
  getAttachments: async (params) => {
    const response = await apiClient.get('/attachments', { params });
    const payload = response.data?.data || response.data || {};
    return {
      items: payload.items || payload.data || [],
      pagination: payload.pagination || payload,
    };
  },
  getAttachment: async (id) => {
    const response = await apiClient.get(`/attachments/${id}`);
    return response.data?.data || response.data;
  },
};
