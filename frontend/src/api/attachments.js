import apiClient from './client';

export const attachmentsAPI = {
  getAttachment: async (id) => {
    const response = await apiClient.get(`/attachments/${id}`);
    return response.data?.data || response.data;
  },
};
