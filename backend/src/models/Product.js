import { sql } from "../config/database.js";

class Product {
  static async getAllVarieties(keyword, minPrice, maxPrice) {
    const request = new sql.Request();

    request.input("Keyword", sql.NVarChar, keyword || null);

    // Nếu có giá trị thì truyền, không thì null
    request.input(
      "MinPrice",
      sql.Decimal(12, 2),
      minPrice ? parseFloat(minPrice) : null
    );
    request.input(
      "MaxPrice",
      sql.Decimal(12, 2),
      maxPrice ? parseFloat(maxPrice) : null
    );

    const result = await request.execute("SP_GetProductVarieties");
    return result.recordset;
  }

  static async getBestSellers() {
    const request = new sql.Request();
    const result = await request.execute("SP_GetBestSellers");
    return result.recordset;
  }
}

export default Product;
