import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../services/authService";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuth = isAuthenticated();
  const user = getCurrentUser();

  // 1. Chưa đăng nhập -> Đá về Login
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles?.includes("!customer")) {
    if (user?.role === "customer") {
      return <Navigate to="/" replace />;
    }
  } else {
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
      return <Navigate to="/" replace />;
    }
  }
  // 3. Hợp lệ -> Cho hiện nội dung (Outlet hoặc children)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
