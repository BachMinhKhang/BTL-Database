USE [BTL2];
GRANT EXECUTE TO nodejs_user;
GO

/* =============================================
   1. SP_INSERTEMPLOYEE
   ============================================= */
IF OBJECT_ID('dbo.sp_InsertEmployee', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_InsertEmployee;
GO

CREATE PROCEDURE sp_InsertEmployee
    @username VARCHAR(50),
    @email VARCHAR(100),
    @password VARCHAR(100),
    @employeeRole NVARCHAR(50),
    @phoneNo VARCHAR(20) = NULL,
    @fullName NVARCHAR(100) = NULL,
    @firstName NVARCHAR(50) = NULL,
    @lastName NVARCHAR(50) = NULL,
    @district NVARCHAR(50) = NULL,
    @province NVARCHAR(50) = NULL,
    @numAndStreet NVARCHAR(100) = NULL
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

    -- *** 2. LOGIC PHONENO ***
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

    SET @employeeRole = LTRIM(RTRIM(@employeeRole));
    IF @employeeRole NOT IN (N'ProductMgr', N'OrderMgr', N'CouponMgr')
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

/* =============================================
   2. SP_INSERTCUSTOMER
   ============================================= */
IF OBJECT_ID('dbo.sp_InsertCustomer', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_InsertCustomer;
GO

CREATE PROCEDURE sp_InsertCustomer
    @username VARCHAR(50),
    @email VARCHAR(100),
    @password VARCHAR(100),
    @phoneNo VARCHAR(20) = NULL,
    @fullName NVARCHAR(100) = NULL,
    @firstName NVARCHAR(50) = NULL,
    @lastName NVARCHAR(50) = NULL,
    @district NVARCHAR(50) = NULL,
    @province NVARCHAR(50) = NULL,
    @numAndStreet NVARCHAR(100) = NULL,
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
  
    -- *** 2. LOGIC PHONENO ***
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

/* =============================================
   3. SP_UPDATEUSER
   ============================================= */
IF OBJECT_ID('dbo.sp_UpdateUser', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_UpdateUser;
GO

CREATE PROCEDURE dbo.sp_UpdateUser
  @UserID INT,
  @username    VARCHAR(50),
  @email       VARCHAR(100),
  @password    VARCHAR(100) = NULL,
  @phoneNo     VARCHAR(20)  = NULL,
  @fullName    NVARCHAR(100) = NULL,
  @firstName   NVARCHAR(50)  = NULL,
  @lastName    NVARCHAR(50)  = NULL,
  @district    NVARCHAR(50)  = NULL,
  @province    NVARCHAR(50)  = NULL,
  @numAndStreet NVARCHAR(100)= NULL
AS
BEGIN
  SET NOCOUNT ON;

  /* 1) Check tồn tại UserID */
  IF NOT EXISTS (SELECT 1 FROM dbo.[USER] WHERE UserID = @UserID)
    THROW 53001, 'UserID không tồn tại.', 1;

  /* --- LOGIC TÊN --- */
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
  
  SET @username = LTRIM(RTRIM(@username));
  SET @email    = LTRIM(RTRIM(@email));
  IF @phoneNo IS NOT NULL SET @phoneNo = LTRIM(RTRIM(@phoneNo));
  IF @fullName IS NOT NULL SET @fullName = LTRIM(RTRIM(@fullName));
  IF @firstName IS NOT NULL SET @firstName = LTRIM(RTRIM(@firstName));
  IF @lastName IS NOT NULL SET @lastName = LTRIM(RTRIM(@lastName));
  IF @district IS NOT NULL SET @district = LTRIM(RTRIM(@district));
  IF @province IS NOT NULL SET @province = LTRIM(RTRIM(@province));
  IF @numAndStreet IS NOT NULL SET @numAndStreet = LTRIM(RTRIM(@numAndStreet));

  /* Validate username */
  IF @username IS NULL OR @username = '' THROW 53002, 'Username không được rỗng.', 1;
  IF LEN(@username) > 50 THROW 53003, 'Username tối đa 50 ký tự.', 1;
  IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE username = @username AND UserID <> @UserID)
    THROW 53004, 'Username đã tồn tại.', 1;

  /* Validate email */
  IF @email IS NULL OR @email = '' THROW 53005, 'Email không được rỗng.', 1;
  IF LEN(@email) > 100 THROW 53006, 'Email tối đa 100 ký tự.', 1;
  IF @email NOT LIKE '%_@_%._%' THROW 53007, 'Email phải có dạng <text>@<text>.<text>', 1;
  IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE email = @email AND UserID <> @UserID)
    THROW 53008, 'Email đã tồn tại.', 1;

  /* Validate password */
  IF @password IS NOT NULL AND LEN(@password) < 6
    THROW 53009, 'Password phải có ít nhất 6 ký tự.', 1;

  /* Validate phoneNo */
  IF @phoneNo IS NOT NULL
  BEGIN
    IF @phoneNo = '' THROW 53010, 'Số điện thoại không được là chuỗi rỗng.', 1;
    IF @phoneNo NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
      THROW 53011, 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.', 1;
  END

  /* Validate text fields */
  IF @firstName IS NOT NULL AND @firstName = '' THROW 53013, 'firstName không hợp lệ.', 1;
  IF @lastName IS NOT NULL AND @lastName = '' THROW 53014, 'lastName không hợp lệ.', 1;

  IF @fullName IS NULL OR LTRIM(RTRIM(@fullName)) = ''
  BEGIN
      SET @fullName = LTRIM(RTRIM(ISNULL(@firstName, '') + CASE WHEN ISNULL(@firstName, '') != '' AND ISNULL(@lastName, '') != '' THEN ' ' ELSE '' END + ISNULL(@lastName, '')));
  END
  ELSE SET @fullName = LTRIM(RTRIM(@fullName));

  IF @fullName IS NOT NULL AND @fullName = '' THROW 53012, 'fullName không hợp lệ.', 1;
  IF @district IS NOT NULL AND @district = '' THROW 53015, 'district không hợp lệ.', 1;
  IF @province IS NOT NULL AND @province = '' THROW 53016, 'province không hợp lệ.', 1;
  IF @numAndStreet IS NOT NULL AND @numAndStreet = '' THROW 53017, 'numAndStreet không hợp lệ.', 1;

  UPDATE dbo.[USER]
  SET username = @username,
      email = @email,
      password = CASE WHEN @password IS NOT NULL AND LTRIM(RTRIM(@password)) <> '' THEN @password ELSE password END,
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

/* =============================================
   4. SP_DELETEUSER
   ============================================= */
IF OBJECT_ID('dbo.sp_DeleteUser', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_DeleteUser;
GO

CREATE PROCEDURE dbo.sp_DeleteUser
  @UserID INT
AS
BEGIN
  SET NOCOUNT ON;
  SET XACT_ABORT ON;

  /* 1. Kiểm tra tồn tại UserID */
  IF NOT EXISTS (SELECT 1 FROM dbo.[USER] WHERE UserID = @UserID)
    THROW 54001, N'UserID không tồn tại.', 1;

  DECLARE @isCustomer BIT = CASE WHEN EXISTS (SELECT 1 FROM dbo.CUSTOMER WHERE UserID = @UserID) THEN 1 ELSE 0 END;
  DECLARE @isEmployee BIT = CASE WHEN EXISTS (SELECT 1 FROM dbo.EMPLOYEE WHERE UserID = @UserID) THEN 1 ELSE 0 END;

  -- Check CUSTOMER
  IF @isCustomer = 1
  BEGIN
    IF EXISTS (SELECT 1 FROM dbo.[ORDER] WHERE customerID = @UserID) THROW 54002, N'User là CUSTOMER và đã có đơn hàng.', 1;
    IF EXISTS (SELECT 1 FROM dbo.CART WHERE UserID = @UserID) THROW 54003, N'User là CUSTOMER và còn Giỏ hàng.', 1;
    IF EXISTS (SELECT 1 FROM dbo.RATING WHERE customerID = @UserID) THROW 54004, N'User là CUSTOMER và đã có đánh giá.', 1;
  END

  -- Check EMPLOYEE
  IF @isEmployee = 1
  BEGIN
    IF EXISTS (SELECT 1 FROM dbo.[ORDER] WHERE employeeID = @UserID) THROW 54005, N'User là EMPLOYEE và đang phụ trách đơn hàng.', 1;
    IF EXISTS (SELECT 1 FROM dbo.COUPON WHERE employeeID = @UserID) THROW 54006, N'User là EMPLOYEE và đã tạo mã giảm giá.', 1;
    IF EXISTS (SELECT 1 FROM dbo.MANAGE WHERE employeeID = @UserID) THROW 54007, N'User là EMPLOYEE và đang quản lý sản phẩm.', 1;
  END

  /* 4. Thực hiện xóa */
  BEGIN TRAN;
    IF @isCustomer = 1 DELETE FROM dbo.CUSTOMER WHERE UserID = @UserID;
    IF @isEmployee = 1 DELETE FROM dbo.EMPLOYEE WHERE UserID = @UserID;
    DELETE FROM dbo.[USER] WHERE UserID = @UserID;
  COMMIT;
END;
GO

/* =============================================
   5. SP_GETPRODUCTVARIETIES
   ============================================= */
IF OBJECT_ID('dbo.SP_GetProductVarieties', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_GetProductVarieties;
GO

CREATE PROCEDURE SP_GetProductVarieties
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
    FROM dbo.PRODUCT P
    INNER JOIN dbo.VARIETY V ON P.prodID = V.prodID
    INNER JOIN dbo.CATALOGLIST C ON P.catalogID = C.catalogID 
    WHERE 
        (@Keyword IS NULL OR @Keyword = '' OR P.name LIKE N'%' + @Keyword + N'%')
        AND (V.listedPrice >= @ActualMin AND V.listedPrice <= @ActualMax)
    ORDER BY P.name ASC, V.listedPrice ASC;
END;
GO

/* =============================================
   6. SP_GETBESTSELLERS
   ============================================= */
IF OBJECT_ID('dbo.SP_GetBestSellers', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_GetBestSellers;
GO

CREATE PROCEDURE SP_GetBestSellers
    @MinSoldQuantity INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 4
        P.prodID,
        P.name AS productName,
        V.color,
        V.unitOfMeasure,
        V.imageUrl,
        V.listedPrice,
        SUM(OI.quantity) AS TotalSold
    FROM dbo.ORDERITEM OI
    INNER JOIN dbo.VARIETY V ON OI.prodID = V.prodID AND OI.color = V.color AND OI.unitOfMeasure = V.unitOfMeasure
    INNER JOIN dbo.PRODUCT P ON V.prodID = P.prodID
    GROUP BY P.prodID, P.name, V.color, V.unitOfMeasure, V.imageUrl, V.listedPrice
    HAVING SUM(OI.quantity) >= @MinSoldQuantity
    ORDER BY TotalSold DESC;
END;
GO

/* =============================================
   7. SP_GETALLCUSTOMER
   ============================================= */
IF OBJECT_ID('dbo.SP_GetAllCustomer', 'P') IS NOT NULL DROP PROCEDURE dbo.SP_GetAllCustomer;
GO

CREATE PROCEDURE SP_GetAllCustomer
    @SortBy VARCHAR(20) = 'Spent',
    @FilterType VARCHAR(20) = NULL,
    @FilterValue DECIMAL(12,2) = 0
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        U.UserID, U.username, U.email, U.fullName,
        U.firstName, U.lastName, U.phoneNo,
        U.district, U.province, U.numAndStreet, 
        C.loyaltyPoint,
        COUNT(O.OrderID) AS TotalOrders,
        ISNULL(SUM(O.finalPrice), 0) AS TotalSpent
    FROM dbo.CUSTOMER C
    INNER JOIN dbo.[USER] U ON C.UserID = U.UserID
    LEFT JOIN dbo.[ORDER] O ON C.UserID = O.customerID AND O.stateOfOrder != 'Cancelled'
    GROUP BY U.UserID, U.username, U.email, U.fullName, U.firstName, U.lastName, 
        U.phoneNo, U.district, U.province, U.numAndStreet, C.loyaltyPoint
    HAVING 
        (@FilterType IS NULL) 
        OR (@FilterType = 'Orders' AND COUNT(O.OrderID) >= @FilterValue) 
        OR (@FilterType = 'Spent' AND ISNULL(SUM(O.finalPrice), 0) >= @FilterValue)
    ORDER BY 
        CASE WHEN @SortBy = 'Spent' THEN ISNULL(SUM(O.finalPrice), 0) END DESC,
        CASE WHEN @SortBy = 'Orders' THEN COUNT(O.OrderID) END DESC,
        CASE WHEN @SortBy = 'Name' THEN U.firstName END ASC,
        CASE WHEN @SortBy = 'Newest' THEN U.UserID END DESC,
        CASE WHEN @SortBy = 'LoyaltyPoint' THEN C.loyaltyPoint END DESC,
        U.UserID ASC;
END;
GO

/* =============================================
   8. SP_GETPRODUCTREVENUESTATISTIC
   ============================================= */
IF OBJECT_ID('dbo.sp_GetProductRevenueStatistic', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_GetProductRevenueStatistic;
GO

CREATE PROCEDURE sp_GetProductRevenueStatistic
    @MinRevenue DECIMAL(12,2)
AS
BEGIN
    SELECT
        p.prodID,
        p.name AS ProductName,
        SUM(oi.quantity) AS TotalQuantitySold,
        SUM(oi.quantity * oi.priceInOrderDate) AS TotalRevenue
    FROM PRODUCT p
    JOIN ORDERITEM oi ON p.prodID = oi.prodID
    JOIN [ORDER] o ON oi.OrderID = o.OrderID
    WHERE o.stateOfOrder = 'Delivered'
    GROUP BY p.prodID, p.name
    HAVING SUM(oi.quantity * oi.priceInOrderDate) >= @MinRevenue
    ORDER BY TotalRevenue DESC
END
GO