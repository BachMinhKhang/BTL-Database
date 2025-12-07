import express from "express";
import { createOrder } from "../controllers/orderController.js";

const router = express.Router();

// Đổi đường dẫn thành /create (tạo đơn hàng)
router.post("/create", createOrder);

export default router;