USE [BTL2];
GO

/* --- 2.1 --- */
CREATE OR ALTER PROCEDURE sp_InsertEmployee
    @username VARCHAR(50),
    @email VARCHAR(100),
    @password VARCHAR(100),
    @employeeRole NVARCHAR(50),   -- Đã đổi sang NVARCHAR
    @phoneNo VARCHAR(20) = NULL,
    @fullName NVARCHAR(100) = NULL, -- Đã đổi sang NVARCHAR
    @firstName NVARCHAR(50) = NULL, -- Đã đổi sang NVARCHAR
    @lastName NVARCHAR(50) = NULL,  -- Đã đổi sang NVARCHAR
    @district NVARCHAR(50) = NULL,  -- Đã đổi sang NVARCHAR
    @province NVARCHAR(50) = NULL,  -- Đã đổi sang NVARCHAR
    @numAndStreet NVARCHAR(100) = NULL -- Đã đổi sang NVARCHAR
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NewUserID INT;
    
    -- *** 1. LOGIC TÊN ***
    IF @fullName IS NULL OR LTRIM(RTRIM(@fullName)) = ''
    BEGIN
        SET @fullName = LTRIM(RTRIM(
                          ISNULL(@firstName, '') + 
                          CASE 
                            WHEN ISNULL(@firstName, '') != '' AND ISNULL(@lastName, '') != '' THEN ' ' 
                            ELSE '' 
                          END + 
                          ISNULL(@lastName, '')
                      ));
    END

    IF @fullName IS NULL OR LTRIM(RTRIM(@fullName)) = '' 
        THROW 53012, 'Lỗi: Cần cung cấp ít nhất tên để tạo FullName.', 1;

    -- *** 2. LOGIC PHONENO (Chuẩn 10 số) ***
    IF @phoneNo IS NOT NULL
    BEGIN
        SET @phoneNo = LTRIM(RTRIM(@phoneNo));
        IF @phoneNo = '' THROW 53010, 'Số điện thoại không được là chuỗi rỗng.', 1;
        IF @phoneNo NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
             THROW 53011, 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.', 1;
    END

    -- *** 3. LOGIC EMAIL ***
    SET @email = LTRIM(RTRIM(@email));
    IF @email IS NULL OR @email = '' THROW 53005, 'Email không được rỗng.', 1;
    IF LEN(@email) > 100 THROW 53006, 'Email tối đa 100 ký tự.', 1;
    IF @email NOT LIKE '%_@_%._%' THROW 53007, 'Email phải có dạng <text>@<text>.<text>', 1;
    IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE email = @email)
        THROW 53008, 'Email đã tồn tại.', 1;

    -- *** 4. CHECK USERNAME ***
    SET @username = LTRIM(RTRIM(@username));
    IF @username IS NULL OR @username = '' THROW 53002, 'Username không được rỗng.', 1;
    IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE username = @username)
        THROW 53004, 'Username đã tồn tại.', 1;

    -- *** 5. CHECK KHÁC ***
    IF LEN(@password) < 6 THROW 53009, 'Mật khẩu phải có ít nhất 6 ký tự.', 1;

    -- Role cũng phải trim cẩn thận vì là NVARCHAR
    SET @employeeRole = LTRIM(RTRIM(@employeeRole));
    IF @employeeRole NOT IN (N'ProductMgr', N'OrderMgr', N'CouponMgr') -- Thêm N trước chuỗi
        THROW 53020, 'Lỗi: Chức danh không tồn tại hoặc không hợp lệ.', 1;
    
    -- *** TRANSACTION ***
    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO [USER] (username, email, password, phoneNo, fullName, firstName, lastName, district, province, numAndStreet)
        VALUES (@username, @email, @password, @phoneNo, @fullName, @firstName, @lastName, @district, @province, @numAndStreet);

        SET @NewUserID = SCOPE_IDENTITY();

        INSERT INTO EMPLOYEE (UserID, role) 
        VALUES (@NewUserID, @employeeRole);

        COMMIT TRANSACTION;
        
        SELECT U.*, E.role AS EmployeeRole
        FROM [USER] U JOIN EMPLOYEE E ON U.UserID = E.UserID
        WHERE U.UserID = @NewUserID;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROCEDURE sp_InsertCustomer
    @username VARCHAR(50),
    @email VARCHAR(100),
    @password VARCHAR(100),
    @phoneNo VARCHAR(20) = NULL,
    @fullName NVARCHAR(100) = NULL, -- Đã đổi sang NVARCHAR
    @firstName NVARCHAR(50) = NULL, -- Đã đổi sang NVARCHAR
    @lastName NVARCHAR(50) = NULL,  -- Đã đổi sang NVARCHAR
    @district NVARCHAR(50) = NULL,  -- Đã đổi sang NVARCHAR
    @province NVARCHAR(50) = NULL,  -- Đã đổi sang NVARCHAR
    @numAndStreet NVARCHAR(100) = NULL, -- Đã đổi sang NVARCHAR
    @loyaltyPoint INT = 0
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @NewUserID INT;
    
    -- *** 1. LOGIC TÊN ***
    IF @fullName IS NULL OR LTRIM(RTRIM(@fullName)) = ''
    BEGIN
        SET @fullName = LTRIM(RTRIM(
                          ISNULL(@firstName, '') + 
                          CASE WHEN ISNULL(@firstName, '') != '' AND ISNULL(@lastName, '') != '' THEN ' ' ELSE '' END + 
                          ISNULL(@lastName, '')
                      ));
    END

    IF @fullName IS NULL OR LTRIM(RTRIM(@fullName)) = '' 
        THROW 53012, 'Lỗi: Cần cung cấp ít nhất tên để tạo FullName.', 1;
  
    -- *** 2. LOGIC PHONENO (Bắt buộc với Customer) ***
    IF @phoneNo IS NULL OR LTRIM(RTRIM(@phoneNo)) = ''
        THROW 53010, 'Lỗi: Cần cung cấp số điện thoại cho khách hàng.', 1;

    SET @phoneNo = LTRIM(RTRIM(@phoneNo));
    IF @phoneNo NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
        THROW 53011, 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.', 1;

    -- *** 3. LOGIC EMAIL ***
    SET @email = LTRIM(RTRIM(@email));
    IF @email IS NULL OR @email = '' THROW 53005, 'Email không được rỗng.', 1;
    IF LEN(@email) > 100 THROW 53006, 'Email tối đa 100 ký tự.', 1;
    IF @email NOT LIKE '%_@_%._%' THROW 53007, 'Email phải có dạng <text>@<text>.<text>', 1;
    IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE email = @email)
        THROW 53008, 'Email đã tồn tại.', 1;

    -- *** 4. CHECK USERNAME ***
    SET @username = LTRIM(RTRIM(@username));
    IF @username IS NULL OR @username = '' THROW 53002, 'Username không được rỗng.', 1;
    IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE username = @username)
        THROW 53004, 'Username đã tồn tại.', 1;

    -- *** 5. Password ***
    IF LEN(@password) < 6 THROW 53009, 'Lỗi: Mật khẩu phải có ít nhất 6 ký tự.', 1;

    -- *** TRANSACTION ***
    BEGIN TRANSACTION; 
    BEGIN TRY
        INSERT INTO [USER] (username, email, password, phoneNo, fullName, firstName, lastName, district, province, numAndStreet)
        VALUES (@username, @email, @password, @phoneNo, @fullName, @firstName, @lastName, @district, @province, @numAndStreet);

        SET @NewUserID = SCOPE_IDENTITY();

        INSERT INTO CUSTOMER (UserID, loyaltyPoint) 
        VALUES (@NewUserID, @loyaltyPoint);

        COMMIT TRANSACTION;
    
        SELECT U.*, C.loyaltyPoint, 'Customer' AS RoleType
        FROM [USER] U JOIN CUSTOMER C ON U.UserID = C.UserID
        WHERE U.UserID = @NewUserID;
        
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
GO

