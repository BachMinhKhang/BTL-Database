import { sql } from "../config/database.js";

class Customer {
  static async register({
    username,
    email,
    password,
    firstName = null,
    lastName = null,
    fullName = null,
    phoneNo = null,
    district = null,
    province = null,
    numAndStreet = null,
  }) {
    const request = new sql.Request();

    request.input("username", sql.VarChar, username);
    request.input("email", sql.VarChar, email);
    request.input("password", sql.VarChar, password);
    request.input("phoneNo", sql.VarChar, phoneNo);
    request.input("firstName", sql.NVarChar, firstName);
    request.input("lastName", sql.NVarChar, lastName);
    request.input("fullName", sql.NVarChar, fullName);
    request.input("district", sql.NVarChar, district);
    request.input("province", sql.NVarChar, province);
    request.input("numAndStreet", sql.NVarChar, numAndStreet);
    request.input("loyaltyPoint", sql.Int, 0);

    // Gọi thủ tục sp_InsertCustomer đã định nghĩa trong SQL
    const result = await request.execute("sp_InsertCustomer");

    // Trả về dòng dữ liệu user vừa tạo
    return result.recordset[0];
  }
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
  static async update({
    userId,
    username,
    email,
    password,
    phoneNo = null,
    fullName = null,
    firstName = null,
    lastName = null,
    district = null,
    province = null,
    numAndStreet = null,
  }) {
    const request = new sql.Request();
    request.input("UserID", sql.Int, userId);
    request.input("username", sql.VarChar, username);
    request.input("email", sql.VarChar, email);
    request.input("password", sql.VarChar, password);
    request.input("phoneNo", sql.VarChar, phoneNo);
    request.input("fullName", sql.NVarChar, fullName);
    request.input("firstName", sql.NVarChar, firstName);
    request.input("lastName", sql.NVarChar, lastName);
    request.input("district", sql.NVarChar, district);
    request.input("province", sql.NVarChar, province);
    request.input("numAndStreet", sql.NVarChar, numAndStreet);

    await request.execute("sp_UpdateUser");
    return true;
  }

  // 4. Xóa (Gọi SP_DeleteCustomer)
  static async delete(id) {
    const request = new sql.Request();
    request.input("UserID", sql.Int, id);

    await request.execute("sp_DeleteUser");
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
