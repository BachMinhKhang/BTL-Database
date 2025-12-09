import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCurrentUser, logout } from "../../services/authService";
// 1. Import service lấy dữ liệu mới
import { getUserById } from "../../services/userService";
// 2. Import service cập nhật/xóa nhân viên
import { updateEmployee, deleteEmployee } from "../../services/employeeService";

const pickId = (u) => u?.UserID ?? u?.userId ?? u?.id ?? u?.userid;

export default function EmployeeProfile() {
  const navigate = useNavigate();

  // Lấy UserID từ localStorage để biết đang load ai
  const currentUser = useMemo(() => getCurrentUser(), []);
  const userId = useMemo(() => pickId(currentUser), [currentUser]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    phoneNo: "",
    firstName: "",
    lastName: "",
    role: "Employee", // Mặc định
    district: "",
    province: "",
    numAndStreet: "",
  });

  // --- 1. FETCH DATA TỪ SERVER ---
  useEffect(() => {
    if (!currentUser || !userId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy dữ liệu mới nhất
        const userData = await getUserById(userId);

        if (userData) {
          setForm((prev) => ({
            ...prev,
            username: userData.username || "",
            email: userData.email || "",
            password: "", // Luôn reset password
            phoneNo: userData.phoneNo || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            role: currentUser.role || "Employee", // Lấy role từ DB
            district: userData.district || "",
            province: userData.province || "",
            numAndStreet: userData.numAndStreet || "",
          }));
        }
      } catch (error) {
        console.error("Profile Load Error:", error);
        if (error.response && error.response.status === 404) {
          toast.error("Không tìm thấy thông tin nhân viên.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, userId, navigate]);

  // Handle Input Change
  const onChange = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  // --- 2. XỬ LÝ CẬP NHẬT ---
  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) return;

    // Payload: Chỉ gửi password nếu có nhập
    const payload = { ...form };
    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
    }

    setSaving(true);
    try {
      // Gọi service updateEmployee (đã có ở employeeService.js)
      await updateEmployee(userId, payload);

      toast.success("Cập nhật hồ sơ thành công!");

      // Cập nhật lại localStorage để Header hiển thị đúng
      const newUserLocal = {
        ...currentUser,
        ...payload,
        UserID: userId,
      };
      delete newUserLocal.password; // Không lưu pass vào local

      localStorage.setItem("user", JSON.stringify(newUserLocal));
      window.dispatchEvent(new Event("userUpdated"));
    } catch (err) {
      const msg = err.response?.data?.message || "Cập nhật thất bại!";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // --- 3. XỬ LÝ XÓA TÀI KHOẢN ---
  const handleDelete = async () => {
    if (!userId) return;
    const ok = window.confirm(
      "CẢNH BÁO: Bạn có chắc muốn xóa tài khoản này?\nHành động này không thể hoàn tác."
    );
    if (!ok) return;

    try {
      await deleteEmployee(userId);
      toast.success("Đã xóa tài khoản.");

      await logout().catch(() => {});
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userUpdated"));
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Không thể xóa (có thể do ràng buộc dữ liệu)."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium animate-pulse">
          Đang tải hồ sơ...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-10 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Hồ sơ nhân viên
              </h1>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                ID:{" "}
                <span className="font-mono bg-gray-100 px-2 rounded text-gray-700">
                  #{userId}
                </span>
                <span className="px-3 py-0.5 bg-purple-100 text-purple-700 rounded-full text-sm font-bold">
                  {form.role}
                </span>
              </p>
            </div>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition text-sm font-medium"
            >
              Xóa tài khoản
            </button>
          </div>
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Field
              label="Tên đăng nhập"
              value={form.username}
              onChange={onChange("username")}
            />

            {/* Chức vụ thường không cho nhân viên tự sửa, chỉ Admin hoặc Manager sửa */}
            <Field
              label="Chức vụ (Role)"
              value={form.role}
              onChange={onChange("role")}
              disabled={true}
            />

            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={onChange("email")}
              required
            />
            <Field
              label="Số điện thoại"
              value={form.phoneNo}
              onChange={onChange("phoneNo")}
            />

            <div className="md:col-span-2">
              <Field
                label="Mật khẩu (Dùng để đổi thông tin)"
                type="password"
                value={form.password}
                onChange={onChange("password")}
                placeholder="Để trống nếu không đổi"
              />
            </div>
            {/* Placeholder field để căn chỉnh layout lưới */}

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Họ & Tên đệm"
                value={form.lastName}
                onChange={onChange("lastName")}
              />
              <Field
                label="Tên"
                value={form.firstName}
                onChange={onChange("firstName")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Tỉnh/Thành"
                value={form.province}
                onChange={onChange("province")}
              />
              <Field
                label="Quận/Huyện"
                value={form.district}
                onChange={onChange("district")}
              />
            </div>

            <div className="md:col-span-2">
              <Field
                label="Số nhà, Tên đường"
                value={form.numAndStreet}
                onChange={onChange("numAndStreet")}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-50">
            <button
              type="button"
              onClick={() => navigate("/admin")} // Quay về dashboard admin
              className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 transition font-medium"
            >
              Về Dashboard
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed transition font-bold shadow-lg shadow-blue-200"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Đang lưu...
                </span>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component Field tái sử dụng (giống bên Customer)
function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  disabled = false,
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-gray-600 mb-1.5 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </div>
      <input
        className={`w-full border rounded-xl px-4 py-2.5 outline-none transition-all duration-200
          ${
            disabled
              ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
              : "bg-white border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          }`}
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
      />
    </label>
  );
}
