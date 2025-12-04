USE [BTL2];
GO

/* =============================================
   Description: Lấy danh sách sản phẩm, Join 3 bảng, Sắp xếp theo giá giảm dần
   ============================================= */

CREATE OR ALTER PROCEDURE SP_GetProductList
    @CatalogID INT = NULL -- Tham số tùy chọn (NULL thì lấy hết)
AS
BEGIN
    SET NOCOUNT ON;

    -- 1. Dùng CTE đệ quy để lấy danh sách ID của nó và toàn bộ con cháu
    WITH CatalogTree AS (
        -- Neo (Anchor): Lấy chính nó
        SELECT catalogID
        FROM dbo.CATALOGLIST
        WHERE catalogID = @CatalogID
        
        UNION ALL
        
        -- Đệ quy (Recursive): Lấy các con của những thằng đã tìm thấy ở trên
        SELECT c.catalogID
        FROM dbo.CATALOGLIST c
        INNER JOIN CatalogTree ct ON c.parentCatalogID = ct.catalogID
    )

    -- 2. Select dữ liệu
    SELECT 
        P.prodID,
        P.name AS [Tên Sản Phẩm],
        C.catalogName AS [Danh Mục],
        V.color AS [Màu Sắc],
        V.unitOfMeasure AS [ĐVT],
        V.listedPrice AS [Giá Niêm Yết],
        V.stockAmount AS [Tồn Kho],
        P.origin AS [Xuất Xứ]
    FROM 
        dbo.PRODUCT P
    INNER JOIN 
        dbo.VARIETY V ON P.prodID = V.prodID
    INNER JOIN 
        dbo.CATALOGLIST C ON P.catalogID = C.catalogID
    WHERE 
        -- Logic: Nếu @CatalogID là NULL thì lấy hết, 
        -- Nếu có nhập ID thì chỉ lấy những SP thuộc danh sách ID tìm được trong CTE (Cha + Con)
        (@CatalogID IS NULL) 
        OR 
        (P.catalogID IN (SELECT catalogID FROM CatalogTree))
    ORDER BY 
        V.listedPrice DESC,
        P.name ASC;
END;
GO

/* =============================================
   Description: Tìm kiếm sản phẩm theo Tên và Khoảng giá
   ============================================= */
CREATE OR ALTER PROCEDURE SP_SearchProduct
    @Keyword NVARCHAR(100) = NULL,  -- Từ khóa tìm kiếm (Tên SP)
    @MinPrice DECIMAL(12,2) = NULL, -- Giá thấp nhất
    @MaxPrice DECIMAL(12,2) = NULL  -- Giá cao nhất
AS
BEGIN
    SET NOCOUNT ON;

    -- Xử lý NULL: Nếu người dùng không nhập thì gán giá trị mặc định
    -- Nếu không nhập MinPrice thì coi như là 0
    -- Nếu không nhập MaxPrice thì coi như là số cực lớn
    DECLARE @ActualMin DECIMAL(12,2) = ISNULL(@MinPrice, 0);
    DECLARE @ActualMax DECIMAL(12,2) = ISNULL(@MaxPrice, 9999999999.99);

    SELECT 
        P.prodID,
        P.name AS [Tên Sản Phẩm],
        C.catalogName AS [Danh Mục],
        V.color AS [Màu],
        V.listedPrice AS [Giá],
        V.stockAmount AS [Tồn Kho]
    FROM 
        dbo.PRODUCT P
    INNER JOIN 
        dbo.VARIETY V ON P.prodID = V.prodID
    INNER JOIN 
        dbo.CATALOGLIST C ON P.catalogID = C.catalogID
    WHERE 
        -- Tìm kiếm gần đúng theo tên (LIKE)
        (@Keyword IS NULL OR P.name LIKE '%' + @Keyword + '%') 
        -- Tìm trong khoảng giá
        AND (V.listedPrice >= @ActualMin AND V.listedPrice <= @ActualMax)
    ORDER BY 
        V.listedPrice ASC; -- Xếp giá tăng dần để dễ so sánh
END;
GO
