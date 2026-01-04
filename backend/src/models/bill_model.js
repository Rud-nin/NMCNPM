import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const Bill = {
  async create({ userId, serviceId, roomId, period }) {
    const pool = await getConnection();
    const serviceResult = await pool.request()
        .input("ServiceID", sql.Int, serviceId)
        .query("SELECT Price FROM ServiceMonthly WHERE ServiceID = @ServiceID");
        
    if (serviceResult.recordset.length === 0) {
            throw new Error("Dịch vụ không tồn tại");
        }
    const finalAmount = serviceResult.recordset[0].Price;
    

    const result = await pool.request()
      .input("UserID", sql.Int, userId || null) // Có thể null nếu là bill phòng
      .input("RoomID", sql.Int, roomId || null) // Có thể null nếu là bill cá nhân
      .input("ServiceID", sql.Int, serviceId)
      .input("Period", sql.NVarChar(20), period) // VD: "12/2025"
      .query(`
        INSERT INTO MonthlyBills (UserID, RoomID, ServiceID, Period,  Status)
        VALUES (@UserID, @RoomID, @ServiceID, @Period, 'Unpaid');
        
        SELECT SCOPE_IDENTITY() AS BillID;
      `);
      
    return result.recordset[0];
  },

  //Lấy danh sách Bill của 1 User (để Admin xem quản lý)
  async getByUserId(userId) {
    const pool = await getConnection();
    const result = await pool.request()
        .input("UserID", sql.Int, userId)
        .query(`
            SELECT B.*, S.ServiceName 
            FROM MonthlyBills B
            JOIN ServiceMonthly S ON B.ServiceID = S.ServiceID
            WHERE B.UserID = @UserID
            ORDER BY B.Period DESC
        `);
    return result.recordset;
  },

  // Xóa dịch vụ (Xóa Bill)
  async delete(billId) {
    const pool = await getConnection();
    
    // Check trạng thái trước khi xóa
    const check = await pool.request()
        .input("BillID", sql.Int, billId)
        .query("SELECT Status FROM MonthlyBills WHERE BillID = @BillID");
    
    if (check.recordset.length === 0) return null;
    
    if (check.recordset[0].Status === 'Paid') {
        throw new Error("Cannot delete a paid bill.");
    }

    await pool.request()
        .input("BillID", sql.Int, billId)
        .query("DELETE FROM MonthlyBills WHERE BillID = @BillID");
        
    return true;
  }
};