import { sql } from "../config/database.js";

class Employee {
  static async create(userId, role) {
    const request = new sql.Request();
    request.input("id", sql.Int, userId);
    request.input("role", sql.VarChar, role);

    return await request.query(`
      INSERT INTO EMPLOYEE (UserID, role)
      VALUES (@id, @role)
    `);
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

  // Cập nhật nhân viên (gọi sp_UpdateUser)
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
}

export default Employee;
