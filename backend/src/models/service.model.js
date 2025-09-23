import sql from 'mssql'
import { getConnection } from '../lib/db.js'

export const Service = {
  // 1. Create (Tạo dịch vụ)
  async create({ ServiceName, Price, Descriptions, Type }) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('ServiceName', sql.NVarChar(100), ServiceName)
      .input('Price', sql.Decimal(15, 3), Price)
      .input('Descriptions', sql.NVarChar(200), Descriptions)
      .input('Type', sql.NVarChar(20), Type).query(`
							INSERT INTO ServiceMonthly (ServiceName, Price, Descriptions, Type)
							VALUES (@ServiceName, @Price, @Descriptions, @Type);
							SELECT SCOPE_IDENTITY() AS ServiceID;
      `)
    return result.recordset[0]
  },

  // 2. Read (Lấy tất cả dịch vụ)
  async getAll({ page = 1, limit = 10 }) {
    const pool = await getConnection()
    const offset = (page - 1) * limit
    const result = await pool
      .request()
      .input('Limit', sql.Int, limit)
      .input('Offset', sql.Int, offset).query(`
							-- Lấy danh sách dịch vụ với phân trang
							SELECT * FROM ServiceMonthly ORDER BY ServiceName ASC
							OFFSET @Offset ROWS
							FETCH NEXT @Limit ROWS ONLY;
							-- Đếm tổng số dịch vụ để tính tổng số trang
							SELECT COUNT(*) AS Total FROM ServiceMonthly;
    `)
    return {
      services: result.recordsets[0],
      totalCount: result.recordsets[1][0].Total,
    }
  },

  // 3. Update (Cập nhật thông tin)
  async update(id, { ServiceName, Price, Descriptions, Type }) {
    const pool = await getConnection()
    await pool
      .request()
      .input('ServiceID', sql.Int, id)
      .input('ServiceName', sql.NVarChar(100), ServiceName)
      .input('Price', sql.Decimal(15, 3), Price)
      .input('Descriptions', sql.NVarChar(200), Descriptions)
      .input('Type', sql.NVarChar(20), Type).query(`
							UPDATE ServiceMonthly
							SET ServiceName = @ServiceName, 
							Price = @Price, 
							Descriptions = @Descriptions,
							Type = @Type
							WHERE ServiceID = @ServiceID
      `)
    return true
  },
  // 4. Delete (Xóa dịch vụ)
  async delete(id) {
    const pool = await getConnection()
    try {
      await pool
        .request()
        .input('ServiceID', sql.Int, id)
        .query('DELETE FROM ServiceMonthly WHERE ServiceID = @ServiceID')
      return true
    } catch (error) {
      throw new Error('Cannot delete service:' + error.message)
    }
  },

  async findById(serviceId) {
    const pool = await getConnection()
    const result = await pool
      .request()
      .input('ServiceID', sql.Int, serviceId)
      .query(`SELECT * FROM ServiceMonthly WHERE ServiceID = @ServiceID`)
    return result.recordset[0]
  },

  // Lấy danh sách dịch vụ mà User ĐANG ĐĂNG KÝ (Cả phòng và cá nhân)
  async getUserServices(userID) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
        -- Dịch vụ cá nhân đăng ký
        SELECT s.*
        FROM ServiceMonthly s
        JOIN UserServices us ON s.ServiceID = us.ServiceID
        WHERE us.UserID = @UserID

        UNION ALL

        -- Dịch vụ của phòng mà User đang ở
        SELECT s.*
        FROM ServiceMonthly s
        JOIN RoomServices rs ON s.ServiceID = rs.ServiceID
        JOIN Users u ON u.RoomID = rs.RoomID
        WHERE u.UserID = @UserID
      `);
    return result.recordset;
  },

  // Admin thêm dịch vụ cho User
  async addServiceToUser(userID, serviceID) {
    const pool = await getConnection();
    await pool.request()
      .input("UserID", sql.Int, userID)
      .input("ServiceID", sql.Int, serviceID)
      .query(`
        INSERT INTO UserServices (UserID, ServiceID) VALUES (@UserID, @ServiceID)
      `);
    return { success: true };
  },

  // Admin xóa dịch vụ của User
  async removeServiceFromUser(userID, serviceID) {
    const pool = await getConnection();
    await pool.request()
      .input("UserID", sql.Int, userID)
      .input("ServiceID", sql.Int, serviceID)
      .query("DELETE FROM UserServices WHERE UserID = @UserID AND ServiceID = @ServiceID");
    return { success: true };
  }
}
