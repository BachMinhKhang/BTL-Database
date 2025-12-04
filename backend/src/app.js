import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/database.js";

//Import Routes
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});
// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Kết nối Database trước
    await connectDB();

    // 2. Nếu OK thì mới bật Server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Không thể khởi động server:", error);
    process.exit(1); // Tắt chương trình nếu lỗi
  }
};

startServer();

export default app;
