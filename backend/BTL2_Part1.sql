USE master; 
GO

IF EXISTS (
    SELECT name 
    FROM master.sys.databases 
    WHERE name = N'BTL2'
)
BEGIN
    ALTER DATABASE [BTL2] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    
    DROP DATABASE [BTL2];
END

CREATE DATABASE [BTL2];
GO

USE [BTL2];
GO

/* ===========================
   0. Xóa bảng cũ (nếu có)
   =========================== */
IF OBJECT_ID('dbo.RATING','U') IS NOT NULL DROP TABLE dbo.RATING;
IF OBJECT_ID('dbo.MANAGE','U') IS NOT NULL DROP TABLE dbo.MANAGE;
IF OBJECT_ID('dbo.SHIPMENT','U') IS NOT NULL DROP TABLE dbo.SHIPMENT;
IF OBJECT_ID('dbo.PAYMENT','U') IS NOT NULL DROP TABLE dbo.PAYMENT;
IF OBJECT_ID('dbo.ORDERITEM','U') IS NOT NULL DROP TABLE dbo.ORDERITEM;
IF OBJECT_ID('dbo.[ORDER]','U') IS NOT NULL DROP TABLE dbo.[ORDER];
IF OBJECT_ID('dbo.CARTITEM','U') IS NOT NULL DROP TABLE dbo.CARTITEM;
IF OBJECT_ID('dbo.CART','U') IS NOT NULL DROP TABLE dbo.CART;
IF OBJECT_ID('dbo.CARRIER','U') IS NOT NULL DROP TABLE dbo.CARRIER;
IF OBJECT_ID('dbo.PROVIDE','U') IS NOT NULL DROP TABLE dbo.PROVIDE;
IF OBJECT_ID('dbo.SUPPLIER','U') IS NOT NULL DROP TABLE dbo.SUPPLIER;
IF OBJECT_ID('dbo.VARIETY','U') IS NOT NULL DROP TABLE dbo.VARIETY;
IF OBJECT_ID('dbo.PRODUCT','U') IS NOT NULL DROP TABLE dbo.PRODUCT;
IF OBJECT_ID('dbo.CATALOGLIST','U') IS NOT NULL DROP TABLE dbo.CATALOGLIST;
IF OBJECT_ID('dbo.COUPON','U') IS NOT NULL DROP TABLE dbo.COUPON;
IF OBJECT_ID('dbo.EMPLOYEE','U') IS NOT NULL DROP TABLE dbo.EMPLOYEE;
IF OBJECT_ID('dbo.CUSTOMER','U') IS NOT NULL DROP TABLE dbo.CUSTOMER;
IF OBJECT_ID('dbo.[USER]','U') IS NOT NULL DROP TABLE dbo.[USER];

/* ===========================
   1. TẠO BẢNG (Đã update NVARCHAR)
   =========================== */

/* USER: Các trường tên và địa chỉ đổi sang NVARCHAR */
CREATE TABLE [USER](
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE, -- Username thường không dấu
    email VARCHAR(100) NOT NULL UNIQUE CHECK (email LIKE '%@%'),
    password VARCHAR(100) NOT NULL CHECK (LEN(password) >= 6),
    phoneNo VARCHAR(20) NULL CHECK (phoneNo NOT LIKE '%[^0-9+]%'),
    fullName NVARCHAR(100) NULL,      -- Đã sửa
    firstName NVARCHAR(50) NULL,      -- Đã sửa
    lastName NVARCHAR(50) NULL,       -- Đã sửa
    district NVARCHAR(50) NULL,       -- Đã sửa
    province NVARCHAR(50) NULL,       -- Đã sửa
    numAndStreet NVARCHAR(100) NULL   -- Đã sửa
);
GO

/* CUSTOMER */
CREATE TABLE CUSTOMER(
    UserID INT PRIMARY KEY,
    loyaltyPoint INT DEFAULT 0 CHECK (loyaltyPoint >= 0),
    FOREIGN KEY (UserID) REFERENCES [USER](UserID)
);
GO

