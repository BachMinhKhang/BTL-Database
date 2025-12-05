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