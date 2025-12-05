import { sql } from "../config/database.js";

export const createOrderItem = async (req, res) => {
  const { orderID, prodID, color, unitOfMeasure, quantity, price } = req.body;

  try {
    const request = new sql.Request();
    
    // Truyền tham số
    request.input("OrderID", sql.Int, orderID);
    request.input("ProdID", sql.Int, prodID);
    request.input("Color", sql.NVarChar, color);
    request.input("Unit", sql.NVarChar, unitOfMeasure);
    request.input("Qty", sql.Int, quantity);
    request.input("Price", sql.Decimal(12, 2), price);

    // --- KHI CHẠY CÂU LỆNH NÀY, TRIGGER SẼ TỰ ĐỘNG CHẠY ---
    await request.query(`
      INSERT INTO ORDERITEM (OrderID, prodID, color, unitOfMeasure, quantity, priceInOrderDate, ordinalNo)
      VALUES (@OrderID, @ProdID, @Color, @Unit, @Qty, @Price, 1) 
      -- (ordinalNo giả định là 1 cho ví dụ đơn giản)
    `);

    res.status(201).json({ message: "Thêm sản phẩm vào đơn thành công!" });

  } catch (error) {
    console.error("Lỗi tạo đơn:", error);

    // --- BẮT LỖI TỪ TRIGGER ---
    // Nếu Trigger RAISERROR, nó sẽ nhảy vào đây
    if (error.message.includes("Không đủ số lượng tồn kho")) {
        return res.status(400).json({ 
            message: "Lỗi: Sản phẩm này không đủ số lượng tồn kho!" 
        });
    }

    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};