/* EMPLOYEE */
CREATE TABLE EMPLOYEE(
    UserID INT PRIMARY KEY,
    role NVARCHAR(50) NOT NULL, -- Đã sửa
    FOREIGN KEY (UserID) REFERENCES [USER](UserID)
);
GO

/* CATALOGLIST */
CREATE TABLE CATALOGLIST(
    catalogID INT IDENTITY(1,1) PRIMARY KEY,
    catalogName NVARCHAR(100) NOT NULL, -- Đã sửa
    parentCatalogID INT NULL,
    CONSTRAINT FK_CATALOG_PARENT FOREIGN KEY (parentCatalogID) REFERENCES CATALOGLIST(catalogID)
);
GO

/* PRODUCT */
CREATE TABLE PRODUCT(
    prodID INT IDENTITY(1,1) PRIMARY KEY,
    catalogID INT NOT NULL,
    name NVARCHAR(150) NOT NULL,              -- Đã sửa
    description NVARCHAR(500) NULL,           -- Đã sửa
    placeOfProduction NVARCHAR(150) NULL,     -- Đã sửa
    origin NVARCHAR(100) NULL,                -- Đã sửa
    FOREIGN KEY (catalogID) REFERENCES CATALOGLIST(catalogID)
);
GO

/* VARIETY*/
CREATE TABLE VARIETY(
    prodID INT NOT NULL,
    color NVARCHAR(50) NOT NULL,          -- Đã sửa
    stockAmount INT NOT NULL CHECK (stockAmount >= 0),
    unitOfMeasure NVARCHAR(30) NOT NULL,  -- Đã sửa
    listedPrice DECIMAL(12,2) NOT NULL CHECK (listedPrice >= 0),
    imageUrl VARCHAR(500) NULL, -- <--- Mới thêm nha
    PRIMARY KEY (prodID, color, unitOfMeasure),
    FOREIGN KEY (prodID) REFERENCES PRODUCT(prodID)
);
GO

/* SUPPLIER*/
CREATE TABLE SUPPLIER(
    supplierID INT IDENTITY(1,1) PRIMARY KEY,
    origin NVARCHAR(100) NULL,       -- Đã sửa
    description NVARCHAR(500) NULL   -- Đã sửa
);
GO

/* PROVIDE */
CREATE TABLE PROVIDE(
    supplierID INT NOT NULL,
    prodID INT NOT NULL,
    PRIMARY KEY (supplierID, prodID),
    FOREIGN KEY (supplierID) REFERENCES SUPPLIER(supplierID),
    FOREIGN KEY (prodID) REFERENCES PRODUCT(prodID)
);
GO

/* CARRIER*/
CREATE TABLE CARRIER(
    carrierID INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL, -- Đã sửa
    phone VARCHAR(20) NULL CHECK (phone NOT LIKE '%[^0-9+]%')
);
GO

/* CART*/
CREATE TABLE CART(
    CartID INT IDENTITY(1,1) PRIMARY KEY,
    cartState VARCHAR(20) NOT NULL CHECK (cartState IN ('Active','Ordered','Expired')),
    UserID INT NOT NULL,
    FOREIGN KEY (UserID) REFERENCES CUSTOMER(UserID)
);
GO

/* CARTITEM*/
CREATE TABLE CARTITEM(
    CartID INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    ordinalNumber INT NOT NULL,
    color NVARCHAR(50) NOT NULL,         -- Đã sửa (FK)
    unitOfMeasure NVARCHAR(30) NOT NULL, -- Đã sửa (FK)
    prodID INT NOT NULL,
    PRIMARY KEY (CartID, ordinalNumber),
    FOREIGN KEY (CartID) REFERENCES CART(CartID),
    FOREIGN KEY (prodID, color, unitOfMeasure) REFERENCES VARIETY(prodID, color, unitOfMeasure)
);
GO

/* COUPON: Mô tả khuyến mãi */
CREATE TABLE COUPON(
    CouponID INT IDENTITY(1,1) PRIMARY KEY,
    employeeID INT NOT NULL,
    description NVARCHAR(300) NULL, -- Đã sửa
    discountPercent INT NULL CHECK (discountPercent BETWEEN 0 AND 100),
    discountedPrice DECIMAL(12,2) NULL CHECK (discountedPrice >= 0),
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(UserID),
    CHECK (endDate > startDate)
);
GO

