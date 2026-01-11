import apiClient from './client';

export const routingRulesAPI = {
  getRules: async (params) => {
    const response = await apiClient.get('/routing-rules', { params });
    const payload = response.data?.data || response.data || {};
    return {
      items: payload.data || payload.items || [],
      pagination: payload,
    };
  },

  createRule: async (data) => {
    const response = await apiClient.post('/routing-rules', data);
    return response.data;
  },

  updateRule: async (id, data) => {
    const response = await apiClient.patch(`/routing-rules/${id}`, data);
    return response.data;
  },

  deactivateRule: async (id) => {
    const response = await apiClient.post(`/routing-rules/${id}/deactivate`);
    return response.data;
  },
};
