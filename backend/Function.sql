USE [BTL2];
GO

IF OBJECT_ID('dbo.fn_CalcMonthlyBonus_Cursor','FN') IS NOT NULL
    DROP FUNCTION dbo.fn_CalcMonthlyBonus_Cursor;
GO

CREATE FUNCTION dbo.fn_CalcMonthlyBonus_Cursor
(
    @EmployeeID INT,
    @Year INT,
    @Month INT
)
RETURNS DECIMAL(18,2)
AS
BEGIN
    DECLARE @bonus DECIMAL(18,2) = 0;
    DECLARE @totalRevenue DECIMAL(18,2) = 0;
    DECLARE @oneOrderRevenue DECIMAL(18,2);

    -- 1) Kiểm tra tham số đầu vào
    IF @Month NOT BETWEEN 1 AND 12 OR @Year < 2000
        RETURN NULL;  -- tham số không hợp lệ

    IF NOT EXISTS (SELECT 1 FROM EMPLOYEE WHERE UserID = @EmployeeID)
        RETURN NULL;  -- nhân viên không tồn tại

    -- 2) Dùng CURSOR duyệt từng đơn hàng của NV trong tháng
    DECLARE curOrders CURSOR LOCAL FAST_FORWARD FOR
        SELECT finalPrice
        FROM [ORDER]
        WHERE employeeID = @EmployeeID
          AND YEAR(orderDate) = @Year
          AND MONTH(orderDate) = @Month
          AND stateOfOrder IN ('Delivered','Shipped'); -- chỉ tính đơn giao thành công

    OPEN curOrders;

    FETCH NEXT FROM curOrders INTO @oneOrderRevenue;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @totalRevenue = @totalRevenue + ISNULL(@oneOrderRevenue, 0);
        FETCH NEXT FROM curOrders INTO @oneOrderRevenue;
    END

    CLOSE curOrders;
    DEALLOCATE curOrders;

    -- 3) Áp dụng quy tắc thưởng
    IF @totalRevenue >= 3000
        SET @bonus = @totalRevenue * 0.05;  -- 5%
    ELSE IF @totalRevenue >= 1000
        SET @bonus = @totalRevenue * 0.03;  -- 3%
    ELSE
        SET @bonus = 0;

    RETURN CAST(ROUND(@bonus,2) AS DECIMAL(18,2));
END;
GO

IF OBJECT_ID('dbo.fn_CheckCustomerEligibleForCoupon_Loop','FN') IS NOT NULL
    DROP FUNCTION dbo.fn_CheckCustomerEligibleForCoupon_Loop;
GO

CREATE FUNCTION dbo.fn_CheckCustomerEligibleForCoupon_Loop
(
    @CustomerID INT,
    @MinOrders INT
)
RETURNS BIT
AS
BEGIN
    DECLARE @cnt INT = 0;
    DECLARE @i INT = 1;
    DECLARE @total INT = 0;
    DECLARE @OrderID INT;

    -- 1) Kiểm tra tham số
    IF @CustomerID IS NULL OR @MinOrders IS NULL OR @MinOrders <= 0
        RETURN 0;

    IF NOT EXISTS (SELECT 1 FROM CUSTOMER WHERE UserID = @CustomerID)
        RETURN 0;

    -- 2) Lấy tất cả OrderID của khách này vào table variable
    DECLARE @Orders TABLE
    (
        rn INT IDENTITY(1,1) PRIMARY KEY,
        OrderID INT
    );

    INSERT INTO @Orders(OrderID)
    SELECT O.OrderID
    FROM [ORDER] O
    WHERE O.customerID = @CustomerID
      AND O.stateOfOrder <> 'Cancelled';  -- chỉ tính đơn không bị huỷ

    SELECT @total = COUNT(*) FROM @Orders;

    -- 3) Dùng LOOP duyệt từng dòng trong @Orders
    WHILE @i <= @total
    BEGIN
        SELECT @OrderID = OrderID
        FROM @Orders
        WHERE rn = @i;

        -- xử lý mỗi đơn hàng (ở đây chỉ đếm)
        SET @cnt = @cnt + 1;

        SET @i = @i + 1;
    END

    IF @cnt >= @MinOrders
        RETURN 1;   -- đủ điều kiện tạo coupon
    RETURN 0;       -- chưa đủ
END;
GO

-- thủ tục dùng hàm Loop để tự động tạo coupon 
USE BTL2;
GO


IF OBJECT_ID('dbo.sp_GenerateCouponIfNeeded','P') IS NOT NULL
    DROP PROCEDURE dbo.sp_GenerateCouponIfNeeded;
GO

CREATE PROCEDURE dbo.sp_GenerateCouponIfNeeded
    @CustomerID INT,
    @MinOrders INT = 10,
    @DiscountPercent INT = 5,
    @EmployeeID INT = 7  -- giả sử Manager (UserID = 7) là người tạo coupon
AS
BEGIN
    SET NOCOUNT ON;

    IF dbo.fn_CheckCustomerEligibleForCoupon_Loop(@CustomerID, @MinOrders) = 0
    BEGIN
        PRINT N'Khách hàng chưa đủ số đơn để nhận coupon.';
        RETURN;
    END

    INSERT INTO COUPON(employeeID, description, discountPercent, startDate, endDate)
    VALUES
    (
        @EmployeeID,
        N'coupon cho khách hàng ' + CAST(@CustomerID AS NVARCHAR(20)),
        @DiscountPercent,
        CAST(GETDATE() AS DATE),
        DATEADD(DAY, 30, CAST(GETDATE() AS DATE))
    );

    PRINT N'Đã tạo coupon mới.';
END;
GO
