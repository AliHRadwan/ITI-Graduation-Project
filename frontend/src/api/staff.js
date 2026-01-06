import apiClient from './client';

export const staffAPI = {
  // Staff Users
  getUsers: async (params) => {
    const response = await apiClient.get('/staff/users', { params });
    // Backend returns { users: { data: [...] } } or similar - extract the data array
    return response.data.users?.data || response.data.data || response.data;
  },

  getUser: async (id) => {
    const response = await apiClient.get(`/staff/users/${id}`);
    return response.data;
  },

  createUser: async (data) => {
    const response = await apiClient.post('/staff/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await apiClient.patch(`/staff/users/${id}`, data);
    return response.data;
  },

  deactivateUser: async (id) => {
    const response = await apiClient.post(`/staff/users/${id}/deactivate`);
    return response.data;
  },

  activateUser: async (id) => {
    const response = await apiClient.post(`/staff/users/${id}/activate`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await apiClient.delete(`/staff/users/${id}`);
    return response.data;
  },

  // Roles
  getRoles: async () => {
    const response = await apiClient.get('/staff/roles');
    // Backend returns { roles: { data: [...] } } or similar - extract the data array
    return response.data.roles?.data || response.data.data || response.data;
  },

  createRole: async (data) => {
    const response = await apiClient.post('/staff/roles', data);
    return response.data;
  },

  updateRole: async (id, data) => {
    const response = await apiClient.patch(`/staff/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id) => {
    const response = await apiClient.delete(`/staff/roles/${id}`);
    return response.data;
  },

  // Memberships (Department assignments)
  getMemberships: async (params) => {
    const response = await apiClient.get('/staff/memberships', { params });
    return response.data;
  },

  createMembership: async (data) => {
    const response = await apiClient.post('/staff/memberships', data);
    return response.data;
  },

  updateMembership: async (id, data) => {
    const response = await apiClient.patch(`/staff/memberships/${id}`, data);
    return response.data;
  },

  deleteMembership: async (id) => {
    const response = await apiClient.delete(`/staff/memberships/${id}`);
    return response.data;
  },
};

