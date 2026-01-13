import apiClient from './client';

export const guestsAPI = {
  getGuests: async (params) => {
    const response = await apiClient.get('/guests', { params });
    // Backend returns { data: { items: [...] } } for paginated responses
    return response.data.data?.items || response.data.items || response.data;
  },

  getGuest: async (id) => {
    const response = await apiClient.get(`/guests/${id}`);
    return response.data;
  },
};
