📌 README – Backend BTL2 (Express + MSSQL)
🚀 1. Giới thiệu

Backend này được xây bằng Node.js + Express và kết nối tới SQL Server (MSSQL) bằng thư viện mssql.

Chức năng hiện tại:

Kết nối database SQL Server

API cơ bản (user/products/…)

📦 2. Yêu cầu hệ thống

Cần cài trước:

Node.js ≥ 18

SQL Server (MSSQL)

SQL Server Management Studio (SSMS)

npm (đi kèm Node)

🗂 3. Cài đặt thư viện

Trong thư mục backend/ chạy:

npm install

🔐 4. Tạo file môi trường .env

Tạo file .env trong backend:

VITE_API_BASE_URL=http://localhost:5000/api
PORT=5000

DB_SERVER=localhost
DB_NAME=BTL2
DB_USER=nodejs_user
DB_PASS=123456

NODE_ENV=development

🛢 5. Cấu hình database MSSQL
5.1 Bật Mixed Mode Authentication

Nếu SQL của bạn chưa bật:

Chuột phải SQL Server → Properties

Tab Security

Chọn SQL Server and Windows Authentication

Restart SQL Server

5.2 Tạo login và user cho Node.js

Chạy bằng SSMS:

USE master;
GO
CREATE LOGIN [nodejs_user] WITH PASSWORD = N'123456', CHECK_POLICY = OFF;
GO

USE BTL2;
GO
CREATE USER [nodejs_user] FOR LOGIN [nodejs_user];
GO

ALTER ROLE [db_datareader] ADD MEMBER [nodejs_user];
ALTER ROLE [db_datawriter] ADD MEMBER [nodejs_user];
GO

Kiểm tra authentication mode:

SELECT CASE SERVERPROPERTY('IsIntegratedSecurityOnly')
WHEN 1 THEN 'Windows Authentication Only (Cần sửa)'
WHEN 0 THEN 'Mixed Mode (Đã OK)'
END;

6. Chạy Backend
   Development:
   npm run dev

Server sẽ chạy ở:

👉 http://localhost:5000