CREATE OR ALTER PROC dbo.sp_UpdateUser
  @UserID INT,
  @username    VARCHAR(50),
  @email       VARCHAR(100),
  @password    VARCHAR(100) = NULL,
  @phoneNo     VARCHAR(20)  = NULL,
  @fullName    NVARCHAR(100) = NULL, -- Đã đổi sang NVARCHAR
  @firstName   NVARCHAR(50)  = NULL, -- Đã đổi sang NVARCHAR
  @lastName    NVARCHAR(50)  = NULL, -- Đã đổi sang NVARCHAR
  @district    NVARCHAR(50)  = NULL, -- Đã đổi sang NVARCHAR
  @province    NVARCHAR(50)  = NULL, -- Đã đổi sang NVARCHAR
  @numAndStreet NVARCHAR(100)= NULL  -- Đã đổi sang NVARCHAR
AS
BEGIN
  SET NOCOUNT ON;

  /* 1) Check tồn tại UserID */
  IF NOT EXISTS (SELECT 1 FROM dbo.[USER] WHERE UserID = @UserID)
    THROW 53001, 'UserID không tồn tại.', 1;

  /* --- LOGIC TÊN: Tự động ghép FullName nếu thiếu --- */
  IF @fullName IS NULL OR LTRIM(RTRIM(@fullName)) = ''
  BEGIN
      SET @fullName = LTRIM(RTRIM(
                        ISNULL(@firstName, '') + 
                        CASE 
                          WHEN ISNULL(@firstName, '') != '' AND ISNULL(@lastName, '') != '' THEN ' ' 
                          ELSE '' 
                        END + 
                        ISNULL(@lastName, '')
                    ));
  END
  
  /* 2) Chuẩn hóa chuỗi (trim) */
  SET @username = LTRIM(RTRIM(@username));
  SET @email    = LTRIM(RTRIM(@email));
  IF @phoneNo IS NOT NULL SET @phoneNo = LTRIM(RTRIM(@phoneNo));

  /* Trim các trường NVARCHAR */
  IF @fullName IS NOT NULL SET @fullName = LTRIM(RTRIM(@fullName));
  IF @firstName IS NOT NULL SET @firstName = LTRIM(RTRIM(@firstName));
  IF @lastName IS NOT NULL SET @lastName = LTRIM(RTRIM(@lastName));
  IF @district IS NOT NULL SET @district = LTRIM(RTRIM(@district));
  IF @province IS NOT NULL SET @province = LTRIM(RTRIM(@province));
  IF @numAndStreet IS NOT NULL SET @numAndStreet = LTRIM(RTRIM(@numAndStreet));

  /* 3) Validate username */
  IF @username IS NULL OR @username = '' THROW 53002, 'Username không được rỗng.', 1;
  IF LEN(@username) > 50 THROW 53003, 'Username tối đa 50 ký tự.', 1;
  IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE username = @username AND UserID <> @UserID)
    THROW 53004, 'Username đã tồn tại.', 1;

  /* 4) Validate email */
  IF @email IS NULL OR @email = '' THROW 53005, 'Email không được rỗng.', 1;
  IF LEN(@email) > 100 THROW 53006, 'Email tối đa 100 ký tự.', 1;
  IF @email NOT LIKE '%_@_%._%' THROW 53007, 'Email phải có dạng <text>@<text>.<text>', 1;
  IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE email = @email AND UserID <> @UserID)
    THROW 53008, 'Email đã tồn tại.', 1;

  /* 5) Validate password */
  IF @password IS NOT NULL AND LEN(@password) < 6
    THROW 53009, 'Password phải có ít nhất 6 ký tự.', 1;

  /* 6) Validate phoneNo */
  IF @phoneNo IS NOT NULL
  BEGIN
    IF @phoneNo = '' THROW 53010, 'Số điện thoại không được là chuỗi rỗng.', 1;
    IF @phoneNo NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
      THROW 53011, 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.', 1;
  END

  /* 7) Validate rỗng cho NVARCHAR */
  IF @fullName IS NOT NULL AND @fullName = '' THROW 53012, 'fullName không hợp lệ (chuỗi rỗng).', 1;
  IF @firstName IS NOT NULL AND @firstName = '' THROW 53013, 'firstName không hợp lệ (chuỗi rỗng).', 1;
  IF @lastName IS NOT NULL AND @lastName = '' THROW 53014, 'lastName không hợp lệ (chuỗi rỗng).', 1;
  IF @district IS NOT NULL AND @district = '' THROW 53015, 'district không hợp lệ (chuỗi rỗng).', 1;
  IF @province IS NOT NULL AND @province = '' THROW 53016, 'province không hợp lệ (chuỗi rỗng).', 1;
  IF @numAndStreet IS NOT NULL AND @numAndStreet = '' THROW 53017, 'numAndStreet không hợp lệ (chuỗi rỗng).', 1;

  /* 8) Update */
  UPDATE dbo.[USER]
  SET username = @username,
      email = @email,
      password = CASE 
                 WHEN @password IS NOT NULL AND LTRIM(RTRIM(@password)) <> '' 
                   THEN @password 
                 ELSE password 
               END,
      phoneNo = @phoneNo,
      fullName = @fullName,
      firstName = @firstName,
      lastName = @lastName,
      district = @district,
      province = @province,
      numAndStreet = @numAndStreet
  WHERE UserID = @UserID;
