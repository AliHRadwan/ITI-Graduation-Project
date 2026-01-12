import apiClient from './client';

export const searchAPI = {
  search: async (q) => {
    const response = await apiClient.get('/search', { params: { q } });
    return response.data?.data?.results || response.data?.results || response.data?.data || response.data;
  },
};
