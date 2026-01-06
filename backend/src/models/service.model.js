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

  // Lấy Service của user kèm theo thông tin Hóa đơn (Period, Status)
  async getUserServices(userID) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("UserID", sql.Int, userID)
      .query(`
        -- Lấy dịch vụ cá nhân kèm Bill của tháng hiện tại
        SELECT s.*, mb.Period, mb.Status
        FROM ServiceMonthly s
        JOIN UserServices us ON s.ServiceID = us.ServiceID
        LEFT JOIN MonthlyBills mb ON (s.ServiceID = mb.ServiceID AND mb.UserID = @UserID)
        WHERE us.UserID = @UserID 
          AND mb.Period = FORMAT(GETDATE(), 'MM/yy')

        UNION ALL

        -- Lấy dịch vụ của phòng kèm Bill tháng hiện tại
        SELECT s.*, mb.Period, mb.Status
        FROM ServiceMonthly s
        JOIN RoomServices rs ON s.ServiceID = rs.ServiceID
        JOIN Users u ON u.RoomID = rs.RoomID
        LEFT JOIN MonthlyBills mb ON (s.ServiceID = mb.ServiceID AND mb.RoomID = u.RoomID)
        WHERE u.UserID = @UserID
          AND mb.Period = FORMAT(GETDATE(), 'MM/yy')
      `);
    return result.recordset;
  },

  // Thêm service và tự động tạo Bill cho tháng hiện tại
  async addServiceToUser(userID, serviceID) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Thêm vào bảng danh mục dịch vụ đang sử dụng
      await transaction.request()
        .input("UserID", sql.Int, userID)
        .input("ServiceID", sql.Int, serviceID)
        .query(`
          INSERT INTO UserServices (UserID, ServiceID) VALUES (@UserID, @ServiceID)
        `);

      // Thêm ngay Bill cho tháng hiện tại (Sử dụng DEFAULT Period MM/yy)
      await transaction.request()
        .input("UserID", sql.Int, userID)
        .input("ServiceID", sql.Int, serviceID)
        .query(`
          IF NOT EXISTS (
            SELECT 1 FROM MonthlyBills 
            WHERE UserID = @UserID AND ServiceID = @ServiceID AND Period = FORMAT(GETDATE(), 'MM/yy')
          )
          INSERT INTO MonthlyBills (UserID, ServiceID, Status) 
          VALUES (@UserID, @ServiceID, 'Unpaid')
        `);

      await transaction.commit();
      return { success: true };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  // Admin xóa dịch vụ của User
  async removeServiceFromUser(userID, serviceID) {
    const pool = await getConnection();
    await pool.request()
      .input("UserID", sql.Int, userID)
      .input("ServiceID", sql.Int, serviceID)
      .query("DELETE FROM UserServices WHERE UserID = @UserID AND ServiceID = @ServiceID");
    return { success: true };
  },

  // Lấy Service của room kèm theo thông tin Hóa đơn (Period, Status)
  async getRoomServices(roomID) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("RoomID", sql.Int, roomID)
      .query(`
        -- Lấy dịch vụ cá nhân kèm Bill của tháng hiện tại
        SELECT s.*, mb.Period, mb.Status
        FROM ServiceMonthly s
        JOIN RoomServices rs ON s.ServiceID = rs.ServiceID
        LEFT JOIN MonthlyBills mb ON (s.ServiceID = mb.ServiceID AND mb.RoomID = @RoomID)
        WHERE rs.RoomID = @RoomID 
          AND mb.Period = FORMAT(GETDATE(), 'MM/yy')
      `);
    return result.recordset;
  },

  // Thêm service và tự động tạo Bill cho tháng hiện tại
  async addServiceToRoom(roomID, serviceID) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // Thêm vào bảng danh mục dịch vụ đang sử dụng
      await transaction.request()
        .input("RoomID", sql.Int, roomID)
        .input("ServiceID", sql.Int, serviceID)
        .query(`
          INSERT INTO RoomServices (RoomID, ServiceID) VALUES (@RoomID, @ServiceID)
        `);

      // Thêm ngay Bill cho tháng hiện tại (Sử dụng DEFAULT Period MM/yy)
      await transaction.request()
        .input("RoomID", sql.Int, roomID)
        .input("ServiceID", sql.Int, serviceID)
        .query(`
          IF NOT EXISTS (
            SELECT 1 FROM MonthlyBills 
            WHERE RoomID = @RoomID AND ServiceID = @ServiceID AND Period = FORMAT(GETDATE(), 'MM/yy')
          )
          INSERT INTO MonthlyBills (RoomID, ServiceID, Status) 
          VALUES (@RoomID, @ServiceID, 'Unpaid')
        `);

      await transaction.commit();
      return { success: true };
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  // Admin xóa dịch vụ của User
  async removeServiceFromRoom(roomID, serviceID) {
    const pool = await getConnection();
    await pool.request()
      .input("RoomID", sql.Int, roomID)
      .input("ServiceID", sql.Int, serviceID)
      .query("DELETE FROM RoomServices WHERE RoomID = @RoomID AND ServiceID = @ServiceID");
    return { success: true };
  }
}
