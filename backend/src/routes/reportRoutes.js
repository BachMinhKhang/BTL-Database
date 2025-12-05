// src/routes/reportRoutes.js
import express from "express";
import * as reportController from "../controllers/reportController.js";

const router = express.Router();

// Route lấy doanh thu theo sản phẩm
router.get("/product-revenue", reportController.getRevenueReport);

// Route lấy doanh thu theo tháng
router.get("/monthly-revenue", reportController.getMonthlyRevenueReport);

// Route lấy thống kê dashboard
router.get("/dashboard-stats", reportController.getDashboardStats);

export default router;
