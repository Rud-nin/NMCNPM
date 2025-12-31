import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const RoomRequest = {

  async create(userId, roomId) {
    const pool = await getConnection();
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("RoomID", sql.Int, roomId)
      .query(`
        INSERT INTO RoomRequests (UserID, RoomID)
        VALUES (@UserID, @RoomID)
      `);
    return true;
  },

  async getByUser(userId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT rr.*, r.RoomNumber, r.Building
        FROM RoomRequests rr
        JOIN Rooms r ON rr.RoomID = r.RoomID
        WHERE rr.UserID = @UserID
        ORDER BY CreatedAt DESC
      `);
    return result.recordset;
  },

  async getByCondition({ status = null, page, limit }) {
    const offset = (page - 1) * limit;
    const pool = await getConnection();

    let whereClause = "";
    if (status) {
      whereClause = "WHERE Status = @Status";
    }

    const request = pool.request()
      .input("Limit", sql.Int, limit)
      .input("Offset", sql.Int, offset);

    if (status) {
      request.input("Status", sql.NVarChar(20), status);
    }

    const result = await request.query(`
      SELECT rr.*, u.FullName, r.RoomNumber, r.Building
      FROM RoomRequests rr
      JOIN Users u ON rr.UserID = u.UserID
      JOIN Rooms r ON rr.RoomID = r.RoomID
      ${whereClause}
      ORDER BY CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

      SELECT COUNT(*) AS Total
      FROM RoomRequests
      ${whereClause};
    `);

    return {
      data: result.recordsets[0],
      totalRows: result.recordsets[1][0].Total
    };
  },

  async findById(requestId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("RequestID", sql.Int, requestId)
      .query(`SELECT * FROM RoomRequests WHERE RequestID = @RequestID`);
    return result.recordset[0];
  },

  async cancel(requestId, userId) {
    const pool = await getConnection();
    await pool.request()
      .input("RequestID", sql.Int, requestId)
      .input("UserID", sql.Int, userId)
      .query(`
        UPDATE RoomRequests
        SET Status = 'Cancelled'
        WHERE RequestID = @RequestID
          AND UserID = @UserID
          AND Status = 'Pending'
      `);
    return true;
  },

  async approve(requestId) {
    const pool = await getConnection();
    await pool.request()
      .input("RequestID", sql.Int, requestId)
      .query(`
        UPDATE RoomRequests
        SET Status = 'Approved',
            ProcessedAt = GETDATE()
        WHERE RequestID = @RequestID
      `);
    return true;
  },

  async reject(requestId, adminId) {
    const pool = await getConnection();
    await pool.request()
      .input("RequestID", sql.Int, requestId)
      .input("AdminID", sql.Int, adminId)
      .query(`
        UPDATE RoomRequests
        SET Status = 'Rejected',
            ProcessedAt = GETDATE()
        WHERE RequestID = @RequestID
      `);
    return true;
  }
};
