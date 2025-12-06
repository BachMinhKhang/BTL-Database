USE [BTL2];
GO

-- // 2.1 
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
  @password    VARCHAR(100),
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

  /* 1) Check tồn tại */
  IF NOT EXISTS (SELECT 1 FROM dbo.[USER] WHERE UserID = @UserID)
    THROW 53001, 'UserID không tồn tại.', 1;

  /* 2) Chuẩn hóa chuỗi (trim) */
  SET @username = LTRIM(RTRIM(@username));
  SET @email    = LTRIM(RTRIM(@email));

  IF @phoneNo IS NOT NULL SET @phoneNo = LTRIM(RTRIM(@phoneNo));

  IF @fullName IS NOT NULL SET @fullName = LTRIM(RTRIM(@fullName));
  IF @firstName IS NOT NULL SET @firstName = LTRIM(RTRIM(@firstName));
  IF @lastName IS NOT NULL SET @lastName = LTRIM(RTRIM(@lastName));
  IF @district IS NOT NULL SET @district = LTRIM(RTRIM(@district));
  IF @province IS NOT NULL SET @province = LTRIM(RTRIM(@province));
  IF @numAndStreet IS NOT NULL SET @numAndStreet = LTRIM(RTRIM(@numAndStreet));

  /* 3) Validate username (NOT NULL, UNIQUE) */
  IF @username IS NULL OR @username = ''
    THROW 53002, 'Username không được rỗng.', 1;

  IF LEN(@username) > 50
    THROW 53003, 'Username tối đa 50 ký tự.', 1;

  IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE username = @username AND UserID <> @UserID)
    THROW 53004, 'Username đã tồn tại.', 1;

  /* 4) Validate email (NOT NULL, UNIQUE, phải @gmail.com) */
  IF @email IS NULL OR @email = ''
    THROW 53005, 'Email không được rỗng.', 1;

  IF LEN(@email) > 100
    THROW 53006, 'Email tối đa 100 ký tự.', 1;

  -- dạng <text>@<text>.<text>
  IF @email NOT LIKE '%_@_%._%'
    THROW 53007, 'Email phải có dạng <text>@<text>.<text>', 1;

  IF EXISTS (SELECT 1 FROM dbo.[USER] WHERE email = @email AND UserID <> @UserID)
    THROW 53008, 'Email đã tồn tại.', 1;

  /* 5) Validate password (>=6) */
  IF @password IS NULL OR LEN(@password) < 6
    THROW 53009, 'Password phải có ít nhất 6 ký tự.', 1;

  /* 6) Validate phoneNo (nếu có): 10 số, bắt đầu bằng 0 */
  IF @phoneNo IS NOT NULL
  BEGIN
    IF @phoneNo = ''
      THROW 53010, 'Số điện thoại không được là chuỗi rỗng (hoặc để NULL).', 1;

    IF @phoneNo NOT LIKE '0[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
      THROW 53011, 'Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.', 1;
  END

  /* 7) Validate các field text nullable (nếu nhập thì không được toàn khoảng trắng) */

  IF @firstName IS NOT NULL AND @firstName = ''
    THROW 53013, 'firstName không hợp lệ (chuỗi rỗng). Dùng NULL nếu muốn xóa.', 1;

  IF @lastName IS NOT NULL AND @lastName = ''
    THROW 53014, 'lastName không hợp lệ (chuỗi rỗng). Dùng NULL nếu muốn xóa.', 1;

  IF @fullName IS NULL OR LTRIM(RTRIM(@fullName)) = ''
  BEGIN
      -- Lưu ý: Logic này giả định người dùng muốn update dựa trên tham số truyền vào.
      -- Nếu tham số firstName/lastName cũng NULL thì fullName sẽ có thể thành chuỗi rỗng.
      SET @fullName = LTRIM(RTRIM(
                          ISNULL(@firstName, '') + 
                          CASE 
                            WHEN ISNULL(@firstName, '') != '' AND ISNULL(@lastName, '') != '' THEN ' ' 
                            ELSE '' 
                          END + 
                          ISNULL(@lastName, '')
                      ));
  END
  ELSE 
  BEGIN
      -- Nếu có truyền fullName thì chỉ cần Trim
      SET @fullName = LTRIM(RTRIM(@fullName));
  END

  /* ... Các bước Validate 3, 4, 5, 6 giữ nguyên ... */

  /* 7) Validate các field text nullable */
  -- Logic này sẽ chặn nếu sau khi ghép mà fullName vẫn rỗng (nghĩa là cả 3 biến đều null/rỗng)
  IF @fullName IS NOT NULL AND @fullName = ''
    THROW 53012, 'fullName không hợp lệ (không thể tạo từ firstName/lastName rỗng).', 1;

  IF @district IS NOT NULL AND @district = ''
    THROW 53015, 'district không hợp lệ (chuỗi rỗng). Dùng NULL nếu muốn xóa.', 1;

  IF @province IS NOT NULL AND @province = ''
    THROW 53016, 'province không hợp lệ (chuỗi rỗng). Dùng NULL nếu muốn xóa.', 1;

  IF @numAndStreet IS NOT NULL AND @numAndStreet = ''
    THROW 53017, 'numAndStreet không hợp lệ (chuỗi rỗng). Dùng NULL nếu muốn xóa.', 1;

  /* 8) Update */
  UPDATE dbo.[USER]
  SET username = @username,
      email = @email,
      password = @password,
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

  IF NOT EXISTS (SELECT 1 FROM dbo.[USER] WHERE UserID = @UserID)
    THROW 54001, 'UserID không tồn tại.', 1;

  DECLARE @isCustomer BIT = CASE WHEN EXISTS (SELECT 1 FROM dbo.CUSTOMER WHERE UserID = @UserID) THEN 1 ELSE 0 END;
  DECLARE @isEmployee BIT = CASE WHEN EXISTS (SELECT 1 FROM dbo.EMPLOYEE WHERE UserID = @UserID) THEN 1 ELSE 0 END;

  /* Chặn xóa nếu còn dữ liệu phụ thuộc */

  -- CUSTOMER dependencies
  IF @isCustomer = 1
  BEGIN
    IF EXISTS (SELECT 1 FROM dbo.[ORDER] WHERE customerID = @UserID)
      THROW 54002, 'Không thể xóa: user là CUSTOMER và đã phát sinh ORDER.', 1;

    IF EXISTS (SELECT 1 FROM dbo.CART WHERE UserID = @UserID)
      THROW 54003, 'Không thể xóa: user là CUSTOMER và còn CART.', 1;

    IF EXISTS (SELECT 1 FROM dbo.RATING WHERE customerID = @UserID)
      THROW 54004, 'Không thể xóa: user là CUSTOMER và còn RATING.', 1;
  END

  -- EMPLOYEE/Admin dependencies
  IF @isEmployee = 1
  BEGIN
    IF EXISTS (SELECT 1 FROM dbo.[ORDER] WHERE employeeID = @UserID)
      THROW 54005, 'Không thể xóa: user là EMPLOYEE và đã xử lý ORDER.', 1;

    IF EXISTS (SELECT 1 FROM dbo.COUPON WHERE employeeID = @UserID)
      THROW 54006, 'Không thể xóa: user là EMPLOYEE và đã tạo COUPON.', 1;

    IF EXISTS (SELECT 1 FROM dbo.MANAGE WHERE employeeID = @UserID)
      THROW 54007, 'Không thể xóa: user là EMPLOYEE và còn phân công MANAGE.', 1;
  END

  BEGIN TRAN;

    -- xóa bảng con trước
    IF @isCustomer = 1
      DELETE FROM dbo.CUSTOMER WHERE UserID = @UserID;

    IF @isEmployee = 1
      DELETE FROM dbo.EMPLOYEE WHERE UserID = @UserID;

    -- cuối cùng xóa user
    DELETE FROM dbo.[USER] WHERE UserID = @UserID;

  COMMIT;
