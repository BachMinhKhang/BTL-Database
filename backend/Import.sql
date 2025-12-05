USE [BTL2];
GO

/* ===========================
   2. NHẬP DỮ LIỆU MẪU (VĂN PHÒNG PHẨM - STATIONERY)
   =========================== */

/* ---- 2.1 Insert USERS (Giữ nguyên logic Họ + Tên) ---- */
SET IDENTITY_INSERT [USER] ON;
INSERT INTO [USER](UserID, username, email, password, phoneNo, fullName, firstName, lastName, district, province, numAndStreet)
VALUES
-- KHÁCH HÀNG
(1,'khach_tung','tung.nguyen@gmail.com','pass123','0912345678',N'Nguyễn Thanh Tùng',N'Tùng',N'Nguyễn Thanh',N'Quận 1',N'TP.HCM',N'12 Lê Lợi'),
(2,'khach_hoa','hoa.tran@gmail.com','pass123','0987654321',N'Trần Thị Hoa',N'Hoa',N'Trần Thị',N'Quận 3',N'TP.HCM',N'34 Nguyễn Trãi'),
(3,'khach_binh','binh.le@gmail.com','pass123','0909123123',N'Lê Văn Bình',N'Bình',N'Lê Văn',N'Quận 7',N'TP.HCM',N'56 Võ Văn Kiệt'),
(4,'khach_lan','lan.pham@gmail.com','pass123','0911223344',N'Phạm Ngọc Lan',N'Lan',N'Phạm Ngọc',N'Quận 2',N'TP.HCM',N'78 Thảo Điền'),
(5,'khach_cuong','cuong.hoang@gmail.com','pass123','0900111222',N'Hoàng Quốc Cường',N'Cường',N'Hoàng Quốc',N'Quận 5',N'TP.HCM',N'90 Nguyễn Chí Thanh'),

-- NHÂN VIÊN
(6,'nv_banhang','sales@shop.com','staff123','0900222333',N'Phan Văn Sales',N'Sales',N'Phan Văn',N'Quận 1',N'TP.HCM',N'Văn phòng Cty'),
(7,'nv_quanly','manager@shop.com','manager123','0900333444',N'Lý Giám Đốc',N'Đốc',N'Lý Giám',N'Quận 1',N'TP.HCM',N'Văn phòng Cty'),
(8,'nv_kho','stock@shop.com','staff123','0900444555',N'Trương Thủ Kho',N'Kho',N'Trương Thủ',N'Thủ Đức',N'TP.HCM',N'Kho tổng'),
(9,'nv_marketing','mkt@shop.com','staff123','0900999888',N'Vũ Marketing',N'Marketing',N'Vũ',N'Quận 3',N'TP.HCM',N'Team MKT'),
(10,'nv_it','it@shop.com','staff123','0900555666',N'Nguyễn Công IT',N'IT',N'Nguyễn Công',N'Cầu Giấy',N'TP.HCM',N'Phòng IT');

SET IDENTITY_INSERT [USER] OFF;
GO

/* ---- 2.2 Insert CUSTOMER ---- */
INSERT INTO CUSTOMER(UserID, loyaltyPoint) VALUES (1, 150), (2, 50), (3, 300), (4, 0), (5, 20);
GO

/* ---- 2.3 Insert EMPLOYEE ---- */
INSERT INTO EMPLOYEE(UserID, role) VALUES (6, 'Sales'), (7, 'Manager'), (8, 'Logistics'), (9, 'Marketing'), (10, 'IT');
GO

/* ---- 2.4 Insert CATALOGLIST (Danh mục VPP) ---- */
SET IDENTITY_INSERT CATALOGLIST ON;
INSERT INTO CATALOGLIST(catalogID, catalogName, parentCatalogID) VALUES
(1, N'Dụng cụ viết', NULL),
(2, N'Bút bi / Bút máy', 1),
(3, N'Bút chì / Gôm tẩy', 1),
(4, N'Giấy văn phòng', NULL),
(5, N'Sổ tay / Vở', 4),
(6, N'Dụng cụ văn phòng', NULL),
(7, N'Máy tính bỏ túi', 6),
(8, N'File hồ sơ', 6);
SET IDENTITY_INSERT CATALOGLIST OFF;
GO

