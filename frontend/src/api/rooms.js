import apiClient from './client';

export const roomsAPI = {
  getRooms: async (params) => {
    const response = await apiClient.get('/rooms', { params });
    const payload = response.data || {};
    if (payload.data && payload.meta) {
      return {
        items: payload.data,
        pagination: {
          current_page: payload.meta.current_page,
          per_page: payload.meta.per_page,
          total: payload.meta.total,
          last_page: payload.meta.last_page,
        },
      };
    }
    return {
      items: payload.items || payload.data || payload || [],
      pagination: payload.pagination || null,
    };
  },

  getRoom: async (id) => {
    const response = await apiClient.get(`/rooms/${id}`);
    return response.data;
  },

  createRoom: async (data) => {
    const response = await apiClient.post('/rooms', data);
    return response.data;
  },

  updateRoom: async (id, data) => {
    const response = await apiClient.patch(`/rooms/${id}`, data);
    return response.data;
  },

  deleteRoom: async (id) => {
    const response = await apiClient.delete(`/rooms/${id}`);
    return response.data;
  },

  // QR Token management
  issueToken: async (roomId, data) => {
    const response = await apiClient.post(`/qr/rooms/${roomId}/tokens`, data);
    return response.data;
  },

  getRoomTokens: async (roomId) => {
    const response = await apiClient.get(`/qr/rooms/${roomId}/tokens`);
    // Backend returns { tokens: { data: [...] } } - extract the data array
    return response.data.tokens?.data || response.data.data || response.data;
  },

  revokeToken: async (tokenId) => {
    const response = await apiClient.post(`/qr/tokens/${tokenId}/revoke`);
    return response.data;
  },
};
