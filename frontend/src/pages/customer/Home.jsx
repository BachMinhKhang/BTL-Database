import { useState, useEffect, useMemo } from "react"; // Thêm useMemo
import {
  HiShoppingCart,
  HiSearch,
  HiFilter,
  HiX,
  HiFire,
  HiTrash,
  HiTag,
} from "react-icons/hi"; // Thêm icon HiTag
import { toast } from "react-toastify";
import { getAllProducts, getBestSellers } from "../../services/productService";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Search & Filter Server
  const [searchTerm, setSearchTerm] = useState("");
  const [priceFilters, setPriceFilters] = useState({ min: "", max: "" });

  // --- STATE MỚI: DANH MỤC (Client-side) ---
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // 1. GỌI API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [allData, topData] = await Promise.all([
        getAllProducts(searchTerm, priceFilters.min, priceFilters.max),
        getBestSellers(),
      ]);
      setProducts(allData);
      setBestSellers(topData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. LOGIC TÍNH TOÁN DANH MỤC TỰ ĐỘNG
  // Từ list sản phẩm lấy về, tự lọc ra có những danh mục nào (không cần fix cứng)
  const categories = useMemo(() => {
    // Lấy list catalogName duy nhất
    const cats = [...new Set(products.map((p) => p.catalogName))];
    // Loại bỏ giá trị null/undefined nếu có và sort
    return cats.filter(Boolean).sort();
  }, [products]);

  // 3. LOGIC LỌC CUỐI CÙNG (Client-side Filter)
  // Lọc list products dựa trên Category người dùng chọn
  const displayProducts = useMemo(() => {
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.catalogName === selectedCategory);
  }, [products, selectedCategory]);

  // --- HANDLERS ---
  const handleApplyFilter = async () => {
    setLoading(true);
    try {
      const data = await getAllProducts(
        searchTerm,
        priceFilters.min,
        priceFilters.max
      );
      setProducts(data);
      // Khi search lại từ server, reset category về All để hiện hết kết quả mới
      setSelectedCategory("All");
      setShowMobileFilter(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (e) => {
    setPriceFilters({ ...priceFilters, [e.target.name]: e.target.value });
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleApplyFilter();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setPriceFilters({ min: "", max: "" });
    setSelectedCategory("All"); // Reset cả danh mục
    getAllProducts("", "", "").then((data) => setProducts(data));
  };

  const handleAddToCart = (item) => {
    if (item.stockAmount === 0) {
      toast.error("Sản phẩm này tạm thời hết hàng!");
      return;
    }
    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = currentCart.find(
      (cartItem) =>
        cartItem.prodID === item.prodID &&
        cartItem.color === item.color &&
        cartItem.unitOfMeasure === item.unitOfMeasure
    );
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      currentCart.push({
        prodID: item.prodID,
        name: item.productName,
        price: item.listedPrice,
        color: item.color,
        unitOfMeasure: item.unitOfMeasure,
        image:
          item.imageUrl ||
          `https://placehold.co/300x200?text=${encodeURIComponent(
            item.productName
          )}`,
        quantity: 1,
      });
    }
    localStorage.setItem("cart", JSON.stringify(currentCart));
    window.dispatchEvent(new Event("storage"));
    toast.success(`Đã thêm "${item.productName}" vào giỏ!`);
  };

  // Component Thẻ Sản phẩm
  const ProductCard = ({ item, isHot = false }) => (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full">
      <div className="h-48 p-4 relative bg-white flex items-center justify-center">
        <img
          src={item.imageUrl}
          alt={item.productName}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/300x200?text=${encodeURIComponent(
              item.productName
            )}`;
          }}
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {isHot && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
              <HiFire /> HOT
            </span>
          )}
          {item.stockAmount === 0 ? (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Hết hàng
            </span>
          ) : (
            !isHot && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                Còn {item.stockAmount}
              </span>
            )
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 border-t border-gray-50">
        <div className="mb-2">
          {/* Hiển thị tên Danh mục nhỏ ở trên */}
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            {item.catalogName}
          </span>
          <h3
            className="text-base font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
            title={item.productName}
          >
            {item.productName}
          </h3>
        </div>
        <div className="text-xs text-gray-500 space-y-1 mb-3">
          <p>Màu: {item.color}</p>
          {isHot && (
            <p className="text-orange-600 font-medium">
              Đã bán: {item.TotalSold}
            </p>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Giá bán</span>
            <span className="text-lg font-extrabold text-blue-600">
              {item.listedPrice.toLocaleString("vi-VN")}₫
            </span>
          </div>
          <button
            onClick={() => handleAddToCart(item)}
            disabled={item.stockAmount === 0}
            className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-colors ${
              item.stockAmount === 0
                ? "bg-gray-100 text-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <HiShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-8 shadow-md">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-2">ABC Stationery Store</h1>
          <p className="text-blue-100 opacity-90">
            Văn phòng phẩm chính hãng - Giá tốt nhất
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TOP BÁN CHẠY */}
        {bestSellers.length > 0 && (
          <div className="mb-12 border-b border-gray-200 pb-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-orange-100 text-orange-600 p-2 rounded-full shadow-sm">
                <HiFire size={24} />
              </span>
              <h2 className="text-2xl font-bold text-gray-800">
                Top Bán Chạy Nhất
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.slice(0, 4).map((item) => (
                <ProductCard
                  key={`best-${item.uniqueKey}`}
                  item={item}
                  isHot={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between items-center sticky top-0 z-40 bg-gray-50 py-2">
          <button
            onClick={() => setShowMobileFilter(true)}
            className="md:hidden w-full flex items-center justify-center gap-2 bg-white border px-4 py-2 rounded-lg font-medium"
          >
            <HiFilter /> Bộ lọc
          </button>
          <div className="relative w-full md:max-w-lg ml-auto flex shadow-sm">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              className="w-full pl-4 pr-4 py-3 border rounded-l-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              onClick={handleApplyFilter}
              className="bg-blue-600 text-white px-6 rounded-r-lg hover:bg-blue-700 font-medium"
            >
              Tìm
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR FILTER */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform md:translate-x-0 md:static md:shadow-none md:bg-transparent md:z-auto ${
              showMobileFilter ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="p-5 h-full overflow-y-auto bg-white md:rounded-xl md:border border-gray-100">
              <div className="md:hidden flex justify-between mb-4">
                <h3 className="font-bold">Bộ lọc</h3>
                <button onClick={() => setShowMobileFilter(false)}>
                  <HiX />
                </button>
              </div>

              {/* --- 1. LỌC DANH MỤC (MỚI) --- */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <HiTag className="text-blue-600" /> Danh mục
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === "All"}
                      onChange={() => setSelectedCategory("All")}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span
                      className={`text-sm ${
                        selectedCategory === "All"
                          ? "font-bold text-blue-600"
                          : "text-gray-600"
                      }`}
                    >
                      Tất cả
                    </span>
                  </label>
                  {categories.map((cat, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span
                        className={`text-sm ${
                          selectedCategory === cat
                            ? "font-bold text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        {cat}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. LỌC GIÁ */}
              <div className="mb-6">
                <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-2">
                  <HiFilter className="text-blue-600" /> Khoảng giá
                </h3>
                <div className="space-y-3">
                  <input
                    type="number"
                    name="min"
                    placeholder="Từ (0)"
                    value={priceFilters.min}
                    onChange={handlePriceChange}
                    className="w-full border p-2 rounded text-sm"
                  />
                  <input
                    type="number"
                    name="max"
                    placeholder="Đến"
                    value={priceFilters.max}
                    onChange={handlePriceChange}
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <button
                  onClick={handleApplyFilter}
                  className="w-full mt-4 bg-blue-100 text-blue-700 font-bold py-2 rounded"
                >
                  Áp dụng giá
                </button>
              </div>

              {(priceFilters.min ||
                priceFilters.max ||
                searchTerm ||
                selectedCategory !== "All") && (
                <button
                  onClick={clearFilters}
                  className="w-full text-sm text-red-500 flex justify-center gap-2"
                >
                  <HiTrash /> Xóa tất cả lọc
                </button>
              )}
            </div>
            {showMobileFilter && (
              <div
                className="fixed inset-0 bg-black/50 -z-10 md:hidden"
                onClick={() => setShowMobileFilter(false)}
              ></div>
            )}
          </aside>

          {/* MAIN PRODUCT GRID */}
          <main className="flex-1">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedCategory === "All"
                  ? "Tất cả sản phẩm"
                  : selectedCategory}
              </h2>
              <span className="text-sm text-gray-500">
                Kết quả: {displayProducts.length}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-80 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayProducts.length > 0 ? (
                  displayProducts.map((item) => (
                    // Dùng component ProductCard tái sử dụng
                    <ProductCard key={item.uniqueKey} item={item} />
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center border border-dashed rounded-xl">
                    <p className="text-gray-500">
                      Không tìm thấy sản phẩm nào.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="mt-2 text-blue-600 hover:underline text-sm"
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
