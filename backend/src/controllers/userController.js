import User from "../models/User.js";
export const getOneUser = async (req, res) => {
  try {
    // 1. Lấy ID từ params (ví dụ: /users/5 -> id = 5)
    const { id } = req.params;

    // Kiểm tra xem ID có hợp lệ không (nếu cần)
    if (!id) {
      return res.status(400).json({ message: "Thiếu User ID" });
    }

    // 2. Gọi Service
    const user = await User.findById(id);

    // 3. Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // 4. BẢO MẬT: Loại bỏ password ra khỏi kết quả trước khi trả về
    const { password, ...userData } = user;

    // 5. Trả về thông tin (đã ẩn password)
    return res.status(200).json({
      message: "Lấy thông tin thành công",
      data: userData,
    });
  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({ message: "Lỗi Server" });
  }
};
