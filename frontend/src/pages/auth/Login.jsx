import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { login } from "../../services/authService";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  // State khởi tạo đúng với logic login
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gọi API login
      const response = await login(form.username, form.password);
      const user = response.user;

      toast.success(`Chào mừng ${user.firstName || user.fullName || user.username}!`);

      // Logic chuyển hướng dựa trên Role từ Database
      // Database trả về role: 'customer' hoặc 'ProductMgr', 'Sales', v.v...
      if (user.role && user.role.toLowerCase() !== "customer") {
        // Nếu là nhân viên/admin -> vào trang quản trị
        navigate("/admin");
      } else {
        // Nếu là khách hàng -> vào trang chủ
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      // Lấy message lỗi từ backend (nếu có)
      const errorMessage = err.message || "Tên đăng nhập hoặc mật khẩu không đúng!";
      setError(`*${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 shadow-lg">
        <h2 className="text-3xl text-center font-bold text-gray-800 mb-6">Đăng Nhập</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* USERNAME INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <input
              type="text"
              name="username"
              placeholder="Nhập username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onChange={handleChange}
              required
              // [FIX] Sửa lỗi binding nhầm form.email -> form.username
              value={form.username} 
            />
          </div>

          {/* PASSWORD INPUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition pr-10"
              />
              <span
                className="absolute right-3 top-3.5 cursor-pointer text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 mt-2"
          >
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center">
              {error}
            </div>
          )}
        </form>

        <p className="text-sm text-center mt-6 text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register">
            <span className="text-blue-600 font-semibold hover:underline">
              Đăng ký ngay
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;