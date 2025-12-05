import Product from "../models/Product.js";

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    // Lấy các tham số từ URL: /api/products?keyword=abc&minPrice=1000&maxPrice=50000
    const { keyword, minPrice, maxPrice } = req.query;

    const products = await Product.getAllVarieties(keyword, minPrice, maxPrice);

    res.json(products);
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ message: "Lỗi lấy danh sách sản phẩm" });
  }
};

export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.getBestSellers();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Lỗi" });
  }
};
