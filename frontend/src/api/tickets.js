import apiClient from './client';

export const ticketsAPI = {
  getTickets: async (params) => {
    const response = await apiClient.get('/tickets', { params });
    const payload = response.data || {};
    if (payload.items) {
      return {
        items: payload.items,
        pagination: payload.pagination || null,
      };
    }
    return {
      items: payload.tickets?.data || payload.data || payload || [],
      pagination: payload.tickets || null,
    };
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
    const response = await apiClient.post(`/tickets/${id}/assign`, { actor_staff_user_id: staffId });
    return response.data;
  },

  addNote: async (id, note) => {
    const response = await apiClient.post(`/tickets/${id}/notes`, { note });
    return response.data;
  },

  getTicketEvents: async (id, params) => {
    const response = await apiClient.get(`/tickets/${id}/events`, { params });
    return response.data.events || response.data;
  },

  getTicketRating: async (id) => {
    const response = await apiClient.get(`/tickets/${id}/rating`);
    return response.data.rating || response.data;
  },

  getSlaBreaches: async () => {
    const response = await apiClient.get('/sla/breaches');
    return response.data;
  },
};
