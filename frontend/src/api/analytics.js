import apiClient from './client';

export const analyticsAPI = {
  getDashboardMetrics: async () => {
    const response = await apiClient.get('/dashboard/metrics');
    return response.data.data || response.data;
  },

  getTicketReports: async (params) => {
    const response = await apiClient.get('/dashboard/reports/tickets', { params });
    return response.data.data || response.data;
  },

  getSlaReports: async (params) => {
    const response = await apiClient.get('/dashboard/reports/sla', { params });
    return response.data.data || response.data;
  },
};
