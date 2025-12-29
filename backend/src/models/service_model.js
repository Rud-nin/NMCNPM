import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const Service = {
  // 1. Create (Tạo dịch vụ)
  async create({ ServiceName, Price, Descriptions }) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("ServiceName", sql.NVarChar(100), ServiceName)
      .input("Price", sql.Decimal(15, 3), Price)
      .input("Descriptions", sql.NVarChar(200), Descriptions)
      .query(`
        INSERT INTO ServiceMonthly (ServiceName, Price, Descriptions)
        VALUES (@ServiceName, @Price, @Descriptions);
        
        SELECT SCOPE_IDENTITY() AS ServiceID;
      `);
    return result.recordset[0];
  },

  // 2. Read (Lấy tất cả dịch vụ)
  async getAll() {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT * FROM ServiceMonthly ORDER BY ServiceName ASC
    `);
    return result.recordset;
  },

  // 3. Update (Cập nhật thông tin)
  async update(id, { ServiceName, Price, Descriptions }) {
    const pool = await getConnection();
    await pool
      .request()
      .input("ServiceID", sql.Int, id)
      .input("ServiceName", sql.NVarChar(100), ServiceName)
      .input("Price", sql.Decimal(15, 3), Price)
      .input("Descriptions", sql.NVarChar(200), Descriptions)
      .query(`
        UPDATE ServiceMonthly
        SET ServiceName = @ServiceName, 
            Price = @Price, 
            Descriptions = @Descriptions
        WHERE ServiceID = @ServiceID
      `);
    return true;
  },
    // 4. Delete (Xóa dịch vụ)
  async delete(id) {
    const pool = await getConnection();
    try {
        await pool.request()
          .input("ServiceID", sql.Int, id)
          .query("DELETE FROM ServiceMonthly WHERE ServiceID = @ServiceID");
        return true;
    } catch (error) {
        throw new Error("Cannot delete service:" + error.message);
    }
  }
};