USE [BTL2];
GO

IF OBJECT_ID('trg_OrderItem_UpdateStock', 'TR') IS NOT NULL
    DROP TRIGGER trg_OrderItem_UpdateStock;
GO

CREATE TRIGGER trg_OrderItem_UpdateStock
ON ORDERITEM
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- *** BƯỚC 1: KIỂM TRA RÀNG BUỘC TỒN KHO (Phải được giữ nguyên) ***
    IF EXISTS (
        SELECT 1
        FROM inserted i 
        JOIN VARIETY v 
            ON i.prodID = v.prodID            
            AND i.color = v.color            
            AND i.unitOfMeasure = v.unitOfMeasure  
        WHERE i.quantity > v.stockAmount -- Kiểm tra nếu số lượng đặt > tồn kho
    )
    BEGIN
        -- Rollback và báo lỗi nếu thiếu hàng
        ROLLBACK TRANSACTION;
        RAISERROR(N'Lỗi: Không đủ số lượng tồn kho. Vui lòng kiểm tra lại.', 16, 1);
        RETURN;
    END

    -- *** BƯỚC 2: CẬP NHẬT TỒN KHO (Giảm số lượng) ***
    
    -- Cập nhật stockAmount trong VARIETY bằng cách trừ đi số lượng đã đặt (quantity)
    UPDATE v
    SET v.stockAmount = v.stockAmount - i.quantity
    FROM VARIETY v
    JOIN inserted i
        ON v.prodID = i.prodID            
        AND v.color = i.color            
        AND v.unitOfMeasure = i.unitOfMeasure;
        
    -- Lưu ý: Không cần COMMIT TRANSACTION ở đây vì Trigger là một phần 
    -- của Transaction đã bắt đầu bởi lệnh INSERT ban đầu.
END
GO

IF OBJECT_ID('dbo.trg_RecalculateOrderFinalPrice','TR') IS NOT NULL
    DROP TRIGGER dbo.trg_RecalculateOrderFinalPrice;
GO

CREATE TRIGGER dbo.trg_RecalculateOrderFinalPrice
ON dbo.ORDERITEM
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Tập các OrderID bị ảnh hưởng
    DECLARE @ChangedOrders TABLE (OrderID INT PRIMARY KEY);

    INSERT INTO @ChangedOrders(OrderID)
    SELECT DISTINCT OrderID
    FROM inserted
    WHERE OrderID IS NOT NULL;

    INSERT INTO @ChangedOrders(OrderID)
    SELECT DISTINCT d.OrderID
    FROM deleted d
    WHERE d.OrderID IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM @ChangedOrders c WHERE c.OrderID = d.OrderID);

    -- Nếu không có đơn nào bị ảnh hưởng thì thoát
    IF NOT EXISTS (SELECT 1 FROM @ChangedOrders)
        RETURN;

    -- Cập nhật finalPrice cho các OrderID bị ảnh hưởng
    UPDATE O
    SET finalPrice =
        CAST(
            ROUND(
                CASE 
                    WHEN C.CouponID IS NOT NULL AND C.discountPercent IS NOT NULL THEN 
                        -- Giảm theo %
                        CASE 
                            WHEN Items.BaseAmount * (100.0 - C.discountPercent) / 100.0 < 0 
                                THEN 0 
                            ELSE Items.BaseAmount * (100.0 - C.discountPercent) / 100.0
                        END
                    WHEN C.CouponID IS NOT NULL AND C.discountedPrice IS NOT NULL THEN
                        -- Giảm số tiền cố định
                        CASE 
                            WHEN Items.BaseAmount - C.discountedPrice < 0 
                                THEN 0 
                            ELSE Items.BaseAmount - C.discountedPrice
                        END
                    ELSE 
                        Items.BaseAmount
                END
            , 2) AS DECIMAL(12,2))
    FROM [ORDER] O
    JOIN @ChangedOrders CO ON O.OrderID = CO.OrderID
    OUTER APPLY
    (
        -- Tổng tiền trước giảm giá = SUM(priceInOrderDate * quantity)
        SELECT ISNULL(SUM(oi.priceInOrderDate * oi.quantity), 0.0) AS BaseAmount
        FROM ORDERITEM oi
        WHERE oi.OrderID = O.OrderID
    ) AS Items
    LEFT JOIN COUPON C ON C.CouponID = O.couponID;
END;
GO
