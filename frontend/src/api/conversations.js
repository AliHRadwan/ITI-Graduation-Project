import apiClient from './client';

export const conversationsAPI = {
  getConversations: async (params) => {
    const response = await apiClient.get('/conversations', { params });
    // Backend returns { code: 200, status: "success", data: { items: [...] } }
    return response.data.data?.items || response.data.items || response.data.data || response.data;
  },

  getConversation: async (id) => {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data;
  },

  getMessages: async (conversationId, params) => {
    const response = await apiClient.get(`/conversations/${conversationId}/messages`, { params });
    // Backend returns { messages: { data: [...] } } - extract the data array
    return response.data.messages?.data || response.data.data || response.data;
  },

  sendMessage: async (conversationId, data) => {
    const response = await apiClient.post(`/conversations/${conversationId}/messages`, data);
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

