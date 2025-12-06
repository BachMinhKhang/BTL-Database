import apiClient from "./api";
import { toast } from "react-toastify";

// Đăng ký tài khoản
export const register = async (userData) => {
  try {
    const response = await apiClient.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Đăng nhập
export const login = async (username, password) => {
  try {
    const response = await apiClient.post("/auth/login", {
      username,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("auth-change"));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Đăng xuất
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new Event("auth-change"));
  toast.success("Đăng xuất thành công!");
  return apiClient.post("/auth/logout");
};

// Lấy thông tin user hiện tại từ localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// Kiểm tra có token không
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};
