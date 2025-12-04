// App.jsx
import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/customer/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// --- Admin Pages (Manager) ---
import Dashboard from "./pages/admin/Dashboard";
import CustomerManager from "./pages/admin/CustomerManager";
import EmployeeManager from "./pages/admin/EmployeeManager";
import RevenueManager from "./pages/admin/RevenueManager";

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
            <ProtectedRoute
              allowedRoles={["employee", "manager", "admin", "Staff"]}
            >
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} /> {/* /admin */}
          <Route path="customers" element={<CustomerManager />} />{" "}
          {/* /admin/customers */}
          <Route path="employees" element={<EmployeeManager />} />{" "}
          {/* /admin/employees */}
          <Route path="reports" element={<RevenueManager />} />{" "}
          {/* /admin/reports */}
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
