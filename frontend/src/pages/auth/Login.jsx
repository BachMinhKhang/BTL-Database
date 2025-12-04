import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { login } from "../../services/authService";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" }); // DB login bằng email hoặc username đều được, ở đây giữ email
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
      const response = await login(form.username, form.password);
      const user = response.user; // Đảm bảo backend trả về object user có trường role

      toast.success(`Chào mừng ${user.fullName || user.username}!`);

      // Logic chuyển trang dựa trên DB:
      // Bảng Customer không có cột role, Employee mới có.
      // Backend nên trả về 1 trường ảo 'accountType' hoặc check logic dưới:
      if (user.role && user.role !== "customer") {
        // Nếu có role và không phải customer -> Là nhân viên/admin
        navigate("/admin");
      } else {
        // Là khách hàng
        navigate("/");
      }
    } catch (err) {
      const errorMessage = err.message || "Đăng nhập thất bại!";
      setError(`*${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-center items-center h-screen bg-gray-200">
        <div className="w-96 rounded-2xl bg-white p-8 shadow-md">
          <h2 className="text-2xl text-center font-semibold mb-4">Đăng Nhập</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleChange}
              required
              value={form.email}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span
                className="absolute right-2.5 top-3 cursor-pointer select-none text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <HiEyeOff /> : <HiEye />}
              </span>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition duration-200 cursor-pointer"
            >
              {loading ? "Đang kiểm tra..." : "Đăng nhập"}
            </button>
            {error && (
              <p className="text-red-500 text-xs text-center">{error}</p>
            )}
          </form>
          <p className="text-sm text-center mt-4">
            Chưa có tài khoản?{" "}
            <Link to="/register">
              <span className="text-blue-600 hover:underline">
                Đăng ký ngay
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
