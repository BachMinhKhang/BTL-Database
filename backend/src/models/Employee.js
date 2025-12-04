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
}

export default Employee;
