import apiClient from "./api";

export const updateEmployee = async (id, data) => {
  const response = await apiClient.put(`/employees/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await apiClient.delete(`/employees/${id}`);
  return response.data;
};
