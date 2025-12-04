// src/controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Customer from "../models/Customer.js";
import Employee from "../models/Employee.js";

// ===============================
// REGISTER
// ===============================
export const register = async (req, res) => {
  const {
    username,
    email,
    password,
    fullName,
    phone,
    role, // 'customer' | 'employee'
  } = req.body;

  try {
    // 1. Validate input cơ bản
    if (!["customer", "employee"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    // 2. Kiểm tra trùng Email
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    // 3. Kiểm tra trùng Username
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    // 4. Tạo User trong bảng [USER]
    // Map 'phone' từ frontend sang 'phoneNo' của database
    const newUserId = await User.create({
      username,
      email,
      password,
      fullName,
      phoneNo: phone,
    });

    // 5. Insert vào bảng Role tương ứng
    if (role === "customer") {
      await Customer.create(newUserId);
    } else {
      // Nếu là employee, mặc định role trong bảng Employee là "Staff" hoặc chính cái role gửi lên
      await Employee.create(newUserId, "Staff");
    }

    res.status(201).json({
      message: "Đăng ký thành công!",
      userId: newUserId,
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

// ===============================
// LOGIN
// ===============================
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. Tìm user theo username
    const user = await User.findByUsername(username);

    if (!user) {
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
    }

    // 2. Check password (Lưu ý: Nên dùng bcrypt.compare nếu đã hash)
    if (password !== user.password) {
      return res.status(400).json({ message: "Sai email hoặc mật khẩu" });
    }

    // 3. Xác định role bằng cách query bảng con
    let role = null;
    let finalRoleForToken = "customer"; // Mặc định để check quyền

    // Kiểm tra bảng Customer
    const customerRecord = await Customer.findById(user.UserID);
    if (customerRecord) {
      role = "customer";
      finalRoleForToken = "customer";
    }

    // Kiểm tra bảng Employee
    const employeeRecord = await Employee.findById(user.UserID);
    if (employeeRecord) {
      // Lấy role cụ thể trong bảng Employee (ví dụ: Manager, Staff)
      role = employeeRecord.role;
      finalRoleForToken = "employee"; // Hoặc dùng chính role kia
    }

    if (!role) {
      // Trường hợp user có trong bảng USER nhưng chưa có trong 2 bảng kia (lỗi data)
      return res
        .status(403)
        .json({ message: "Tài khoản chưa được phân quyền." });
    }

    // 4. Tạo token
    const token = jwt.sign(
      { id: user.UserID, role: finalRoleForToken },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 5. Trả về response
    res.json({
      token,
      user: {
        id: user.UserID,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

export const logout = (req, res) => {
  res.json({ message: "Đăng xuất thành công" });
};
