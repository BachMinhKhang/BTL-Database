import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCurrentUser, logout } from "../../services/authService";
import {
  getCustomers,
  updateCustomer,
  deleteCustomer,
} from "../../services/customerService";

const pickId = (u) => u?.UserID ?? u?.userId ?? u?.id ?? u?.userid;

export default function Profile() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getCurrentUser(), []);
  const userId = useMemo(() => pickId(currentUser), [currentUser]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // form
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "", // để trống = không đổi (nếu backend cho phép)
    phoneNo: "",

    firstName: "",
    lastName: "",
    district: "",
    province: "",
    numAndStreet: "",
    loyaltyPoint: 0,
  });

  // load dữ liệu hiện tại (ưu tiên lấy từ API để đúng nhất)
  useEffect(() => {
    if (!currentUser || !userId) {
      navigate("/login");
      return;
    }

    const boot = async () => {
      setLoading(true);
      try {
        // API customers là GET list + search -> mình search theo username rồi tìm đúng ID
        const list = await getCustomers({ keyword: currentUser.username });
        const found =
          (Array.isArray(list) ? list : []).find(
            (c) => (c.UserID ?? c.userId ?? c.id) === userId
          ) || (Array.isArray(list) ? list : [])[0];

        const src = found;

        setForm((prev) => ({
          ...prev,
          username: src.username ?? "",
          email: src.email ?? "",
          password: "",
          phoneNo: src.phoneNo ?? "",
          firstName: src.firstName ?? "",
          lastName: src.lastName ?? "",
          district: src.district ?? "",
          province: src.province ?? "",
          numAndStreet: src.numAndStreet ?? "",
          loyaltyPoint: src.loyaltyPoint ?? 0,
        }));
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [currentUser, userId, navigate]);

  const onChange = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) return;

    // payload: nếu password rỗng thì không gửi (đỡ “reset” password)
    const payload = { ...form };
    if (!payload.password || payload.password.trim() === "")
      delete payload.password;

    setSaving(true);
    try {
      await updateCustomer(userId, payload);
      toast.success("Cập nhật thông tin thành công!");

      // update localStorage để Header đổi tên
      const newUser = {
        ...currentUser,
        ...payload,
        UserID: userId,
      };
      localStorage.setItem("user", JSON.stringify(newUser));
      window.dispatchEvent(new Event("userUpdated"));
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại!");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!userId) return;
    const ok = window.confirm(
      "Bạn chắc chắn muốn xóa tài khoản?\nNếu tài khoản có ràng buộc (đơn hàng/coupon/...) thì hệ thống sẽ không cho xóa."
    );
    if (!ok) return;

    try {
      await deleteCustomer(userId);
      toast.success("Đã xóa tài khoản!");
      // logout local
      await logout().catch(() => {});
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("userUpdated"));
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Không thể xóa tài khoản (có thể do ràng buộc dữ liệu)."
      );
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-6 pt-10">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 pt-10">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Hồ sơ khách hàng</h1>
              <p className="text-gray-500 mt-1">
                UserID:{" "}
                <span className="font-medium text-gray-700">{userId}</span> ·
                Loyalty point:{" "}
                <span className="font-medium text-gray-700">
                  {form.loyaltyPoint}
                </span>
              </p>
            </div>

            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
            >
              Xóa tài khoản
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSave}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label="Username"
              value={form.username}
              onChange={onChange("username")}
              required
            />
            <Field
              label="Email"
              type="email"
              value={form.email}
              onChange={onChange("email")}
              required
            />

            <Field
              label="Mật khẩu (bỏ trống nếu không đổi)"
              type="password"
              value={form.password}
              onChange={onChange("password")}
              placeholder="••••••••"
            />
            <Field
              label="Số điện thoại"
              value={form.phoneNo}
              onChange={onChange("phoneNo")}
            />

            <div className="grid grid-cols-2 gap-4">
              <Field
                label="First name"
                value={form.firstName}
                onChange={onChange("firstName")}
              />
              <Field
                label="Last name"
                value={form.lastName}
                onChange={onChange("lastName")}
              />
            </div>

            <Field
              label="Tỉnh/TP"
              value={form.province}
              onChange={onChange("province")}
            />
            <Field
              label="Quận/Huyện"
              value={form.district}
              onChange={onChange("district")}
            />

            <Field
              label="Số nhà + Đường"
              value={form.numAndStreet}
              onChange={onChange("numAndStreet")}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-4 py-2 rounded-xl border hover:bg-gray-50 transition"
            >
              Về trang chủ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      <input
        className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
        value={value}
        onChange={onChange}
        type={type}
        required={required}
        placeholder={placeholder}
      />
    </label>
  );
}
