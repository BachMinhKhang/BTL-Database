import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getDashboardStats, getMonthlyRevenue, getProductRevenue } from "../../services/reportService";

// Rút gọn nhãn để tránh chiếm quá nhiều chiều cao
const truncateLabel = (label, max = 18) =>
  label && label.length > max ? `${label.slice(0, max)}…` : label;

const ProductTick = ({ x, y, payload }) => {
  const text = truncateLabel(payload.value);
  return (
    <g transform={`translate(${x},${y})`}>
      <text dy={12} textAnchor="end" fill="#666" transform="rotate(-30)">
        {text}
      </text>
    </g>
  );
};

const DashBoard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Màu sắc cho biểu đồ
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Lấy 3 loại dữ liệu song song
      const [statsRes, monthlyRes, productRes] = await Promise.all([
        getDashboardStats(),
        getMonthlyRevenue(),
        getProductRevenue(0),
      ]);

      if (statsRes.data) {
        setStats(statsRes.data);
      }

      if (monthlyRes.data) {
        setMonthlyData(monthlyRes.data);
      }

      if (productRes.data) {
        setProductData(productRes.data.slice(0, 10)); // Top 10 sản phẩm
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">Dashboard Quản Lý</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}

      {/* ===== THỐNG KÊ TỔNG QUÁT ===== */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Tổng Doanh Thu */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Tổng Doanh Thu</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {stats.totalRevenue?.toLocaleString("vi-VN")} VNĐ
          </p>
        </div>

        {/* Tổng Đơn Hàng */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Tổng Đơn Hàng</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {stats.totalOrders}
          </p>
        </div>

        {/* Tổng Khách Hàng */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Tổng Khách Hàng</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {stats.totalCustomers}
          </p>
        </div>

        {/* Tổng Sản Phẩm */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm font-semibold">Tổng Sản Phẩm</h3>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            {stats.totalProducts}
          </p>
        </div>
      </div>

      {/* ===== BIỂU ĐỒ ===== */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        {/* Biểu đồ Doanh Thu Theo Tháng */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Doanh Thu Theo Tháng</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={monthlyData.map((item) => ({
                  ...item,
                  Month: `T${item.Month}/${item.Year}`,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Month" />
                <YAxis />
                <Tooltip formatter={(value) => value.toLocaleString("vi-VN")} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="TotalRevenue"
                  stroke="#8884d8"
                  name="Doanh Thu (VNĐ)"
                  dot={{ fill: "#8884d8", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Không có dữ liệu</p>
          )}
        </div>

        {/* Biểu đồ Các sản Phẩm Bán Chạy */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Các Sản Phẩm Bán Chạy</h2>
          {productData.length > 0 ? (
            <ResponsiveContainer width="100%" height={330}>
              <BarChart
                data={productData}
                margin={{ top: 10, right: 10, left: 0, bottom: 50
                  
                 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="ProductName"
                  interval={0}
                  height={70}
                  tickMargin={8}
                  tick={<ProductTick />}
                />
                <YAxis
                  width={80}
                  tickFormatter={(value) => value.toLocaleString("vi-VN")}
                />
                <Tooltip formatter={(value) => value.toLocaleString("vi-VN")} />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  height={32}
                  wrapperStyle={{ paddingTop: 30 }}
                />
                <Bar
                  dataKey="TotalRevenue"
                  fill="#82ca9d"
                  name="Doanh Thu (VNĐ)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">Không có dữ liệu</p>
          )}
        </div>
      </div>

      {/* ===== BIỂU ĐỒ TRÒN - PHÂN BỐ DOANH THU ===== */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Phân Bố Doanh Thu Các Sản Phẩm</h2>
        {productData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData.slice(0, 5)}
                dataKey="TotalRevenue"
                nameKey="ProductName"
                cx="50%"
                cy="50%"
                outerRadius={100}
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
              >
                {productData.slice(0, 5).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString("vi-VN")} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500">Không có dữ liệu</p>
        )}
      </div>
    </div>
  );
};

export default DashBoard;
