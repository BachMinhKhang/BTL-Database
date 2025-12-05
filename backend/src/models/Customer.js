import { sql } from "../config/database.js";

class Customer {
  static async register({ username, email, password, fullName, phone }) {
    const request = new sql.Request();

    request.input("username", sql.VarChar, username);
    request.input("email", sql.VarChar, email);
    // Nếu cần bảo mật, hãy hash password trước khi truyền vào đây
    request.input("password", sql.VarChar, password); 
    request.input("phoneNo", sql.VarChar, phone);
    request.input("fullName", sql.NVarChar, fullName);
    // Mặc định loyaltyPoint là 0 khi đăng ký mới
    request.input("loyaltyPoint", sql.Int, 0);

    // Gọi thủ tục sp_InsertCustomer đã định nghĩa trong SQL
    const result = await request.execute("sp_InsertCustomer");
    
    // Trả về dòng dữ liệu user vừa tạo
    return result.recordset[0];
  }
  // 1. Lấy tất cả (Gọi SP_GetAllCustomer)
  static async getAll() {
    const request = new sql.Request();
    // Execute gọi thủ tục, không viết query thường
    const result = await request.execute("SP_GetAllCustomer");
    return result.recordset;
  }

  // 2. Tìm kiếm (Gọi SP_SearchUser)
  static async search(keyword, minP, maxP) {
    const request = new sql.Request();

    // Check null để truyền vào SP đúng logic
    request.input("Keyword", sql.NVarChar, keyword || null);
    request.input("MinP", sql.Int, minP === "" ? null : minP);
    request.input("MaxP", sql.Int, maxP === "" ? null : maxP);

    const result = await request.execute("SP_SearchUser");
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
