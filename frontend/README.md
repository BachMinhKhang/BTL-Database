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

//Phần chạy code
🚀 1. Yêu cầu hệ thống

Trước khi chạy dự án, cần cài:

Node.js ≥ 18

npm hoặc yarn

Kiểm tra phiên bản:

node -v
npm -v

📥 2. Clone dự án
git clone <link-repo-frontend>
cd frontend

📦 3. Cài đặt dependencies
npm install

Nếu có lỗi, chạy:

npm install --legacy-peer-deps

🎨 4. TailwindCSS đã được cấu hình sẵn

File cấu hình chính nằm tại:

tailwind.config.js

src/index.css

Toàn bộ component đều dùng class Tailwind nên không cần cài thêm gì.

🔧 5. Cấu hình API

Mặc định project gọi API qua file:

src/services/api.js

Để đổi URL backend, sửa:

export const BASE_URL = "http://localhost:5000/api";

▶️ 6. Chạy dự án
npm run dev

Project sẽ chạy tại:

http://localhost:5173

🗂 7. Cấu trúc thư mục
frontend/
│── public/
│── src/
│ ├── components/ # Các component UI
│ ├── pages/ # Các trang
│ ├── layouts/ # Layout chung
│ ├── services/ # Gọi API (axios)
│ ├── App.jsx
│ └── main.jsx
│── package.json
│── README.md

🔐 8. Authentication

Lưu token vào localStorage

Logout xóa token và user info

🧪 9. Build để dev
npm run dev

Output nằm trong thư mục:

dist/
