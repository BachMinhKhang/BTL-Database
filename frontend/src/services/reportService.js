// src/services/reportService.js
import apiClient from "./api";

// Lấy doanh thu theo sản phẩm
export const getProductRevenue = async (minRevenue = 0) => {
  try {
    const response = await apiClient.get("/reports/product-revenue", {
      params: { minRevenue },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching product revenue:", error);
    throw error;
  }
};

// Lấy doanh thu theo tháng
export const getMonthlyRevenue = async () => {
  try {
    const response = await apiClient.get("/reports/monthly-revenue");
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    throw error;
  }
};

// Lấy thống kê dashboard
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get("/reports/dashboard-stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
};
