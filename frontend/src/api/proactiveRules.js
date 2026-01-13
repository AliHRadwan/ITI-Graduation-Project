import apiClient from './client';

export const proactiveRulesAPI = {
  getRules: async () => {
    const response = await apiClient.get('/proactive-rules');
    return response.data?.data || response.data || [];
  },

  createRule: async (data) => {
    const response = await apiClient.post('/proactive-rules', data);
    return response.data;
  },

  updateRule: async (id, data) => {
    const response = await apiClient.patch(`/proactive-rules/${id}`, data);
    return response.data;
  },

  deactivateRule: async (id) => {
    const response = await apiClient.post(`/proactive-rules/${id}/deactivate`);
    return response.data;
  },

  deleteRule: async (id) => {
    const response = await apiClient.delete(`/proactive-rules/${id}`);
    return response.data;
  },
};
