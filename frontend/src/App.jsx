// App.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/customer/Home";
import CustomerProfile from "./pages/customer/Profile";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// --- Admin Pages (Manager) ---
import Dashboard from "./pages/admin/Dashboard";
import CustomerManager from "./pages/admin/CustomerManager";
import AdminProfile from "./pages/admin/Profile";

import ProtectedRoute from "./components/ProtectedRoute";

import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <div>
      <Routes>
        {/* =========================================
            PHÂN HỆ CUSTOMER (PUBLIC)
           ========================================= */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<CustomerProfile />} />
          {/* <Route path="product/:id" element={<ProductDetail />} /> */}
          {/* <Route path="cart" element={<Cart />} /> */}
        </Route>

        {/* =========================================
            PHÂN HỆ ADMIN (PRIVATE/MANAGER)
           ========================================= */}
        {/* Bọc trong ProtectedRoute để chặn khách hàng truy cập vào admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["!customer"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} /> {/* /admin */}
          <Route path="customers" element={<CustomerManager />} />{" "}
          {/* /admin/customers */}
          <Route path="profile" element={<AdminProfile />} />
        </Route>
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}
