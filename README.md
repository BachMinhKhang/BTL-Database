Cấu trúc thư mục
BTL-Database/
├── frontend/ # React + Tailwind
├── backend/ # Node.js + Express + MSSQL
├── .gitignore
└── README.md

🧩 Quy tắc làm việc với Git

1. Không push trực tiếp lên main

Branch main đã được bảo vệ (protected).
🔥 Mọi thay đổi phải thông qua pull request.

2. Tạo branch mới để làm task

Mỗi chức năng / bug / feature → tạo 1 branch riêng:

git checkout -b feature/<ten-task>

Ví dụ:

git checkout -b feature/product-api

3. Commit & push
   git add .
   git commit -m "Mô tả rõ ràng về thay đổi"
   git push -u origin feature/<ten-task>

4. Tạo Pull Request (PR)

Vào GitHub → chọn Pull Requests

Chọn “New pull request”

Chọn branch → merge vào main

Gửi yêu cầu review

5. Không merge khi chưa được approve

Chỉ owner (hoặc người được thêm quyền) được merge.

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