/* ---- 2.5 Insert PRODUCT (10 Sản phẩm VPP) ---- */
SET IDENTITY_INSERT PRODUCT ON;
INSERT INTO PRODUCT(prodID, catalogID, name, description, placeOfProduction, origin) VALUES
(1, 2, N'Bút bi Thiên Long TL-027', N'Bút bi đầu nhỏ, mực đều', N'Việt Nam', N'Việt Nam'),
(2, 4, N'Giấy A4 Double A', N'Giấy trắng cao cấp, không kẹt giấy', N'Thái Lan', N'Thái Lan'),
(3, 7, N'Máy tính Casio FX-580VN X', N'Máy tính khoa học cho học sinh, sinh viên', N'Thái Lan', N'Nhật Bản'),
(4, 8, N'Bìa còng KingJim 7cm', N'Bìa lưu trữ hồ sơ khổ F4', N'Việt Nam', N'Nhật Bản'),
(5, 5, N'Sổ tay bìa da cao cấp', N'Sổ ghi chép A5, giấy ngà chống lóa', N'Trung Quốc', N'Trung Quốc'),
(6, 6, N'Dập ghim Max số 10', N'Bấm kim trợ lực, bền bỉ', N'Nhật Bản', N'Nhật Bản'),
(7, 2, N'Bút nhớ dòng Thiên Long', N'Màu dạ quang tươi sáng', N'Việt Nam', N'Việt Nam'),
(8, 6, N'Kéo văn phòng Deli', N'Lưỡi thép không gỉ, cán nhựa êm', N'Trung Quốc', N'Trung Quốc'),
(9, 6, N'Băng keo trong 5cm', N'Băng dính dán thùng carton', N'Việt Nam', N'Việt Nam'),
(10, 3, N'Hộp bút chì gỗ 2B', N'Hộp 12 cây, chì mềm dễ gọt', N'Đức', N'Đức');
SET IDENTITY_INSERT PRODUCT OFF;
GO

