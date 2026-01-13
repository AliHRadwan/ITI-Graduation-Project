import apiClient from './client';

export const notificationsAPI = {
  getLogs: async (params) => {
    const response = await apiClient.get('/notifications/logs', { params });
    const payload = response.data?.data || response.data || {};
    return {
      items: payload.data || payload.items || [],
      pagination: payload,
    };
  },

  markSent: async (id) => {
    const response = await apiClient.post(`/notifications/logs/${id}/mark-sent`);
    return response.data;
  },

  markFailed: async (id) => {
    const response = await apiClient.post(`/notifications/logs/${id}/mark-failed`);
    return response.data;
  },
};