END;
GO


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
        C.catalogName, -- <--- LẤY THÊM CỘT NÀY TỪ BẢNG THỨ 3
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
        dbo.CATALOGLIST C ON P.catalogID = C.catalogID -- <--- JOIN BẢNG THỨ 3
    WHERE 
        (@Keyword IS NULL OR @Keyword = '' OR P.name LIKE N'%' + @Keyword + N'%')
        AND (V.listedPrice >= @ActualMin AND V.listedPrice <= @ActualMax)
    ORDER BY 
        P.name ASC, V.listedPrice ASC;
END;
GO

/*CREATE OR ALTER PROCEDURE SP_GetBestSellers
    @MinSoldQuantity INT = 1 -- Chỉ lấy SP bán được ít nhất 1 cái (Dùng HAVING)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 4 -- Lấy top 4 bán chạy
        P.prodID,
        P.name AS productName,
        V.color,
        V.imageUrl,
        V.listedPrice,
        SUM(OI.quantity) AS TotalSold -- Aggregate Function
    FROM 
        dbo.ORDERITEM OI
    INNER JOIN 
        dbo.VARIETY V ON OI.prodID = V.prodID 
                      AND OI.color = V.color 
                      AND OI.unitOfMeasure = V.unitOfMeasure
    INNER JOIN 
        dbo.PRODUCT P ON V.prodID = P.prodID
    GROUP BY 
        P.prodID, P.name, V.color, V.imageUrl, V.listedPrice -- Group By
    HAVING 
        SUM(OI.quantity) >= @MinSoldQuantity -- Having
    ORDER BY 
        TotalSold DESC;
END;
GO*/
USE [BTL2];
GO

