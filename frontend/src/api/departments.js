import apiClient from './client';

export const departmentsAPI = {
  getDepartments: async (params) => {
    const response = await apiClient.get('/departments', { params });
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
