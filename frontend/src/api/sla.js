import apiClient from './client';

export const slaAPI = {
  getPolicies: async (params) => {
    const response = await apiClient.get('/sla/policies', { params });
    const payload = response.data?.data || response.data || {};
    return {
      items: payload.data || payload.items || [],
      pagination: payload,
    };
  },

  createPolicy: async (data) => {
    const response = await apiClient.post('/sla/policies', data);
    return response.data;
  },

  updatePolicy: async (id, data) => {
    const response = await apiClient.patch(`/sla/policies/${id}`, data);
    return response.data;
  },

  deactivatePolicy: async (id) => {
    const response = await apiClient.post(`/sla/policies/${id}/deactivate`);
    return response.data;
  },

  getBreaches: async () => {
    const response = await apiClient.get('/sla/breaches');
    return response.data;
  },
};