/* ---- 2.6 Insert VARIETY (Biến thể & Ảnh VPP) ---- */
INSERT INTO VARIETY(prodID, color, stockAmount, unitOfMeasure, listedPrice, imageUrl) VALUES
-- 1. Bút bi Thiên Long
(1, N'Xanh', 500, N'Cây', 4500, 'https://product.hstatic.net/1000362139/product/tl027-1_e39ce07875ac438e97d6031db30846ae.png'),
(1, N'Đen', 300, N'Cây', 4500, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/299/021/products/8935001804628.jpg?v=1742459720600'),
(1, N'Đỏ', 200, N'Cây', 4500, 'https://product.hstatic.net/1000362139/product/tl027-1_e39ce07875ac438e97d6031db30846ae.png'),

-- 2. Giấy Double A
(2, N'Trắng (70gsm)', 200, N'Ram', 85000, 'https://anlocviet.vn/upload/product/giay-1673.png'),
(2, N'Trắng (80gsm)', 150, N'Ram', 105000, 'https://anlocviet.vn/upload/product/giay-1673.png'),

-- 3. Máy tính Casio
(3, N'Đen', 50, N'Cái', 750000, 'https://product.hstatic.net/1000330808/product/fx-580vn_x_8db3e3ef4f2046bb82fc0abc3ca40075.png'),
(3, N'Hồng', 20, N'Cái', 780000, 'https://cdn1.fahasa.com/media/catalog/product/4/5/4549526611483.jpg'),

-- 4. Bìa còng
(4, N'Xanh dương', 100, N'Cái', 65000, 'https://bizweb.dktcdn.net/100/299/021/products/6921734960108-9599a27d-21da-45ee-bf46-b2819bc850a7.jpg?v=1742442329410'),

-- 5. Sổ tay
(5, N'Nâu', 60, N'Cuốn', 45000, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/299/021/products/8935001804628.jpg?v=1742459720600'),

-- 6. Dập ghim
(6, N'Xanh', 80, N'Cái', 55000, 'https://bizweb.dktcdn.net/100/299/021/products/6921734960108-9599a27d-21da-45ee-bf46-b2819bc850a7.jpg?v=1742442329410'),

-- 7. Bút nhớ dòng
(7, N'Vàng', 200, N'Cây', 8000, 'https://bizweb.dktcdn.net/100/567/082/products/but-da-quang-thien-long-hl-03-9.jpg?v=1746856308997'),
(7, N'Cam', 100, N'Cây', 8000, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/567/082/products/but-da-quang-thien-long-hl-03-cam-vi-5-cay-202111051508061983.jpg?v=1746856308600'),

-- 8. Kéo
(8, N'Đen/Đỏ', 90, N'Cái', 25000, 'https://bizweb.dktcdn.net/100/299/021/products/6921734960108-9599a27d-21da-45ee-bf46-b2819bc850a7.jpg?v=1742442329410'),

-- 9. Băng keo
(9, N'Trong', 300, N'Cuộn', 15000, 'https://bizweb.dktcdn.net/100/299/021/products/6921734960108-9599a27d-21da-45ee-bf46-b2819bc850a7.jpg?v=1742442329410'),

-- 10. Bút chì
(10, N'Vàng', 100, N'Hộp', 35000, 'https://bizweb.dktcdn.net/thumb/1024x1024/100/299/021/products/8935001804628.jpg?v=1742459720600');
GO


/* ---- 2.7 Insert SUPPLIER (NCC VPP) ---- */
SET IDENTITY_INSERT SUPPLIER ON;
INSERT INTO SUPPLIER(supplierID, origin, description) VALUES
(1, N'Việt Nam', N'Tập đoàn Thiên Long'),
(2, N'Thái Lan', N'Giấy Double A'),
(3, N'Nhật Bản', N'Casio Japan'),
(4, N'Trung Quốc', N'Deli Stationery'),
(5, N'Nhật Bản', N'KingJim Việt Nam');
SET IDENTITY_INSERT SUPPLIER OFF;
GO

/* ---- 2.8 Insert PROVIDE ---- */
INSERT INTO PROVIDE(supplierID, prodID) VALUES
(1,1), (1,7), -- Thiên Long cung cấp bút bi, bút nhớ
(2,2), -- Double A cung cấp giấy
(3,3), (3,6), -- Nhật Bản cung cấp Casio, Max
(5,4), -- KingJim cung cấp bìa còng
(4,5), (4,8); -- Deli cung cấp sổ, kéo
GO

/* ---- 2.9 Insert CARRIER (Giữ nguyên) ---- */
SET IDENTITY_INSERT CARRIER ON;
INSERT INTO CARRIER(carrierID, name, phone) VALUES
(1, N'Giao Hàng Nhanh', '0911000111'),
(2, N'Giao Hàng Tiết Kiệm', '0911000222'),
(3, N'Viettel Post', '0911000333'),
(4, N'AhaMove', '0911000444'),
(5, N'GrabExpress', '0911000555');
SET IDENTITY_INSERT CARRIER OFF;
GO

/* ---- 2.10 Insert CART ---- */
SET IDENTITY_INSERT CART ON;
INSERT INTO CART(CartID, cartState, UserID) VALUES
(1, 'Active', 1), (2, 'Active', 2), (3, 'Ordered', 3), (4, 'Expired', 4), (5, 'Active', 5);
SET IDENTITY_INSERT CART OFF;
GO

/* ---- 2.11 Insert CARTITEM (Sửa lại cho khớp ID sản phẩm mới) ---- */
INSERT INTO CARTITEM(CartID, quantity, ordinalNumber, color, unitOfMeasure, prodID) VALUES
(1, 10, 1, N'Xanh', N'Cây', 1),         -- Tùng mua 10 cây bút bi
(1, 2, 2, N'Trắng (70gsm)', N'Ram', 2), -- Tùng mua 2 ram giấy
(2, 1, 1, N'Đen', N'Cái', 3),           -- Hoa mua 1 máy tính Casio
(2, 5, 2, N'Vàng', N'Hộp', 10),         -- Hoa mua 5 hộp bút chì
(5, 3, 1, N'Xanh dương', N'Cái', 4);    -- Cường mua 3 bìa còng
GO

/* ---- 2.12 Insert COUPON (Giữ nguyên logic) ---- */
SET IDENTITY_INSERT COUPON ON;
INSERT INTO COUPON(CouponID, employeeID, description, discountPercent, discountedPrice, startDate, endDate) VALUES
(1, 9, N'Mừng Xuân 2025 - Giảm 10%', 10, NULL, '2025-01-01','2025-01-31'),
(2, 7, N'Giảm 50k cho đơn từ 500k', NULL, 50000, '2025-03-01','2025-03-31'),
(3, 9, N'Back to School', 15, NULL, '2025-08-01','2025-09-05'),
(4, 9, N'Xả kho cuối năm', 20, NULL, '2025-12-01','2025-12-31'),
(5, 7, N'Khách hàng thân thiết', NULL, 20000, '2025-01-01','2025-12-31');
SET IDENTITY_INSERT COUPON OFF;
GO

/* ---- 2.13 Insert ORDER ---- */
SET IDENTITY_INSERT [ORDER] ON;
INSERT INTO [ORDER](OrderID, customerID, employeeID, couponID, orderDate, finalPrice, stateOfOrder, addrToShip) VALUES
-- Tháng 1
(1, 1, 6, 1, '2025-01-15', 765000, 'Delivered', N'12 Lê Lợi, Q1'), -- Đơn VPP lớn cho Cty
(2, 2, 6, NULL, '2025-01-20', 85000, 'Delivered', N'34 Nguyễn Trãi, Q3'), -- Mua lẻ giấy
-- Tháng 2
(3, 3, 6, NULL, '2025-02-10', 750000, 'Delivered', N'56 Võ Văn Kiệt, Q7'), -- Mua máy tính Casio
(4, 1, 6, NULL, '2025-02-14', 450000, 'Delivered', N'12 Lê Lợi, Q1'), -- Mua thêm sổ tay
-- Tháng 3
(5, 2, 6, 2, '2025-03-05', 1200000, 'Shipped', N'34 Nguyễn Trãi, Q3'), -- Đơn sỉ giấy cho văn phòng
(6, 4, 6, 3, '2025-03-03', 42500, 'Processing', N'78 Thảo Điền, Q2'), -- Mua bút bi
(7, 5, 6, NULL, '2025-03-10', 130000, 'New', N'90 NCT, Q5'), -- Mua bìa hồ sơ
-- Tháng 4
(8, 1, 6, 4, '2025-04-02', 150000, 'New', N'12 Lê Lợi, Q1'), -- Mua băng keo
(9, 3, 6, NULL, '2025-04-05', 85000, 'Cancelled', N'56 VVK, Q7'), -- Hủy đơn giấy
(10, 2, 6, NULL, '2025-04-10', 50000, 'New', N'34 NT, Q3'); -- Mua kéo
SET IDENTITY_INSERT [ORDER] OFF;
GO

/* ---- 2.14 Insert ORDERITEM ---- */
INSERT INTO ORDERITEM(OrderID, color, unitOfMeasure, prodID, ordinalNo, quantity, fullPrice, priceInOrderDate) VALUES
(1, N'Trắng (70gsm)', N'Ram', 2, 1, 10, 850000, 765000),    -- 10 Ram giấy (Giảm 10%)
(2, N'Trắng (70gsm)', N'Ram', 2, 1, 1, 85000, 85000),       -- 1 Ram giấy
(3, N'Đen', N'Cái', 3, 1, 1, 750000, 750000),               -- 1 Máy tính
(4, N'Nâu', N'Cuốn', 5, 1, 10, 450000, 450000),             -- 10 Cuốn sổ
(5, N'Trắng (80gsm)', N'Ram', 2, 1, 10, 1050000, 1000000),  -- 10 Ram giấy xịn
(5, N'Xanh', N'Cây', 1, 2, 50, 225000, 200000),             -- 50 Bút bi
(6, N'Đỏ', N'Cây', 1, 1, 10, 45000, 42500),                 -- 10 Bút đỏ
(7, N'Xanh dương', N'Cái', 4, 1, 2, 130000, 130000),        -- 2 Bìa còng
(8, N'Trong', N'Cuộn', 9, 1, 10, 150000, 150000),           -- 10 Băng keo
(9, N'Trắng (70gsm)', N'Ram', 2, 1, 1, 85000, 85000),       -- 1 Ram giấy (Hủy)
(10, N'Đen/Đỏ', N'Cái', 8, 1, 2, 50000, 50000);             -- 2 Cây kéo
GO

/* ---- 2.15 Insert PAYMENT ---- */
SET IDENTITY_INSERT PAYMENT ON;
INSERT INTO PAYMENT(TransID, OrderID, provider, paymentMethod, paidAmount, status) VALUES
(1, 1, N'Bank', N'Transfer', 765000, 'Completed'),
(2, 2, N'Cash', N'COD', 85000, 'Completed'),
(3, 3, N'Momo', N'Wallet', 750000, 'Completed'),
(4, 4, N'Cash', N'COD', 450000, 'Completed'),
(5, 5, N'Bank', N'Transfer', 1200000, 'Pending'),
(6, 6, N'Momo', N'Wallet', 42500, 'Pending'),
(7, 7, N'Cash', N'COD', 130000, 'Pending'),
(8, 8, N'Cash', N'COD', 150000, 'Completed'),
(9, 9, N'Momo', N'Wallet', 0, 'Failed'),
(10, 10, N'Cash', N'COD', 0, 'Pending');
SET IDENTITY_INSERT PAYMENT OFF;
GO

/* ---- 2.16 Insert SHIPMENT ---- */
SET IDENTITY_INSERT SHIPMENT ON;
INSERT INTO SHIPMENT(ShipmentID, price, plannedDate, shipState, carrierID, OrderID) VALUES
(1, 30000, '2025-01-16', 'Delivered', 1, 1),
(2, 15000, '2025-01-21', 'Delivered', 2, 2),
(3, 20000, '2025-02-12', 'Delivered', 3, 3),
(4, 15000, '2025-02-15', 'Delivered', 1, 4),
(5, 50000, '2025-03-07', 'InTransit', 4, 5),
(6, 15000, '2025-03-05', 'Prepared', 2, 6),
(7, 15000, '2025-03-12', 'Prepared', 1, 7),
(8, 15000, '2025-04-03', 'Prepared', 1, 8),
(9, 15000, '2025-04-06', 'Returned', 3, 9),
(10, 15000, '2025-04-12', 'Prepared', 2, 10);
SET IDENTITY_INSERT SHIPMENT OFF;
GO

/* ---- 2.17 Insert MANAGE ---- */
INSERT INTO MANAGE(employeeID, prodID) VALUES
(6, 1), (6, 2), (6, 3), -- Sales quản lý bút, giấy, máy tính
(8, 4), (8, 9),         -- Kho quản lý bìa, băng keo
(7, 3), (7, 5);         -- Manager quản hàng giá trị (máy tính, sổ da)
GO

/* ---- 2.18 Insert RATING ---- */
INSERT INTO RATING(customerID, prodID, starNo, comment, dateOfRating) VALUES
(1, 1, 5, N'Bút viết rất êm, mực đều', '2025-01-20'),
(2, 2, 5, N'Giấy trắng, in không bị kẹt', '2025-01-25'),
(3, 3, 5, N'Máy tính xịn, bấm nhanh', '2025-02-15'),
(4, 6, 4, N'Dập ghim hơi cứng tay chút', '2025-03-10'),
(1, 5, 5, N'Sổ da đẹp, giấy tốt', '2025-03-15');
GO