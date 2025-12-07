import { sql } from "../config/database.js";

export const createOrder = async (req, res) => {
  const { customerID, items, totalPrice, address } = req.body;

  const transaction = new sql.Transaction();

  try {
    await transaction.begin();

    // 1. Tạo Đơn hàng mới (Bảng [ORDER])
    // Lưu ý: employeeID tạm thời hardcode là 6 (nhân viên bán hàng) vì DB yêu cầu not null
    const requestOrder = new sql.Request(transaction);
    requestOrder.input("CustomerID", sql.Int, customerID);
    requestOrder.input("FinalPrice", sql.Decimal(12, 2), totalPrice);
    requestOrder.input("Address", sql.NVarChar, address || "Tại cửa hàng");
    
    const orderResult = await requestOrder.query(`
      INSERT INTO [ORDER] (customerID, employeeID, orderDate, finalPrice, stateOfOrder, addrToShip)
      OUTPUT INSERTED.OrderID
      VALUES (@CustomerID, 6, GETDATE(), @FinalPrice, 'New', @Address)
    `);

    const newOrderID = orderResult.recordset[0].OrderID;

    // 2. Thêm từng sản phẩm vào OrderItem
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const requestItem = new sql.Request(transaction);
      
      requestItem.input("OrderID", sql.Int, newOrderID);
      requestItem.input("ProdID", sql.Int, item.prodID);
      requestItem.input("Color", sql.NVarChar, item.color);
      requestItem.input("Unit", sql.NVarChar, item.unitOfMeasure);
      requestItem.input("Qty", sql.Int, item.quantity);
      requestItem.input("Price", sql.Decimal(12, 2), item.price);
      requestItem.input("Ordinal", sql.Int, i + 1); // Số thứ tự: 1, 2, 3...

      // Query này sẽ kích hoạt TRIGGER kiểm tra tồn kho
      await requestItem.query(`
        INSERT INTO ORDERITEM (OrderID, prodID, color, unitOfMeasure, ordinalNo, quantity, priceInOrderDate)
        VALUES (@OrderID, @ProdID, @Color, @Unit, @Ordinal, @Qty, @Price)
      `);
    }

    await transaction.commit();
    res.status(201).json({ message: "Đặt hàng thành công!", orderID: newOrderID });

  } catch (error) {
    await transaction.rollback();
    console.error("Lỗi tạo đơn:", error);

    // Bắt lỗi từ Trigger (nếu hết hàng)
    if (error.message.includes("Không đủ số lượng tồn kho")) {
      return res.status(400).json({ message: error.message }); // Gửi thông báo trigger về client
    }
    
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};