import Customer from "../models/Customer.js";
// GET /api/customers
export const getAllCustomers = async (req, res) => {
  try {
    const { sortBy, filterType, filterValue } = req.query;

    // Nếu có tham số search thì gọi hàm search, không thì gọi getAll
    let data = await Customer.getAll(sortBy, filterType, filterValue);

    res.json(data);
  } catch (error) {
    console.error("Get Customers Error:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách khách hàng" });
  }
};

export const createCustomer = async (req, res) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    phoneNo,
    district,
    province,
    numAndStreet,
    loyaltyPoint,
  } = req.body;
  let fullName = lastName + firstName;
  try {
    let newUser = await Customer.register({
      username,
      email,
      password,
      firstName,
      lastName,
      fullName,
      phoneNo,
      district,
      province,
      numAndStreet,
    });

    res.status(201).json({
      message: "Tạo Customer thành công!",
      data: newUser,
    });
  } catch (err) {
    console.error("Create Customer Error:", err);

    // Xử lý lỗi từ SQL Server (THROW)
    // Ví dụ: err.number 53008 (Email trùng), 53004 (Username trùng), 53011 (SĐT sai)
    if (err.number) {
      // Trả về đúng message lỗi mà SQL Server đã THROW
      return res.status(400).json({ message: err.message });
    }

    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

// PUT /api/customers/:id
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      password,
      phoneNo,
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
    let fullName = lastName + firstName;
    await Customer.update({
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

// DELETE /api/customers/:id
export const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    await Customer.delete(id);
    res.json({ message: "Xóa khách hàng thành công!" });
  } catch (error) {
    // Nếu lỗi FK (ví dụ khách đã mua hàng) thì DB sẽ throw error
    res.status(400).json({
      message:
        "Không thể xóa khách hàng này (có thể do ràng buộc dữ liệu): " +
        error.message,
    });
  }
};
