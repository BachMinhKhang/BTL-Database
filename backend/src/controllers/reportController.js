// src/controllers/reportController.js
import { sql } from "../config/database.js";

// ================================
// GET REVENUE REPORT
// ================================
export const getRevenueReport = async (req, res) => {
  try {
    const { minRevenue = 0 } = req.query;

    // Gọi SP_ReportRevenue từ database
    const request = new sql.Request();
    request.input("MinRevenue", sql.Decimal(12, 2), parseFloat(minRevenue));

    const result = await request.execute("sp_GetProductRevenueStatistic");

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(200).json({
        message: "Không có dữ liệu doanh thu",
        data: [],
      });
    }

    res.json({
      message: "Lấy dữ liệu doanh thu thành công",
      data: result.recordset,
    });
  } catch (err) {
    console.error("getRevenueReport Error:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

// ================================
// GET MONTHLY REVENUE REPORT
// ================================
export const getMonthlyRevenueReport = async (req, res) => {
  try {
    // Query tính doanh thu theo tháng
    const request = new sql.Request();
    const result = await request.query(`
      SELECT 
        MONTH(o.orderDate) AS Month,
        YEAR(o.orderDate) AS Year,
        SUM(o.finalPrice) AS TotalRevenue,
        COUNT(DISTINCT o.OrderID) AS TotalOrders
      FROM [ORDER] o
      WHERE o.stateOfOrder = 'Delivered'
      GROUP BY YEAR(o.orderDate), MONTH(o.orderDate)
      ORDER BY Year DESC, Month DESC
    `);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(200).json({
        message: "Không có dữ liệu doanh thu theo tháng",
        data: [],
      });
    }

    res.json({
      message: "Lấy dữ liệu doanh thu theo tháng thành công",
      data: result.recordset,
    });
  } catch (err) {
    console.error("getMonthlyRevenueReport Error:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};

// ================================
// GET DASHBOARD STATISTICS
// ================================
export const getDashboardStats = async (req, res) => {
  try {
    const request = new sql.Request();

    // Tổng doanh thu
    const totalRevenueResult = await request.query(`
      SELECT SUM(finalPrice) AS TotalRevenue
      FROM [ORDER]
      WHERE stateOfOrder = 'Delivered'
    `);

    // Tổng đơn hàng
    const totalOrdersResult = await request.query(`
      SELECT COUNT(*) AS TotalOrders
      FROM [ORDER]
      WHERE stateOfOrder = 'Delivered'
    `);

    // Tổng khách hàng
    const totalCustomersResult = await request.query(`
      SELECT COUNT(*) AS TotalCustomers
      FROM CUSTOMER
    `);

    // Tổng sản phẩm
    const totalProductsResult = await request.query(`
      SELECT COUNT(*) AS TotalProducts
      FROM PRODUCT
    `);

    res.json({
      message: "Lấy thống kê dashboard thành công",
      data: {
        totalRevenue: totalRevenueResult.recordset[0]?.TotalRevenue || 0,
        totalOrders: totalOrdersResult.recordset[0]?.TotalOrders || 0,
        totalCustomers: totalCustomersResult.recordset[0]?.TotalCustomers || 0,
        totalProducts: totalProductsResult.recordset[0]?.TotalProducts || 0,
      },
    });
  } catch (err) {
    console.error("getDashboardStats Error:", err);
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
};
