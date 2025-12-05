import express from "express";
import {
  getProducts,
  getBestSellers,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/bestsellers", getBestSellers);
export default router;
