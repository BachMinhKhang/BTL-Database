// src/models/User.js
import { sql } from "../config/database.js";

class User {
  // Tìm user bằng email
  static async findByEmail(email) {
    const request = new sql.Request();
    request.input("email", sql.VarChar, email);
    const result = await request.query(
      "SELECT * FROM [USER] WHERE email = @email"
    );
    return result.recordset[0];
  }

  // Tìm user bằng username (Mới thêm)
  static async findByUsername(username) {
    const request = new sql.Request();
    request.input("username", sql.VarChar, username);
    const result = await request.query(
      "SELECT * FROM [USER] WHERE username = @username"
    );
    return result.recordset[0];
  }

  // Tìm user bằng ID
  static async findById(id) {
    const request = new sql.Request();
    request.input("id", sql.Int, id);
    const result = await request.query(
      "SELECT * FROM [USER] WHERE UserID = @id"
    );
    return result.recordset[0];
  }

  // Tạo user mới
  static async create({ username, email, password, fullName, phoneNo }) {
    const request = new sql.Request();
    request.input("username", sql.VarChar, username);
    request.input("email", sql.VarChar, email);
    request.input("password", sql.VarChar, password); // Lưu ý: Nên hash password trước khi truyền vào đây nếu có thể
    request.input("fullName", sql.VarChar, fullName);
    request.input("phoneNo", sql.VarChar, phoneNo);

    // Chỉ insert các trường cơ bản từ form đăng ký, các trường địa chỉ để NULL
    const result = await request.query(`
      INSERT INTO [USER] (username, email, password, fullName, phoneNo)
      OUTPUT INSERTED.UserID
      VALUES (@username, @email, @password, @fullName, @phoneNo)
    `);

    return result.recordset[0].UserID;
  }
}

export default User;