CREATE OR ALTER PROCEDURE SP_GetBestSellers
    @MinSoldQuantity INT = 1
AS
BEGIN
    SET NOCOUNT ON;

    SELECT TOP 4
        P.prodID,
        P.name AS productName,
        V.color,
        V.unitOfMeasure, -- [MỚI] Thêm cột này
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
        P.prodID, P.name, V.color, V.unitOfMeasure, V.imageUrl, V.listedPrice -- [MỚI] Thêm vào Group By
    HAVING 
        SUM(OI.quantity) >= @MinSoldQuantity
    ORDER BY 
        TotalSold DESC;
END;
GO

-- Desc: Lấy Customer 
CREATE OR ALTER PROCEDURE SP_GetAllCustomer
AS
BEGIN
    SET NOCOUNT ON;
    SELECT U.UserID, U.username, U.email, U.fullName, 
           U.district, U.province, U.numAndStreet, C.loyaltyPoint
    FROM CUSTOMER C  
    JOIN [USER] U ON C.UserID = U.UserID
    ORDER BY C.loyaltyPoint DESC
END;
GO

CREATE OR ALTER PROCEDURE SP_SearchUser
    @Keyword NVARCHAR(100) = NULL,  -- Từ khóa tìm kiếm (Tên user)
    @MinP INT = NULL, -- Điểm thấp nhất
    @MaxP INT = NULL  -- Điểm cao nhất
AS
BEGIN
    SET NOCOUNT ON;

    -- Xử lý NULL: Nếu người dùng không nhập thì gán giá trị mặc định
    -- Nếu không nhập MinPrice thì coi như là 0
    -- Nếu không nhập MaxPrice thì coi như là số cực lớn
    DECLARE @ActualMin INT = ISNULL(@MinP, 0);
    DECLARE @ActualMax INT = ISNULL(@MaxP, 999999999);

    SELECT U.UserID, U.username, U.email, U.fullName, U.district, U.province, U.numAndStreet, C.loyaltyPoint
    FROM CUSTOMER C  
    JOIN [USER] U ON C.UserID = U.UserID
    WHERE 
        -- Tìm kiếm gần đúng theo tên (LIKE)
        (@Keyword IS NULL OR @Keyword = '' OR U.username LIKE '%' + @Keyword + '%' OR U.fullName LIKE '%' + @Keyword + '%')
        -- Tìm trong khoảng giá
        AND (C.loyaltyPoint >= @ActualMin AND C.loyaltyPoint <= @ActualMax)
    ORDER BY C.loyaltyPoint DESC
END;
GO


