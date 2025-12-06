import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiTrash, HiArrowLeft, HiMinus, HiPlus } from "react-icons/hi"; // Import thêm icon
import { toast } from "react-toastify";
import apiClient from "../../services/api";

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Load giỏ hàng
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  // 2. Helper update localStorage
  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("storage"));
  };

  // 3. Xóa sản phẩm
  const handleRemove = (index) => {
    if (window.confirm("Bạn muốn xóa sản phẩm này?")) {
      const newCart = [...cart];
      newCart.splice(index, 1);
      updateCart(newCart);
      toast.info("Đã xóa sản phẩm");
    }
  };

  // [MỚI] 4. Thay đổi số lượng
  const handleQuantityChange = (index, newQty) => {
    // Không cho số lượng < 1
    if (newQty < 1) return;

    // (Tuỳ chọn) Nếu bạn đã lưu stockAmount vào giỏ hàng ở trang Home, 
    // bạn có thể check tồn kho ở đây:
    // if (newQty > cart[index].stockAmount) {
    //    toast.warning("Quá số lượng tồn kho!");
    //    return;
    // }

    const newCart = [...cart];
    newCart[index].quantity = newQty;
    updateCart(newCart);
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 5. Checkout (Giữ nguyên logic cũ của bạn)
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      toast.error("Vui lòng đăng nhập");
      navigate("/login");
      return;
    }
    if (!window.confirm("Xác nhận đặt hàng?")) return;

    setLoading(true);
    try {
      // Ví dụ: Gửi cả mảng cart lên backend để xử lý Transaction
      await apiClient.post("/orders/create", {
        customerID: user.id,
        items: cart,
        totalPrice: totalAmount,
        address: user.address || "Tại cửa hàng"
      });

      updateCart([]); 
      toast.success("Đặt hàng thành công!");
      navigate("/");
    } catch (error) {
      console.error(error);
      
      // Lấy thông báo lỗi gốc từ Backend
      let msg = error.response?.data?.message || "Lỗi khi đặt hàng";

      // [TÙY CHỈNH] Nếu lỗi chứa từ khóa của Trigger, đổi thành thông báo thân thiện
      if (msg.includes("Không đủ số lượng tồn kho")) {
         msg = "Sản phẩm này đã hết hàng hoặc không đủ số lượng!";
      }
      
      // [TÙY CHỈNH] Nếu lỗi do thiếu dữ liệu (như lỗi NULL vừa rồi)
      if (msg.includes("Cannot insert the value NULL")) {
         msg = "Lỗi dữ liệu sản phẩm. Vui lòng xóa giỏ hàng và thử lại.";
      }

      toast.error(msg); 
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
          alt="Empty Cart"
          className="w-32 h-32 opacity-20 mb-4"
        />
        <h2 className="text-xl font-bold text-gray-400 mb-4">Giỏ hàng trống</h2>
        <Link to="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex gap-2">
          <HiArrowLeft /> Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Giỏ hàng của bạn</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Danh sách sản phẩm */}
        <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-100 font-bold text-sm text-gray-600 border-b">
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-center">Thao tác</div>
          </div>

          <div className="divide-y divide-gray-100">
            {cart.map((item, index) => (
              <div key={`${item.prodID}-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center">
                {/* Info */}
                <div className="col-span-6 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded border"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">Màu: {item.color} | ĐVT: {item.unitOfMeasure}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-2 text-center font-medium text-gray-700">
                  {item.price.toLocaleString("vi-VN")}₫
                </div>

                {/* [MỚI] Quantity Controls */}
                <div className="col-span-2 flex justify-center">
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(index, item.quantity - 1)}
                      className="p-2 hover:bg-gray-100 text-gray-600 disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      <HiMinus size={12} />
                    </button>
                    <span className="px-3 font-semibold text-gray-800 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(index, item.quantity + 1)}
                      className="p-2 hover:bg-gray-100 text-gray-600"
                    >
                      <HiPlus size={12} />
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <div className="col-span-2 text-center">
                  <button
                    onClick={() => handleRemove(index)}
                    className="text-red-500 hover:text-red-700 p-2 transition"
                    title="Xóa"
                  >
                    <HiTrash size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thanh toán */}
        <div className="w-full lg:w-80">
          <div className="bg-white p-6 rounded-lg shadow sticky top-24">
            <h3 className="text-lg font-bold mb-4 border-b pb-2">Thanh toán</h3>
            <div className="flex justify-between mb-6 text-xl font-bold text-blue-600">
              <span>Tổng cộng:</span>
              <span>{totalAmount.toLocaleString("vi-VN")}₫</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition shadow-md disabled:bg-gray-300"
            >
              {loading ? "Đang xử lý..." : "ĐẶT HÀNG NGAY"}
            </button>
            <Link to="/" className="block text-center mt-4 text-sm text-blue-600 hover:underline">
              Tiếp tục mua hàng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}