import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { register } from "../../services/authService";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", // Thêm username
    fullName: "",
    email: "",
    password: "",
    repassword: "",
    phone: "",
    role: "customer", // Mặc định là khách hàng
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showRepassword, setShowRepassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Xóa lỗi khi người dùng nhập lại
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    let hasError = false;

    // Validate Username (Database yêu cầu NOT NULL)
    if (!form.username.trim()) {
      newErrors.username = "*Tên đăng nhập không được để trống";
      hasError = true;
    }

    // Validate Password match
    if (form.password !== form.repassword) {
      newErrors.repassword = "*Mật khẩu nhập lại không khớp!";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setLoading(true);
      try {
        // Gọi API register với cấu trúc dữ liệu khớp với DB
        await register({
          username: form.username,
          email: form.email,
          password: form.password,
          fullName: form.fullName, // Backend sẽ lưu vào cột fullName
          phone: form.phone, // Backend sẽ lưu vào cột phoneNo
          role: form.role, // Backend dùng cái này để if-else insert vào bảng CUSTOMER hay EMPLOYEE
        });

        toast.success("Đăng ký thành công!");
        navigate("/login");
      } catch (error) {
        const errorMessage = error.message || "Đăng ký thất bại!";
        // Xử lý lỗi từ backend (ví dụ trùng username/email)
        if (errorMessage.toLowerCase().includes("email")) {
          setErrors({ ...newErrors, email: "*Email đã được sử dụng!" });
        } else if (errorMessage.toLowerCase().includes("username")) {
          setErrors({ ...newErrors, username: "*Tên đăng nhập đã tồn tại!" });
        } else {
          setErrors({ ...newErrors, general: errorMessage });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 relative">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96 my-10">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Đăng ký tài khoản
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <input
              type="text"
              name="username"
              placeholder="Tên đăng nhập (Username)"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Họ và tên"
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              name="phone"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
            />
            <span
              className="absolute right-2.5 top-3 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <HiEyeOff /> : <HiEye />}
            </span>
          </div>

          {/* Repassword */}
          <div className="relative">
            <input
              type={showRepassword ? "text" : "password"}
              name="repassword"
              placeholder="Nhập lại mật khẩu"
              value={form.repassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              required
            />
            <span
              className="absolute right-2.5 top-3 cursor-pointer text-gray-500"
              onClick={() => setShowRepassword(!showRepassword)}
            >
              {showRepassword ? <HiEyeOff /> : <HiEye />}
            </span>
            {errors.repassword && (
              <p className="text-red-500 text-xs mt-1">{errors.repassword}</p>
            )}
          </div>

          {errors.general && (
            <p className="text-red-500 text-xs text-center">{errors.general}</p>
          )}
          {/* Role Selection */}

          <div>
            <label className="block text-sm text-gray-700 mb-1 ml-1">
              Loại tài khoản
            </label>

            <div className="flex items-center gap-6 ml-1">
              {/* Customer */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={form.role === "customer"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Khách hàng</span>
              </label>

              {/* Employee */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={form.role === "employee"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600"
                />
                <span>Nhân viên</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg transition duration-200 cursor-pointer font-semibold"
          >
            {loading ? "Đang xử lý..." : "Đăng ký ngay"}
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Đã có tài khoản?{" "}
          <Link to="/login">
            <span className="text-green-600 hover:underline font-medium">
              Đăng nhập
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
