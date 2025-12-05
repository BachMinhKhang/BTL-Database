import { sql } from "../config/database.js";

class Employee {
  static async register({ username, email, password, fullName, phone, role }) {
    const request = new sql.Request();

    request.input("username", sql.VarChar, username);
    request.input("email", sql.VarChar, email);
    request.input("password", sql.VarChar, password);
    request.input("phoneNo", sql.VarChar, phone);
    request.input("fullName", sql.NVarChar, fullName);
    
    // @employeeRole phải khớp với các giá trị CHECK trong SQL (ProductMgr, OrderMgr, CouponMgr)
    request.input("employeeRole", sql.NVarChar, role);

    const result = await request.execute("sp_InsertEmployee");
    return result.recordset[0];
  }
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
}

export default Employee;