END;
GO

CREATE OR ALTER PROC dbo.sp_DeleteUser
  @UserID INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  /* 1. Kiểm tra tồn tại UserID */
  IF NOT EXISTS (SELECT 1 FROM dbo.[USER] WHERE UserID = @UserID)
    THROW 54001, N'UserID không tồn tại.', 1;

  /* 2. Xác định vai trò (Role) của User */
  DECLARE @isCustomer BIT = CASE WHEN EXISTS (SELECT 1 FROM dbo.CUSTOMER WHERE UserID = @UserID) THEN 1 ELSE 0 END;
  DECLARE @isEmployee BIT = CASE WHEN EXISTS (SELECT 1 FROM dbo.EMPLOYEE WHERE UserID = @UserID) THEN 1 ELSE 0 END;

  /* 3. Chặn xóa nếu còn dữ liệu phụ thuộc (Check Constraints thủ công) */

  -- A. Kiểm tra ràng buộc CUSTOMER
  IF @isCustomer = 1
  BEGIN
    -- Kiểm tra ORDER (Khách đã từng đặt hàng)
    IF EXISTS (SELECT 1 FROM dbo.[ORDER] WHERE customerID = @UserID)
      THROW 54002, N'Không thể xóa: User là CUSTOMER và đã phát sinh đơn hàng (ORDER).', 1;

    -- Kiểm tra CART (Khách đang có giỏ hàng - Active/Ordered/Expired)
    IF EXISTS (SELECT 1 FROM dbo.CART WHERE UserID = @UserID)
      THROW 54003, N'Không thể xóa: User là CUSTOMER và dữ liệu Giỏ hàng (CART) còn tồn tại.', 1;

    -- Kiểm tra RATING (Khách đã từng đánh giá sản phẩm)
    IF EXISTS (SELECT 1 FROM dbo.RATING WHERE customerID = @UserID)
      THROW 54004, N'Không thể xóa: User là CUSTOMER và đã có đánh giá (RATING).', 1;
  END

  -- B. Kiểm tra ràng buộc EMPLOYEE
  IF @isEmployee = 1
  BEGIN
    -- Kiểm tra ORDER (Nhân viên đang phụ trách đơn hàng)
    IF EXISTS (SELECT 1 FROM dbo.[ORDER] WHERE employeeID = @UserID)
      THROW 54005, N'Không thể xóa: User là EMPLOYEE và đang phụ trách xử lý ORDER.', 1;

    -- Kiểm tra COUPON (Nhân viên đã tạo mã giảm giá)
    IF EXISTS (SELECT 1 FROM dbo.COUPON WHERE employeeID = @UserID)
      THROW 54006, N'Không thể xóa: User là EMPLOYEE và đã tạo mã giảm giá (COUPON).', 1;

    -- Kiểm tra MANAGE (Nhân viên đang quản lý sản phẩm)
    IF EXISTS (SELECT 1 FROM dbo.MANAGE WHERE employeeID = @UserID)
      THROW 54007, N'Không thể xóa: User là EMPLOYEE và đang được phân công quản lý sản phẩm (MANAGE).', 1;
  END

  /* 4. Thực hiện xóa (Transaction) */
  BEGIN TRAN;
    
    -- Xóa dữ liệu ở bảng con trước để tránh lỗi FK Constraint
    IF @isCustomer = 1
      DELETE FROM dbo.CUSTOMER WHERE UserID = @UserID;

    IF @isEmployee = 1
      DELETE FROM dbo.EMPLOYEE WHERE UserID = @UserID;

    -- Cuối cùng xóa User ở bảng cha
    DELETE FROM dbo.[USER] WHERE UserID = @UserID;

  COMMIT;
