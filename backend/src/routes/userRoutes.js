import express from "express";
import { getOneUser } from "../controllers/userController.js";
const router = express.Router();

// Định nghĩa route GET /:id (Ví dụ: /users/123)
router.get("/:id", getOneUser);

export default router;
