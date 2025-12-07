import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  HiChartPie,
  HiUsers,
  HiUserGroup,
  HiDocumentReport,
  HiLogout,
  HiMenuAlt3,
} from "react-icons/hi";
import { logout, getCurrentUser } from "../services/authService";
import { toast } from "react-toastify";

export default function AdminLayout() {
  const navigate = useNavigate();
  const user = getCurrentUser(); // Lấy thông tin user để hiện tên
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Xử lý đăng xuất
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Danh sách menu
  const menuItems = [
    {
      path: "/admin",
      label: "Dashboard",
      icon: <HiChartPie size={20} />,
      end: true,
    },
    {
      path: "/admin/customers",
      label: "Quản lý Khách hàng",
      icon: <HiUsers size={20} />,
    },
    {
      path: "/admin/profile",
      label: "Profile",
      icon: <HiChartPie size={20} />,
      end: true,
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } bg-slate-800 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center justify-center border-b border-slate-700">
          <h1 className={`font-bold text-xl ${!isSidebarOpen && "hidden"}`}>
            Admin <span className="text-blue-400">Panel</span>
          </h1>
          {/* Icon rút gọn sidebar (Optional) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-2 rounded hover:bg-slate-700 ${
              !isSidebarOpen && "block"
            }`}
          >
            {/* Bạn có thể thêm icon logo nhỏ ở đây nếu muốn */}
          </button>
        </div>

        {/* Menu Links */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end} // end=true để Dashboard không luôn sáng khi vào con
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                }`
              }
            >
              <span className="shrink-0">{item.icon}</span>
              <span
                className={`ml-3 font-medium ${!isSidebarOpen && "hidden"}`}
              >
                {item.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-700">
          <div
            className={`flex items-center gap-3 ${
              !isSidebarOpen && "justify-center"
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className={`${!isSidebarOpen && "hidden"}`}>
              <p className="text-sm font-semibold">
                {user?.username || "Admin"}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user?.role || "Manager"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <HiMenuAlt3 size={24} />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-gray-600 text-sm hidden sm:block">
              Xin chào, <strong>{user?.firstName || user?.username}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <HiLogout size={18} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* Content Body (Nơi các trang con hiển thị) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
