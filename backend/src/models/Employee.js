import { sql } from "../config/database.js";

class Employee {
  static async register({
    username,
    email,
    password,
    firstName = null,
    lastName = null,
    fullName = null,
    phone,
    role,
  }) {
    const request = new sql.Request();

    request.input("username", sql.VarChar, username);
    request.input("email", sql.VarChar, email);
    request.input("password", sql.VarChar, password);
    request.input("phoneNo", sql.VarChar, phone);
    request.input("firstName", sql.NVarChar, firstName);
    request.input("lastName", sql.NVarChar, lastName);
    request.input("fullName", sql.NVarChar, fullName);

    // @employeeRole phải khớp với các giá trị CHECK trong SQL (ProductMgr, OrderMgr, CouponMgr)
    request.input("employeeRole", sql.NVarChar, role);

    const result = await request.execute("sp_InsertEmployee");
    return result.recordset[0];
  }

  // Update
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

  // Xóa nhân viên (gọi sp_DeleteUser)
  static async delete(userId) {
    const request = new sql.Request();
    request.input("UserID", sql.Int, userId);

    await request.execute("sp_DeleteUser");
    return true;
  }

  // Tìm theo UserID (FK)
  static async findById(userId) {
    const request = new sql.Request();
    request.input("id", sql.Int, userId);

    const res = await request.query(`
      SELECT * FROM EMPLOYEE WHERE UserID = @id
    `);

    return res.recordset[0];
  }
}

export default Employee;
