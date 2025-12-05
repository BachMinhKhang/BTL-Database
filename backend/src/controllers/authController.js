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
    // 1. Validate input cơ bản từ phía Client
    if (!["customer", "employee"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    let newUser = null;

    // 2. Gọi Model để thực thi Stored Procedure
    if (role === "customer") {
      newUser = await Customer.register({
        username,
        email,
        password,
        fullName,
        phone,
      });
    } else {
      // Logic cho Employee: Cần role cụ thể (ProductMgr, OrderMgr, CouponMgr)
      // Nếu client chỉ gửi 'employee', ta cần một cơ chế để xác định role cụ thể.
      // Ở đây ví dụ lấy từ req.body.employeeRole hoặc mặc định là 'ProductMgr'
      const specificRole = req.body.employeeRole || "ProductMgr";

      newUser = await Employee.register({
        username,
        email,
        password,
        fullName,
        phone,
        role: specificRole,
      });
    }

    // 3. Phản hồi thành công
    res.status(201).json({
      message: "Đăng ký thành công!",
      data: newUser,
    });
  } catch (err) {
    console.error("Register Error:", err);

    // Xử lý lỗi từ SQL Server (THROW)
    // Ví dụ: err.number 53008 (Email trùng), 53004 (Username trùng), 53011 (SĐT sai)
    if (err.number) {
      // Trả về đúng message lỗi mà SQL Server đã THROW
      return res.status(400).json({ message: err.message });
    }

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
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    // 2. Check password 
    // (Lưu ý: Nếu bạn chưa hash password trong SP thì so sánh string thường)
    if (password !== user.password) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    // 3. Xác định role cụ thể
    let roleName = null;
    let finalRoleForToken = "customer"; 

    // Kiểm tra bảng Customer
    const customerRecord = await Customer.findById(user.UserID);
    if (customerRecord) {
      roleName = "Customer";
      finalRoleForToken = "customer";
    }

    // Kiểm tra bảng Employee
    const employeeRecord = await Employee.findById(user.UserID);
    if (employeeRecord) {
      roleName = employeeRecord.role; // ProductMgr, OrderMgr...
      finalRoleForToken = "employee";
    }

    if (!roleName) {
      return res
        .status(403)
        .json({ message: "Tài khoản tồn tại nhưng chưa được phân quyền." });
    }

    // 4. Tạo token JWT
    const token = jwt.sign(
      { id: user.UserID, role: finalRoleForToken },
      process.env.JWT_SECRET || "secretKey", // Khuyên dùng biến môi trường
      { expiresIn: "1d" }
    );

    // 5. Trả về response
    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.UserID,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: roleName,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// ===============================
// LOGOUT
// ===============================
export const logout = (req, res) => {
  res.json({ message: "Đăng xuất thành công" });
};