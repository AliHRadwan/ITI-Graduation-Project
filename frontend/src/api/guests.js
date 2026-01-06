import apiClient from './client';

export const guestsAPI = {
  getGuests: async (params) => {
    const response = await apiClient.get('/guests', { params });
    // Backend returns { guests: { data: [...] } } - extract the data array
    return response.data.guests?.data || response.data.data || response.data;
  },

  getGuest: async (id) => {
    const response = await apiClient.get(`/guests/${id}`);
    return response.data;
  },
};

