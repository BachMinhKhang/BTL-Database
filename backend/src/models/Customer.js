import { sql } from "../config/database.js";

class Customer {
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

  // 3. Cập nhật (Gọi sp_UpdateUser)
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

  // 4. Xóa (Gọi sp_DeleteUser)
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
