import apiClient from './client';

export const conversationsAPI = {
  getConversations: async (params) => {
    console.debug('GET /conversations', params);
    const response = await apiClient.get('/conversations', { params });
    console.debug('GET /conversations response', response.data);
    // Backend returns { code: 200, status: "success", data: { items: [...], pagination: {...} } }
    const payload = response.data?.data || response.data;
    if (payload?.items) {
      return {
        items: payload.items,
        pagination: payload.pagination || null,
      };
    }
    return {
      items: response.data.items || response.data.data || response.data || [],
      pagination: null,
    };
  },

  getConversation: async (id) => {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data.data || response.data;
  },

  getMessages: async (conversationId, params) => {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`, { params });
    // Backend returns { data: { items: [...] } } for paginated responses
    return response.data.data?.items || response.data.items || response.data;
  },

  sendMessage: async (conversationId, data) => {
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, data);
    return response.data;
  },

  updateStatus: async (conversationId, status) => {
    const response = await apiClient.patch(`/conversations/${conversationId}/status`, { status });
    console.debug('PATCH /conversations/:id/status response', response.data);
    return response.data;
  },

  handoff: async (conversationId, data) => {
    const response = await apiClient.post(`/conversations/${conversationId}/handoff`, data);
    return response.data;
  },

  close: async (conversationId) => {
    const response = await apiClient.post(`/conversations/${conversationId}/close`);
    return response.data;
  },
};
