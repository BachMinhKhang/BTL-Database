import apiClient from "./api"; // Import file api.js cấu hình axios

// Hàm gọi API lấy thông tin user theo ID
export const getUserById = async (id) => {
  try {
    // Gọi xuống endpoint GET /api/users/:id
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    throw error;
  }
};
