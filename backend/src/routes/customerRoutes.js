import express from "express";
import * as customerController from "../controllers/customerController.js";

const router = express.Router();

// Định nghĩa các route
router.get("/", customerController.getAllCustomers); // Vừa get all vừa search
router.post("/", customerController.createCustomer);
router.put("/:id", customerController.updateCustomer);
router.delete("/:id", customerController.deleteCustomer);

export default router;