END;
GO

/* --- 2.3.1 --- */

/* =============================================
   Description: Lấy danh sách sản phẩm
   ============================================= */

CREATE OR ALTER PROCEDURE SP_GetProductVarieties
    @Keyword NVARCHAR(100) = NULL,
    @MinPrice DECIMAL(12,2) = NULL,
    @MaxPrice DECIMAL(12,2) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @ActualMin DECIMAL(12,2) = ISNULL(@MinPrice, 0);
    DECLARE @ActualMax DECIMAL(12,2) = ISNULL(@MaxPrice, 9999999999);

    SELECT 
        P.prodID,
        P.name AS productName,
        C.catalogName, 
        V.imageUrl, 
        V.color,
        V.unitOfMeasure,
        V.stockAmount,
        V.listedPrice,
        P.origin,
        P.description,
        CONCAT(P.prodID, '-', V.color, '-', V.unitOfMeasure) AS uniqueKey
    FROM 
        dbo.PRODUCT P
    INNER JOIN 
        dbo.VARIETY V ON P.prodID = V.prodID
    INNER JOIN 
        dbo.CATALOGLIST C ON P.catalogID = C.catalogID 
    WHERE 
        (@Keyword IS NULL OR @Keyword = '' OR P.name LIKE N'%' + @Keyword + N'%')
        AND (V.listedPrice >= @ActualMin AND V.listedPrice <= @ActualMax)
    ORDER BY 
        P.name ASC, V.listedPrice ASC;
