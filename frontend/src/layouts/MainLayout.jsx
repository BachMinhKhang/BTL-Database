import { Outlet } from "react-router-dom";
import Header from "../components/Header"; // Sửa lại đường dẫn cho đúng với cấu trúc của bạn
import Footer from "../components/Footer"; // Sửa lại đường dẫn cho đúng

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header cố định */}
      <Header />

      {/* Phần nội dung thay đổi (Outlet) */}
      {/* flex-grow để đẩy footer xuống đáy nếu nội dung ngắn */}
      <main className="grow pt-16">
        <Outlet />
      </main>

      {/* Footer cố định */}
      <Footer />
    </div>
  );
};

export default MainLayout;
