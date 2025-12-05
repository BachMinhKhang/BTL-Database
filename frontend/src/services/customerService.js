import apiClient from "./api";

export const getCustomers = async (params = {}) => {
  const response = await apiClient.get("/customers", { params });
  return response.data;
};

// API tạo mới
export const createCustomer = async (data) => {
  const response = await apiClient.post("/customers", data);
  return response.data;
};

export const updateCustomer = async (id, data) => {
  const response = await apiClient.put(`/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await apiClient.delete(`/customers/${id}`);
  return response.data;
};
