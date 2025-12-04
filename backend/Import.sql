USE [BTL2];
GO

/* ===========================
   2. NHẬP DỮ LIỆU MẪU
   =========================== */

/* ---- 2.1 Insert users ---- */
SET IDENTITY_INSERT [USER] ON;
INSERT INTO [USER](UserID, username, email, password, phoneNo, fullName, firstName, lastName, district, province, numAndStreet)
VALUES
(1,'alice','alice@example.com','pass1234','0912345678','Alice Nguyen','Alice','Nguyen','District 1','HCMC','12 Le Loi'),
(2,'bob','bob@example.com','password1','0987654321','Bob Tran','Bob','Tran','District 3','HCMC','34 Nguyen Trai'),
(3,'carol','carol@example.com','carolpw','0123456789','Carol Pham','Carol','Pham','District 7','HCMC','56 Vo Van Kiet'),
(4,'david','david@example.com','dav!dPW','0911223344','David Le','David','Le','District 2','HCMC','78 Pasteur'),
(5,'eve','eve@example.com','evepass6','0900111222','Eve Ho','Eve','Ho','District 5','HCMC','90 Nguyen Hue'),
(6,'emp_john','john.emp@example.com','empjohn1','0900222333','John Employee','John','Employee','District 1','HCMC','1 Employee St'),
(7,'emp_sara','sara.emp@example.com','empsara1','0900333444','Sara Employee','Sara','Employee','District 1','HCMC','2 Employee St'),
(8,'cust_mike','mike.cust@example.com','mikepw1','0900444555','Mike Customer','Mike','Customer','District 4','HCMC','3 Customer Rd'),
(9,'sup_anne','anne.supplier@example.com','annepw1','0900555666','Anne Supplier','Anne','Supplier','District 6','HCMC','4 Supplier Ave'),
(10,'carrier_tnt','tnt.carrier@example.com','tntpw1','0900666777','TNT Carrier','TNT','Carrier','District 9','HCMC','5 Carrier Blvd');
SET IDENTITY_INSERT [USER] OFF;
GO

/* ---- 2.2 Insert CUSTOMER (use some of users above) ---- */
INSERT INTO CUSTOMER(UserID, loyaltyPoint) VALUES
(1, 120),
(2, 45),
(3, 200),
(8, 10),
(5, 0);
GO

/* ---- 2.3 Insert EMPLOYEE ---- */
INSERT INTO EMPLOYEE(UserID, role) VALUES
(6, 'Sales'),
(7, 'Manager'),
(4, 'Support'),
(10, 'Logistics'),
(9, 'Procurement');
GO

/* ---- 2.4 Insert CATALOGLIST ---- */
SET IDENTITY_INSERT CATALOGLIST ON;
INSERT INTO CATALOGLIST(catalogID, catalogName, parentCatalogID) VALUES
(1,'Electronics', NULL),
(2,'Phones', 1),
(3,'Laptops', 1),
(4,'Home Appliances', NULL),
(5,'Kitchen',4);
SET IDENTITY_INSERT CATALOGLIST OFF;
GO

/* ---- 2.5 Insert PRODUCT ---- */
SET IDENTITY_INSERT PRODUCT ON;
INSERT INTO PRODUCT(prodID, catalogID, name, description, placeOfProduction, origin) VALUES
(1,2,'Smartphone X', 'Flagship smartphone X', 'Factory A', 'Vietnam'),
(2,2,'Smartphone Y', 'Mid-range smartphone Y', 'Factory B', 'Vietnam'),
(3,3,'Laptop Pro', 'High-end laptop', 'Factory C', 'China'),
(4,5,'Blender 3000', 'Kitchen blender', 'Factory D', 'Vietnam'),
(5,4,'Vacuum Cleaner V1', 'Compact vacuum', 'Factory E', 'Japan');
SET IDENTITY_INSERT PRODUCT OFF;
GO

/* ---- 2.6 Insert VARIETY (prodID, color, unitOfMeasure) ---- */
INSERT INTO VARIETY(prodID, color, stockAmount, unitOfMeasure, listedPrice) VALUES
(1,'Black', 25, 'pcs', 799.00), 
(1,'White', 25, 'pcs', 799.00),
(2,'Blue', 60, 'pcs', 499.00),  
(2,'Black', 60, 'pcs', 499.00),
(3,'Gray', 15, 'pcs', 1299.00), 
(3,'Silver', 15, 'pcs', 1299.00),
(4,'Red', 40, 'pcs', 89.50),   
(4,'Black', 40, 'pcs', 89.50),
(5,'White', 20, 'pcs', 159.99),
(5,'Gray', 20, 'pcs', 159.99);
GO

/* ---- 2.7 Insert SUPPLIER ---- */
SET IDENTITY_INSERT SUPPLIER ON;
INSERT INTO SUPPLIER(supplierID, origin, description) VALUES
(1,'China','Main electronics supplier'),
(2,'Vietnam','Local kitchen appliances supplier'),
(3,'Japan','Premium appliances'),
(4,'China','Laptop supplier'),
(5,'Vietnam','Accessories supplier');
SET IDENTITY_INSERT SUPPLIER OFF;
GO

/* ---- 2.8 Insert PROVIDE (supplier supplies product) ---- */
INSERT INTO PROVIDE(supplierID, prodID) VALUES
(1,1),
(1,2),
(4,3),
(2,4),
(3,5);
GO

