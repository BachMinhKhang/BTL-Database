import { sql } from "../config/database.js";

class Customer {
  static async create(userId) {
    const request = new sql.Request();
    request.input("id", sql.Int, userId);

    return await request.query(`
      INSERT INTO CUSTOMER (UserID) VALUES (@id)
    `);
  }

  static async findById(userId) {
    const request = new sql.Request();
    request.input("id", sql.Int, userId);

    const res = await request.query(`
      SELECT * FROM CUSTOMER WHERE UserID = @id
    `);

    return res.recordset[0];
  }
}

export default Customer;
