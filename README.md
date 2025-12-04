  Cấu trúc thư mục
BTL-Database/
├── frontend/     # React + Tailwind
├── backend/      # Node.js + Express + MSSQL
├── .gitignore
└── README.md

🚀 Cách chạy dự án
1️⃣ Clone repo
git clone <url repo>
cd BTL-Database

🖥️ Frontend (React + Tailwind)
Cài đặt
cd frontend
npm install

Chạy dev server
npm run dev


Mặc định chạy ở:

http://localhost:5173

🛠️ Backend (Node.js + Express + MSSQL)
Cài đặt
cd backend
npm install

Tạo file .env
PORT=5000

DB_USER=nodejs_user
DB_PASSWORD=123456
DB_SERVER=localhost
DB_NAME=BTL2

JWT_SECRET=your-secret-key

Chạy server
npm run dev


API chạy tại:

http://localhost:5000
