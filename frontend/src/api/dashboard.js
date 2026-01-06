import apiClient from './client';

export const dashboardAPI = {
  getMetrics: async () => {
    const response = await apiClient.get('/dashboard/metrics');
    // Backend might return { metrics: {...} } or { data: {...} } or direct object
    return response.data.metrics || response.data.data || response.data;
  },

  getTicketReports: async (params) => {
    const response = await apiClient.get('/dashboard/reports/tickets', { params });
    // Backend might return { reports: {...} } or { data: {...} } or direct object
    return response.data.reports || response.data.data || response.data;
  },

  getSLAReports: async (params) => {
    const response = await apiClient.get('/dashboard/reports/sla', { params });
    // Backend might return { reports: {...} } or { data: {...} } or direct object
    return response.data.reports || response.data.data || response.data;
  },
};

