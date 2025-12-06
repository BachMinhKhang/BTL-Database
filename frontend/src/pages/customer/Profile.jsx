import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCurrentUser, logout } from "../../services/authService";
// 1. Import service mới
import { getUserById } from "../../services/userService";
// 2. Import service cũ (để dùng hàm update/delete)
import { updateCustomer, deleteCustomer } from "../../services/customerService";

// Hàm tiện ích lấy ID từ object user (vì DB có thể trả về UserID, userId, hoặc id)
const pickId = (u) => u?.UserID ?? u?.userId ?? u?.id ?? u?.userid;

export default function Profile() {
  const navigate = useNavigate();

  // Lấy user hiện tại từ localStorage
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
    district: "",
    province: "",
    numAndStreet: "",
    loyaltyPoint: 0,
  });

  // --- LOGIC MỚI: Tải dữ liệu bằng ID ---
  useEffect(() => {
    if (!currentUser || !userId) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        // Gọi API lấy chi tiết User theo ID
        const userData = await getUserById(userId);

        if (userData) {
          // Fill dữ liệu vào form
          setForm((prev) => ({
            ...prev,
            username: userData.username || "",
            email: userData.email || "",
            password: "", // Luôn để trống mật khẩu
            phoneNo: userData.phoneNo || "",
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            district: userData.district || "",
            province: userData.province || "",
            numAndStreet: userData.numAndStreet || "",
            // Các trường riêng của Customer (nếu Backend join bảng trả về)
            loyaltyPoint: currentUser.loyaltyPoint || 0,
          }));
        }
      } catch (error) {
        console.error("Profile Load Error:", error);
        // Có thể user bị xóa ở DB nhưng localStorage vẫn còn -> Đá về login
        if (error.response && error.response.status === 404) {
          toast.error("Không tìm thấy thông tin tài khoản.");
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

  // Handle Save (Cập nhật)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) return;

    // Payload: Chỉ gửi password nếu người dùng nhập mới
    const payload = { ...form };
    if (!payload.password || payload.password.trim() === "") {
      delete payload.password;
    }

    setSaving(true);
    try {
      // Gọi API update (vẫn dùng hàm cũ updateCustomer hoặc bạn có thể viết thêm updateUser trong userService)
      await updateCustomer(userId, payload);

      toast.success("Cập nhật thành công!");

      // Cập nhật lại localStorage để Header hiển thị đúng tên mới
      const newUserLocal = {
        ...currentUser,
        ...payload,
        UserID: userId,
      };
      // Xóa pass khỏi local storage cho an toàn
      delete newUserLocal.password;

      localStorage.setItem("user", JSON.stringify(newUserLocal));
      window.dispatchEvent(new Event("userUpdated")); // Bắn sự kiện reload header
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete (Xóa tài khoản)
  const handleDelete = async () => {
    if (!userId) return;
    const ok = window.confirm(
      "Bạn có chắc muốn xóa tài khoản?\nHành động này không thể hoàn tác và sẽ xóa toàn bộ điểm tích lũy."
    );
    if (!ok) return;

    try {
      await deleteCustomer(userId);
      toast.success("Đã xóa tài khoản.");

      // Logout & Redirect
      await logout().catch(() => {});
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userUpdated"));
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Không thể xóa (có thể do ràng buộc đơn hàng)."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 font-medium">Đang tải thông tin...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-10">
      <div className="max-w-4xl mx-auto">
        {/* Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Hồ sơ của tôi
              </h1>
              <p className="text-gray-500 mt-1">
                ID:{" "}
                <span className="font-mono font-bold text-gray-700">
                  #{userId}
                </span>
                {form.loyaltyPoint > 0 && (
                  <span className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                    {form.loyaltyPoint} điểm
                  </span>
                )}
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

        {/* Form */}
        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field
              label="Username"
              value={form.username}
              onChange={onChange("username")}
              disabled={true} // Không cho sửa username
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={onChange("email")}
              required
            />

            <Field
              label="Mật khẩu mới"
              type="password"
              value={form.password}
              onChange={onChange("password")}
              placeholder="Để trống nếu không đổi"
            />
            <Field
              label="Số điện thoại"
              value={form.phoneNo}
              onChange={onChange("phoneNo")}
            />

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

          <div className="flex justify-end gap-3 mt-8 pt-4 border-t">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
            >
              Quay lại
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-200"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Component con để render input cho gọn
function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
  disabled,
}) {
  return (
    <label className="block">
      <div className="text-sm font-semibold text-gray-700 mb-1.5 ml-1">
        {label}
      </div>
      <input
        className={`w-full border rounded-xl px-4 py-2.5 outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all ${
          disabled ? "bg-gray-100 text-gray-500" : "bg-white"
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