/* ORDER*/
CREATE TABLE [ORDER](
    OrderID INT IDENTITY(1,1) PRIMARY KEY,
    customerID INT NOT NULL,
    employeeID INT NOT NULL,
    couponID INT NULL,
    orderDate DATE NOT NULL,
    finalPrice DECIMAL(12,2) NOT NULL CHECK (finalPrice >= 0),
    stateOfOrder VARCHAR(20) NULL CHECK (stateOfOrder IN ('New','Processing','Shipped','Delivered','Cancelled')),
    addrToShip NVARCHAR(300) NULL, -- Đã sửa
    FOREIGN KEY (customerID) REFERENCES CUSTOMER(UserID),
    FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(UserID),
    FOREIGN KEY (couponID) REFERENCES COUPON(CouponID)
);
GO

/* ORDERITEM*/
CREATE TABLE ORDERITEM(
    OrderID INT NOT NULL,
    color NVARCHAR(50) NOT NULL,         -- Đã sửa (FK)
    unitOfMeasure NVARCHAR(30) NOT NULL, -- Đã sửa (FK)
    prodID INT NOT NULL,
    ordinalNo INT NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    fullPrice DECIMAL(12,2) NULL,
    priceInOrderDate DECIMAL(12,2) NOT NULL CHECK (priceInOrderDate >= 0),
    PRIMARY KEY (OrderID, ordinalNo),
    FOREIGN KEY (OrderID) REFERENCES [ORDER](OrderID),
    FOREIGN KEY (prodID, color, unitOfMeasure) REFERENCES VARIETY(prodID, color, unitOfMeasure)
);
GO

/* PAYMENT: Nhà cung cấp, Phương thức (VD: Ví MoMo) */
CREATE TABLE PAYMENT(
    TransID INT IDENTITY(1,1) PRIMARY KEY,
    OrderID INT NOT NULL,
    provider NVARCHAR(100) NULL,      -- Đã sửa
    paymentMethod NVARCHAR(50) NULL,  -- Đã sửa
    paidAmount DECIMAL(12,2) NOT NULL CHECK (paidAmount >= 0),
    status VARCHAR(30) NULL CHECK (status IN ('Pending','Completed','Failed','Refunded')),
    FOREIGN KEY (OrderID) REFERENCES [ORDER](OrderID)
);
GO

/* SHIPMENT */
CREATE TABLE SHIPMENT(
    ShipmentID INT IDENTITY(1,1) PRIMARY KEY,
    price DECIMAL(12,2) NOT NULL CHECK (price >= 0),
    plannedDate DATE NOT NULL,
    shipState VARCHAR(30) NULL CHECK (shipState IN ('Prepared','InTransit','Delivered','Returned')),
    carrierID INT NOT NULL,
    OrderID INT NOT NULL,
    FOREIGN KEY (carrierID) REFERENCES CARRIER(carrierID),
    FOREIGN KEY (OrderID) REFERENCES [ORDER](OrderID)
);
GO

/* MANAGE */
CREATE TABLE MANAGE(
    employeeID INT NOT NULL,
    prodID INT NOT NULL,
    PRIMARY KEY (employeeID, prodID),
    FOREIGN KEY (employeeID) REFERENCES EMPLOYEE(UserID),
    FOREIGN KEY (prodID) REFERENCES PRODUCT(prodID)
);
GO

/* RATING*/
CREATE TABLE RATING(
    ratingID INT IDENTITY(1,1) PRIMARY KEY,
    customerID INT NOT NULL,
    prodID INT NOT NULL,
    starNo INT NOT NULL CHECK (starNo BETWEEN 1 AND 5),
    comment NVARCHAR(500) NULL, -- Đã sửa
    dateOfRating DATE NOT NULL,
    FOREIGN KEY (customerID) REFERENCES CUSTOMER(UserID),
    FOREIGN KEY (prodID) REFERENCES PRODUCT(prodID)
);
GO