/* ---- 2.9 Insert CARRIER ---- */
SET IDENTITY_INSERT CARRIER ON;
INSERT INTO CARRIER(carrierID, name, phone) VALUES
(1,'FastShip','0911000111'),
(2,'QuickMove','0911000222'),
(3,'VietCarrier','0911000333'),
(4,'TNT Express','0911000444'),
(5,'LocalShip','0911000555');
SET IDENTITY_INSERT CARRIER OFF;
GO

/* ---- 2.10 Insert CART ---- */
SET IDENTITY_INSERT CART ON;
INSERT INTO CART(CartID, cartState, UserID) VALUES
(1,'Active',1),
(2,'Active',2),
(3,'Ordered',3),
(4,'Expired',8),
(5,'Active',5);
SET IDENTITY_INSERT CART OFF;
GO

/* ---- 2.11 Insert CARTITEM ---- */
INSERT INTO CARTITEM(CartID, quantity, ordinalNumber, color, unitOfMeasure, prodID) VALUES
(1,1,1,'Black','pcs',1),
(1,2,2,'White','pcs',1),
(2,1,1,'Blue','pcs',2),
(3,1,1,'Gray','pcs',3),
(5,3,1,'Red','pcs',4);
GO

/* ---- 2.12 Insert COUPON ---- */
SET IDENTITY_INSERT COUPON ON;
INSERT INTO COUPON(CouponID, employeeID, description, discountPercent, discountedPrice, startDate, endDate) VALUES
(1,7,'New Year Promo', 10, NULL, '2025-01-01','2025-01-31'), -- Giảm theo %
(2,7,'Manager Special', NULL, 50.00, '2025-03-01','2025-03-31'), -- Giảm tiền trực tiếp
(3,6,'Employee Discount', 15, NULL, '2025-02-01','2025-02-28'), -- Giảm theo %
(4,9,'Supplier Deal', NULL, 20.00, '2025-04-01','2025-04-30'), -- Giảm tiền trực tiếp
(5,7,'Flash Sale', 5, NULL, '2025-06-01','2025-06-03'); -- Giảm theo %
SET IDENTITY_INSERT COUPON OFF;
GO

/* ---- 2.13 Insert ORDER ---- */
SET IDENTITY_INSERT [ORDER] ON;
INSERT INTO [ORDER](OrderID, customerID, employeeID, couponID, orderDate, finalPrice, stateOfOrder, addrToShip) VALUES
(1,1,6,1,'2025-01-02',719.10,'Delivered','12 Le Loi, District 1, HCMC'),
(2,2,6,NULL,'2025-02-15',499.00,'Processing','34 Nguyen Trai, District 3, HCMC'),
(3,3,7,3,'2025-02-10',1104.15,'Shipped','56 Vo Van Kiet, District 7, HCMC'),
(4,5,4,NULL,'2025-03-05',179.50,'New','90 Nguyen Hue, District 5, HCMC'),
(5,1,7,2,'2025-03-10',449.00,'Cancelled','12 Le Loi, District 1, HCMC');
SET IDENTITY_INSERT [ORDER] OFF;
GO

/* ---- 2.14 Insert ORDERITEM ---- */
INSERT INTO ORDERITEM(OrderID, color, unitOfMeasure, prodID, ordinalNo, quantity, fullPrice, priceInOrderDate) VALUES
(1,'Black','pcs',1,1,1,799.00,719.10),
(2,'Blue','pcs',2,1,1,499.00,499.00),
(3,'Gray','pcs',3,1,1,1299.00,1104.15),
(4,'Red','pcs',4,1,2,89.50,179.00),
(5,'White','pcs',1,1,1,799.00,449.00);
GO

/* ---- 2.15 Insert PAYMENT ---- */
SET IDENTITY_INSERT PAYMENT ON;
INSERT INTO PAYMENT(TransID, OrderID, provider, paymentMethod, paidAmount, status) VALUES
(1,1,'PayGate','CreditCard',719.10,'Completed'),
(2,2,'PayGate','COD',0,'Pending'),
(3,3,'Bank','BankTransfer',1104.15,'Completed'),
(4,4,'PayGate','CreditCard',179.50,'Completed'),
(5,5,'PayGate','CreditCard',0,'Failed');
SET IDENTITY_INSERT PAYMENT OFF;
GO

/* ---- 2.16 Insert SHIPMENT ---- */
SET IDENTITY_INSERT SHIPMENT ON;
INSERT INTO SHIPMENT(ShipmentID, price, plannedDate, shipState, carrierID, OrderID) VALUES
(1,10.00,'2025-01-03','Delivered',1,1),
(2,12.50,'2025-02-16','InTransit',2,2),
(3,15.00,'2025-02-11','InTransit',3,3),
(4,8.50,'2025-03-06','Prepared',4,4),
(5,9.00,'2025-03-11','Returned',5,5);
SET IDENTITY_INSERT SHIPMENT OFF;
GO

/* ---- 2.17 Insert MANAGE (employee manages product) ---- */
INSERT INTO MANAGE(employeeID, prodID) VALUES
(6,1),
(7,3),
(9,4),
(6,2),
(7,5);
GO

/* ---- 2.18 Insert RATING ---- */
INSERT INTO RATING(customerID, prodID, starNo, comment, dateOfRating) VALUES
(1,1,5,'Excellent phone', '2025-01-10'),
(2,2,4,'Good value for money', '2025-02-20'),
(3,3,5,'Great laptop', '2025-02-15'),
(5,4,3,'Works fine', '2025-03-10'),
(1,5,4,'Pretty good', '2025-03-12');
GO
