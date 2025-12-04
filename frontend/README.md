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
