import apiClient from './client';

export const ticketsAPI = {
  getTickets: async (params) => {
    const response = await apiClient.get('/tickets', { params });
    // Backend returns { tickets: { data: [...] } } - extract the data array
    return response.data.tickets?.data || response.data.data || response.data;
  },

  getTicket: async (id) => {
    const response = await apiClient.get(`/tickets/${id}`);
    // Backend might return { ticket: {...} } or { data: {...} } or direct object
    return response.data.ticket || response.data.data || response.data;
  },

  createTicket: async (data) => {
    const response = await apiClient.post('/tickets', data);
    return response.data;
  },

  updateTicket: async (id, data) => {
    const response = await apiClient.patch(`/tickets/${id}`, data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.post(`/tickets/${id}/status`, { status });
    return response.data;
  },

  assignStaff: async (id, staffId) => {
    const response = await apiClient.post(`/tickets/${id}/assign`, { staff_user_id: staffId });
    return response.data;
  },
};

