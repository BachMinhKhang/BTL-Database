// config/db.js
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  },
  connectionTimeout: 30000,
  requestTimeout: 30000,
};

export const connectDB = async () => {
  try {
    await sql.connect(config);
    console.log("✅ SQL Server Connected Successfully");
  } catch (err) {
    console.error("❌ Database Connection Failed:", err);
    process.exit(1);
  }
};

// Export biến sql để dùng ở controller
export { sql };
