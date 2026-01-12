import apiClient from './client';

export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  me: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (data) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  invite: async (data) => {
    const response = await apiClient.post('/auth/invite', data);
    return response.data;
  },

  acceptInvite: async (data) => {
    const response = await apiClient.post('/auth/invite/accept', data);
    return response.data;
  },
};

