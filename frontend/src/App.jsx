import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/customer/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Cart from "./pages/customer/Cart"; 

import Dashboard from "./pages/admin/DashBoard"; 
import CustomerManager from "./pages/admin/CustomerManager";
import EmployeeManager from "./pages/admin/EmployeeManager";

import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";

// --- XÓA CÁC DÒNG CODE BACKEND Ở ĐÂY NẾU CÒN ---

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="cart" element={<Cart />} /> 
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["!customer"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<CustomerManager />} />
          <Route path="employees" element={<EmployeeManager />} />
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