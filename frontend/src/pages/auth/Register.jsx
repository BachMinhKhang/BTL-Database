import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { register } from "../../services/authService";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    repassword: "",
    phoneNo: "",
    role: "customer", // Mặc định
    employeeRole: "ProductMgr", // Mặc định nếu chọn là nhân viên
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showRepassword, setShowRepassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Xóa lỗi khi nhập lại
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    let hasError = false;

    // --- Validate ---
    if (!form.username.trim()) {
      newErrors.username = "*Username không được để trống";
      hasError = true;
    }
    if (form.username.includes(" ")) {
      newErrors.username = "*Username không được chứa khoảng trắng";
      hasError = true;
    }
    if (form.password.length < 6) {
      newErrors.password = "*Mật khẩu phải từ 6 ký tự trở lên";
      hasError = true;
    }
    if (form.password !== form.repassword) {
      newErrors.repassword = "*Mật khẩu không khớp!";
      hasError = true;
    }
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(form.phoneNo)) {
      newErrors.phone = "*SĐT phải có 10 số và bắt đầu bằng số 0";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setLoading(true);
      try {
        // Chuẩn bị payload gửi lên backend
        const payload = {
          username: form.username,
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phoneNo: form.phoneNo,
          role: form.role,
        };

        // Nếu là employee, cần gửi thêm role cụ thể để thỏa mãn CHECK constraint trong DB
        if (form.role === "employee") {
          payload.employeeRole = form.employeeRole;
        }

        await register(payload);

        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/login");
      } catch (error) {
        console.error(error);
        const errorMessage = error.message || "Đăng ký thất bại!";

        if (errorMessage.toLowerCase().includes("email")) {
          setErrors({ ...newErrors, email: "*Email đã được sử dụng!" });
        } else if (errorMessage.toLowerCase().includes("username")) {
          setErrors({ ...newErrors, username: "*Username đã tồn tại!" });
        } else {
          setErrors({ ...newErrors, general: errorMessage });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Tạo tài khoản mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username (viết liền không dấu)"
              value={form.username}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.username
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div className="flex gap-3">
            {/*Last Name */}
            <div className="w-72">
              <input
                type="text"
                name="lastName"
                placeholder="Họ và tên đệm"
                value={form.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* First Name */}
            <div>
              <input
                type="text"
                name="firstName"
                placeholder="Tên"
                value={form.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              placeholder="Địa chỉ Email"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
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
              name="phoneNo"
              placeholder="Số điện thoại (10 số)"
              value={form.phoneNo}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.phone
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            />
            <span
              className="absolute right-3 top-3.5 cursor-pointer text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </span>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* Repassword */}
          <div className="relative">
            <input
              type={showRepassword ? "text" : "password"}
              name="repassword"
              placeholder="Nhập lại mật khẩu"
              value={form.repassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 pr-10 ${
                errors.repassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              required
            />
            <span
              className="absolute right-3 top-3.5 cursor-pointer text-gray-500"
              onClick={() => setShowRepassword(!showRepassword)}
            >
              {showRepassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </span>
            {errors.repassword && (
              <p className="text-red-500 text-xs mt-1">{errors.repassword}</p>
            )}
          </div>

          {/* ROLE SELECTION */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bạn đăng ký với vai trò gì?
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="customer"
                  checked={form.role === "customer"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Khách hàng</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="employee"
                  checked={form.role === "employee"}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">Nhân viên</span>
              </label>
            </div>

            {/* [FIX] Dropdown chọn chức vụ cụ thể nếu là nhân viên */}
            {form.role === "employee" && (
              <div className="mt-3 animate-fade-in">
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  Chọn chức vụ (Bắt buộc theo DB)
                </label>
                <select
                  name="employeeRole"
                  value={form.employeeRole}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ProductMgr">
                    Quản lý Sản phẩm (ProductMgr)
                  </option>
                  <option value="OrderMgr">Quản lý Đơn hàng (OrderMgr)</option>
                  <option value="CouponMgr">
                    Quản lý Mã giảm giá (CouponMgr)
                  </option>
                </select>
              </div>
            )}
          </div>

          {/* GENERAL ERROR */}
          {errors.general && (
            <div className="bg-red-50 text-red-600 p-3 rounded text-center text-sm border border-red-200">
              {errors.general}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition duration-200 shadow-md mt-4"
          >
            {loading ? "Đang xử lý..." : "ĐĂNG KÝ TÀI KHOẢN"}
          </button>
        </form>

        <div className="text-sm text-center mt-6 pt-4 border-t border-gray-100">
          Đã có tài khoản?{" "}
          <Link to="/login">
            <span className="text-green-600 hover:text-green-800 font-bold hover:underline">
              Đăng nhập ngay
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
