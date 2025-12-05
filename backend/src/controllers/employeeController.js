import Employee from "../models/Employee.js";

// PUT /api/employees/:id
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      password,
      phoneNo,
      fullName,
      firstName,
      lastName,
      district,
      province,
      numAndStreet,
    } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Cần cung cấp username, email và password",
      });
    }

    await Employee.update({
      userId: id,
      username,
      email,
      password,
      phoneNo,
      fullName,
      firstName,
      lastName,
      district,
      province,
      numAndStreet,
    });

    res.json({ message: "Cập nhật thông tin thành công!" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Lỗi cập nhật: " + error.message });
  }
};

// DELETE /api/employees/:id - Xóa nhân viên
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    await Employee.delete(id);
    res.json({ message: "Xóa nhân viên thành công!" });
  } catch (error) {
    res.status(400).json({
      message: "Không thể xóa nhân viên này (có thể do ràng buộc dữ liệu): " + error.message,
    });
  }
};
