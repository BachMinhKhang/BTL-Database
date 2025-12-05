import { useState, useEffect } from "react";
import {
  getCustomers,
  deleteCustomer,
  updateCustomer,
  createCustomer,
} from "../../services/customerService";
import { toast } from "react-toastify";
import { HiPencil, HiTrash, HiPlus, HiX } from "react-icons/hi"; // Bỏ import thừa

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Lọc
  const [filterState, setFilterState] = useState({
    sortBy: "Spent",
    filterType: "",
    filterValue: "",
  });

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
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

  // 1. Fetch Data
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(filterState);
      setCustomers(data);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Gọi khi Sort thay đổi
  useEffect(() => {
    fetchCustomers();
  }, [filterState.sortBy]);

  // 2. Handlers Modal
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

  const handleOpenEdit = (cust) => {
    setIsEditMode(true);
    setFormData({
      UserID: cust.UserID,
      username: cust.username,
      password: "", // Không điền password cũ để bảo mật
      email: cust.email,
      // Lấy từ SQL (đã update ở Bước 1), nếu null thì để chuỗi rỗng
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

  // 3. Handlers Form & Action
  const handleFilterSubmit = () => {
    fetchCustomers();
  };

  const handleReset = () => {
    setFilterState({ sortBy: "Spent", filterType: "", filterValue: "" });
    // Gọi lại fetch thay vì reload trang cho mượt
    getCustomers({ sortBy: "Spent", filterType: "", filterValue: "" }).then(
      (data) => setCustomers(data)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateCustomer(formData.UserID, formData);
        toast.success("Cập nhật thành công!");
      } else {
        await createCustomer(formData);
        toast.success("Thêm mới thành công!");
      }
      setShowModal(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.message || "Có lỗi xảy ra");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa khách hàng này?")) {
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
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Thống Kê & Quản Lý Khách Hàng
      </h1>

      {/* --- FILTER BAR --- */}
      <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap gap-4 items-end">
        {/* Sort */}
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
            Sắp xếp theo
          </label>
          <select
            className="border p-2 rounded bg-gray-50 min-w-[150px] outline-none focus:border-blue-500"
            value={filterState.sortBy}
            onChange={(e) =>
              setFilterState({ ...filterState, sortBy: e.target.value })
            }
          >
            <option value="Spent">Tổng chi tiêu (Giảm dần)</option>
            <option value="Orders">Số lượng đơn (Giảm dần)</option>
            <option value="Newest">Khách hàng mới</option>
            <option value="Name">Tên (A-Z)</option>
            <option value="LoyaltyPoint">Điểm thành viên (Giảm dần)</option>
          </select>
        </div>

        {/* Filter */}
        <div className="flex items-end gap-2 border-l pl-4 ml-2">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
              Lọc theo
            </label>
            <div className="flex gap-2">
              <select
                className="border p-2 rounded bg-gray-50 outline-none focus:border-blue-500"
                value={filterState.filterType}
                onChange={(e) =>
                  setFilterState({
                    ...filterState,
                    filterType: e.target.value,
                    filterValue: "",
                  })
                } // Reset value khi đổi type
              >
                <option value="">-- Tất cả --</option>
                <option value="Spent">Tổng tiền trên...</option>
                <option value="Orders">Số đơn hàng trên...</option>
              </select>

              {filterState.filterType && (
                <input
                  type="number"
                  placeholder="Nhập số..."
                  className="border p-2 rounded w-32 outline-none focus:border-blue-500"
                  value={filterState.filterValue}
                  onChange={(e) =>
                    setFilterState({
                      ...filterState,
                      filterValue: e.target.value,
                    })
                  }
                />
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleFilterSubmit}
          disabled={!filterState.filterType} // Chỉ disable khi chưa chọn loại lọc
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
        >
          Lọc
        </button>

        <button
          onClick={handleReset}
          className="text-gray-500 hover:text-red-500 px-2 text-sm underline"
        >
          Xóa lọc
        </button>

        <button
          onClick={handleOpenAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2 ml-auto shadow-sm"
        >
          <HiPlus /> Thêm
        </button>
      </div>

      {/* --- TABLE --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-bold">
            <tr>
              <th className="p-4 border-b">ID</th>
              <th className="p-4 border-b">Khách hàng</th>
              <th className="p-4 border-b">Liên hệ</th>
              <th className="p-4 border-b text-center">Điểm</th>
              <th className="p-4 border-b text-center">Đơn hàng</th>
              <th className="p-4 border-b text-right">Tổng chi</th>
              <th className="p-4 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  Không tìm thấy khách hàng nào.
                </td>
              </tr>
            ) : (
              customers.map((cust) => (
                <tr
                  key={cust.UserID}
                  className="hover:bg-blue-50 border-b transition-colors"
                >
                  <td className="p-4 text-gray-500">#{cust.UserID}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">
                      {cust.fullName}
                    </div>
                    <div className="text-xs text-gray-500">
                      @{cust.username}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-gray-700">{cust.email}</div>
                    <div className="text-xs text-gray-500">{cust.phoneNo}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                      {cust.loyaltyPoint} pts
                    </span>
                  </td>
                  <td className="p-4 text-center font-medium">
                    {cust.TotalOrders || 0}
                  </td>
                  <td className="p-4 text-right font-bold text-green-600">
                    {/* Safety Check: Dùng ?. để tránh crash nếu TotalSpent null */}
                    {(cust.TotalSpent || 0).toLocaleString("vi-VN")}₫
                  </td>
                  <td className="p-4 flex justify-center gap-3">
                    <button
                      onClick={() => handleOpenEdit(cust)}
                      className="text-blue-500 hover:text-blue-700"
                      title="Sửa"
                    >
                      <HiPencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(cust.UserID)}
                      className="text-red-500 hover:text-red-700"
                      title="Xóa"
                    >
                      <HiTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditMode ? "Cập nhật thông tin" : "Thêm khách hàng mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX size={24} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Username *
                </label>
                <input
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  disabled={isEditMode} // Không cho sửa username
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Mật khẩu {isEditMode && "(Để trống nếu không đổi)"}{" "}
                  {!isEditMode && "*"}
                </label>
                <input
                  type="password"
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  required={!isEditMode}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Số điện thoại
                </label>
                <input
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phoneNo}
                  onChange={(e) =>
                    setFormData({ ...formData, phoneNo: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Họ & Tên Đệm
                </label>
                <input
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: Nguyễn Văn"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Tên
                </label>
                <input
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ví dụ: A"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />
              </div>

              {/* Địa chỉ full width */}
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Số nhà, Đường
                </label>
                <input
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.numAndStreet}
                  onChange={(e) =>
                    setFormData({ ...formData, numAndStreet: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Quận/Huyện
                </label>
                <input
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.district}
                  onChange={(e) =>
                    setFormData({ ...formData, district: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-1">
                <label className="text-xs font-bold text-gray-500 uppercase">
                  Tỉnh/Thành
                </label>
                <input
                  className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                />
              </div>

              <div className="md:col-span-2 mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-bold shadow-lg"
                >
                  {isEditMode ? "Lưu Thay Đổi" : "Tạo Khách Hàng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
