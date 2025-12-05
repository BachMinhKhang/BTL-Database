import { sql } from "../config/database.js";

class Customer {
  // 1. Lấy tất cả (Gọi SP_GetAllCustomer)
  static async getAll(sortBy, filterType, filterValue) {
    const request = new sql.Request();

    // Truyền tham số (nếu frontend không gửi thì để null/default)
    request.input("SortBy", sql.VarChar, sortBy || "Spent");
    request.input("FilterType", sql.VarChar, filterType || null);
    request.input("FilterValue", sql.Decimal(12, 2), filterValue || 0);

    const result = await request.execute("SP_GetAllCustomer");
    return result.recordset;
  }

  // 3. Cập nhật (Gọi SP_UpdateCustomer)
  static async update(id, { fullName, email, loyaltyPoint }) {
    const request = new sql.Request();
    request.input("UserID", sql.Int, id);
    request.input("FullName", sql.NVarChar, fullName);
    request.input("Email", sql.VarChar, email);
    request.input("LoyaltyPoint", sql.Int, loyaltyPoint);

    await request.execute("SP_UpdateCustomer");
    return true;
  }

  // 4. Xóa (Gọi SP_DeleteCustomer)
  static async delete(id) {
    const request = new sql.Request();
    request.input("UserID", sql.Int, id);

    await request.execute("SP_DeleteCustomer");
    return true;
  }

  static async findById(id) {
    const request = new sql.Request();
    request.input("id", sql.Int, id);

    const result = await request.query(
      "SELECT * FROM Customer WHERE UserID = @id"
    );

    return result.recordset[0];
  }
}

export default Customer;
