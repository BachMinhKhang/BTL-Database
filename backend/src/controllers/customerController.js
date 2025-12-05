import Customer from "../models/Customer.js";

// GET /api/customers
export const getAllCustomers = async (req, res) => {
  try {
    const { keyword, minP, maxP } = req.query;

    // Nếu có tham số search thì gọi hàm search, không thì gọi getAll
    let data;
    if (keyword || minP || maxP) {
      data = await Customer.search(keyword, minP, maxP);
    } else {
      data = await Customer.getAll();
    }

    res.json(data);
  } catch (error) {
    console.error("Get Customers Error:", error);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách khách hàng" });
  }
};

// PUT /api/customers/:id
export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, loyaltyPoint } = req.body;

    await Customer.update(id, { fullName, email, loyaltyPoint });
    res.json({ message: "Cập nhật thành công!" });
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
    res.json({ message: "Xóa thành công!" });
  } catch (error) {
    // Nếu lỗi FK (ví dụ khách đã mua hàng) thì DB sẽ throw error
    res.status(400).json({
      message: "Không thể xóa khách hàng này (có thể do ràng buộc dữ liệu)",
    });
  }
};
