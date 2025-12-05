USE [BTL2];
GO
CREATE PROCEDURE sp_GetProductRevenueStatistic
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