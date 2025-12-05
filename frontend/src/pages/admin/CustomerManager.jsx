import { useState, useEffect } from "react";
import {
  getCustomers,
  deleteCustomer,
  updateCustomer,
  createCustomer,
} from "../../services/customerService";
import { toast } from "react-toastify";
import { HiPencil, HiTrash, HiSearch, HiX, HiPlus } from "react-icons/hi";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState({ keyword: "", minP: "", maxP: "" });

  // --- STATE MODAL ---
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form data chung cho cả Add và Edit
  // Lưu ý: Password chỉ bắt buộc khi Add
  const [formData, setFormData] = useState({
    UserID: null,
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    fullName: "", // Cái này Edit mới cần hiện
    phoneNo: "",
    district: "",
    province: "",
    numAndStreet: "",
    loyaltyPoint: 0,
  });

  // 1. Load Data
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(search);
      setCustomers(data);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 2. Xử lý Mở Modal Thêm
  const handleOpenAdd = () => {
    setIsEditMode(false);
    setFormData({
      UserID: null,
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      fullName: "",
      phoneNo: "",
      district: "",
      province: "",
      numAndStreet: "",
      loyaltyPoint: 0,
    });
    setShowModal(true);
  };

  // 3. Xử lý Mở Modal Sửa
  const handleOpenEdit = (cust) => {
    setIsEditMode(true);
    // Map dữ liệu từ bảng vào form
    setFormData({
      UserID: cust.UserID,
      username: cust.username,
      password: cust.password || "123456", // Demo pass giả vì API get ko trả về pass
      email: cust.email,
      firstName: cust.firstName || "",
      lastName: cust.lastName || "",
      fullName: cust.fullName || "",
      phoneNo: cust.phoneNo || "",
      district: cust.district || "",
      province: cust.province || "",
      numAndStreet: cust.numAndStreet || "",
      loyaltyPoint: cust.loyaltyPoint,
    });
    setShowModal(true);
  };

  // 4. Submit Form (Create hoặc Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        // UPDATE: Gọi sp_UpdateUser
        await updateCustomer(formData.UserID, formData);
        toast.success("Cập nhật thành công!");
      } else {
        // CREATE: Gọi sp_InsertCustomer
        await createCustomer(formData);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  // 5. Xóa
  const handleDelete = async (id) => {
    if (
      window.confirm("Bạn có chắc muốn xóa? Hành động này không thể hoàn tác.")
    ) {
      try {
        await deleteCustomer(id);
        toast.success("Xóa thành công!");
        fetchCustomers();
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Khách Hàng</h1>
        <button
          onClick={handleOpenAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
        >
          <HiPlus /> Thêm Khách Hàng
        </button>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-3 items-end">
        <input
          type="text"
          placeholder="Tìm tên/username..."
          className="border p-2 rounded flex-1"
          value={search.keyword}
          onChange={(e) => setSearch({ ...search, keyword: e.target.value })}
        />
        <input
          type="number"
          placeholder="Điểm min"
          className="border p-2 rounded w-36"
          value={search.minP}
          onChange={(e) => setSearch({ ...search, minP: e.target.value })}
        />
        <input
          type="number"
          placeholder="Điểm max"
          className="border p-2 rounded w-36"
          value={search.maxP}
          onChange={(e) => setSearch({ ...search, maxP: e.target.value })}
        />
        <button
          onClick={fetchCustomers}
          className="bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700"
        >
          <HiSearch />
        </button>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-sm uppercase">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Username</th>
              <th className="p-4">Họ Tên (Full)</th>
              <th className="p-4">Email</th>
              <th className="p-4">SĐT</th>
              <th className="p-4 text-center">Điểm</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="p-4 text-center">
                  Đang tải...
                </td>
              </tr>
            ) : (
              customers.map((cust) => (
                <tr key={cust.UserID} className="hover:bg-gray-50 border-b">
                  <td className="p-4">{cust.UserID}</td>
                  <td className="p-4 font-bold text-blue-600">
                    {cust.username}
                  </td>
                  <td className="p-4">{cust.fullName}</td>
                  <td className="p-4">{cust.email}</td>
                  <td className="p-4">{cust.phoneNo}</td>
                  <td className="p-4 text-center">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {cust.loyaltyPoint}
                    </span>
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(cust)}
                      className="text-yellow-500 hover:text-yellow-600"
                    >
                      <HiPencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(cust.UserID)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <HiTrash size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL (ADD / EDIT) --- */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-300/50 bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-[600px] shadow-xl my-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {isEditMode ? "Cập nhật" : "Thêm mới"} Khách hàng
              </h2>
              <button onClick={() => setShowModal(false)}>
                <HiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {/* Cột 1 */}
              <div>
                <label className="text-xs text-gray-500">Username *</label>
                <input
                  className="w-full border p-2 rounded"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Email *</label>
                <input
                  type="email"
                  className="w-full border p-2 rounded"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">
                  Mật khẩu {isEditMode && "(Nhập nếu muốn đổi)"} *
                </label>
                <input
                  type="password"
                  className="w-full border p-2 rounded"
                  required={!isEditMode}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Số điện thoại</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.phoneNo}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNo: e.target.value })
                  }
                />
              </div>

              {/* Tách First/Last Name để Proc tự ghép */}
              <div>
                <label className="text-xs text-gray-500">Họ (Last Name)</label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Nguyễn"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">
                  Tên (First Name)
                </label>
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Văn A"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>

              {/* Địa chỉ */}
              <div className="col-span-2">
                <label className="text-xs text-gray-500">Số nhà, Đường</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.numAndStreet}
                  onChange={(e) =>
                    setFormData({ ...formData, numAndStreet: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Quận/Huyện</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Tỉnh/Thành</label>
                <input
                  className="w-full border p-2 rounded"
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                />
              </div>

              <div className="col-span-2">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-bold"
                >
                  {isEditMode ? "LƯU THAY ĐỔI" : "TẠO KHÁCH HÀNG"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
