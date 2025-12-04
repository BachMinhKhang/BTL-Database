import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../services/authService";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuth = isAuthenticated();
  const user = getCurrentUser();

  // 1. Chưa đăng nhập -> Đá về Login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // 2. Đã đăng nhập nhưng Role không nằm trong danh sách cho phép (VD: customer cố vào admin)
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Đá về trang chủ hoặc trang báo lỗi 403
    return <Navigate to="/" replace />;
  }

  // 3. Hợp lệ -> Cho hiện nội dung (Outlet hoặc children)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