END;
GO

CREATE OR ALTER PROCEDURE SP_GetBestSellers
    @MinSoldQuantity INT = 1 
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 4 -- Lấy top 4 bán chạy
        P.prodID,
        P.name AS productName,
        V.color,
        V.imageUrl,
        V.listedPrice,
        SUM(OI.quantity) AS TotalSold 
    FROM 
        dbo.ORDERITEM OI
    INNER JOIN 
        dbo.VARIETY V ON OI.prodID = V.prodID 
                      AND OI.color = V.color 
                      AND OI.unitOfMeasure = V.unitOfMeasure
    INNER JOIN 
        dbo.PRODUCT P ON V.prodID = P.prodID
    GROUP BY 
        P.prodID, P.name, V.color, V.imageUrl, V.listedPrice 
    HAVING 
        SUM(OI.quantity) >= @MinSoldQuantity 
    ORDER BY 
        TotalSold DESC;
END;
GO

-- Desc: Lấy Customer 
/* =============================================
   UPDATE 1: SP_GetAllCustomer
   ============================================= */
CREATE OR ALTER PROCEDURE SP_GetAllCustomer
    @SortBy VARCHAR(20) = 'Spent',
    @FilterType VARCHAR(20) = NULL,
    @FilterValue DECIMAL(12,2) = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.UserID, 
        U.username, 
        U.email, 
        U.fullName,
        U.firstName, 
        U.lastName,  
        U.phoneNo,
        U.district, 
        U.province, 
        U.numAndStreet, 
        C.loyaltyPoint,
        COUNT(O.OrderID) AS TotalOrders,
        ISNULL(SUM(O.finalPrice), 0) AS TotalSpent
    FROM 
        dbo.CUSTOMER C
    INNER JOIN 
        dbo.[USER] U ON C.UserID = U.UserID
    LEFT JOIN 
        dbo.[ORDER] O ON C.UserID = O.customerID AND O.stateOfOrder != 'Cancelled'
    GROUP BY 
        -- Nhớ Group By đủ các cột đã Select
        U.UserID, U.username, U.email, U.fullName, U.firstName, U.lastName, 
        U.phoneNo, U.district, U.province, U.numAndStreet, C.loyaltyPoint
    
    HAVING 
        (@FilterType IS NULL) 
        OR (@FilterType = 'Orders' AND COUNT(O.OrderID) >= @FilterValue) 
        OR (@FilterType = 'Spent' AND ISNULL(SUM(O.finalPrice), 0) >= @FilterValue)

    ORDER BY 
        CASE WHEN @SortBy = 'Spent' THEN ISNULL(SUM(O.finalPrice), 0) END DESC,
        CASE WHEN @SortBy = 'Orders' THEN COUNT(O.OrderID) END DESC,
        CASE WHEN @SortBy = 'Name' THEN U.fullName END ASC,
        CASE WHEN @SortBy = 'Newest' THEN U.UserID END DESC,
        CASE WHEN @SortBy = 'LoyaltyPoint' THEN C.loyaltyPoint END DESC,
        U.UserID ASC;
END;
GO


/* --- 2.3.2 --- */
CREATE OR ALTER PROCEDURE sp_GetProductRevenueStatistic
    @MinRevenue DECIMAL(12,2)   -- điều kiện HAVING
AS
BEGIN
    SELECT
        p.prodID,
        p.name AS ProductName,
        SUM(oi.quantity) AS TotalQuantitySold,
        SUM(oi.quantity * oi.priceInOrderDate) AS TotalRevenue
    FROM PRODUCT p
    JOIN ORDERITEM oi 
        ON p.prodID = oi.prodID
    JOIN [ORDER] o
        ON oi.OrderID = o.OrderID
    WHERE o.stateOfOrder = 'Delivered'          -- WHERE
    GROUP BY p.prodID, p.name                   -- GROUP BY
    HAVING SUM(oi.quantity * oi.priceInOrderDate) >= @MinRevenue   -- HAVING
    ORDER BY TotalRevenue DESC                 -- ORDER BY
END