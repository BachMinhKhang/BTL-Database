import express from "express";
import * as employeeController from "../controllers/employeeController.js";

const router = express.Router();

// Employee routes
router.put("/:id", employeeController.updateEmployee); // Cập nhật employee
router.delete("/:id", employeeController.deleteEmployee); // Xóa employee

export default router;
