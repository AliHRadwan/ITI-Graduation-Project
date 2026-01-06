import apiClient from './client';

export const departmentsAPI = {
  getDepartments: async (params) => {
    const response = await apiClient.get('/departments', { params });
    // Backend returns { departments: { data: [...] } } - extract the data array
    return response.data.departments?.data || response.data.data || response.data;
  },

  getDepartment: async (id) => {
    const response = await apiClient.get(`/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data) => {
    const response = await apiClient.post('/departments', data);
    return response.data;
  },

  updateDepartment: async (id, data) => {
    const response = await apiClient.patch(`/departments/${id}`, data);
    return response.data;
  },

  deactivateDepartment: async (id) => {
    const response = await apiClient.post(`/departments/${id}/deactivate`);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await apiClient.delete(`/departments/${id}`);
    return response.data;
  },
};

