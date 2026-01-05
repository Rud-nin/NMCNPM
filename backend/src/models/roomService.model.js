import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const RoomService = {
  async add(roomId, serviceId) {
    const pool = await getConnection();
    await pool.request()
      .input("RoomID", sql.Int, roomId)
      .input("ServiceID", sql.Int, serviceId)
      .query(`
        INSERT INTO RoomServices (RoomID, ServiceID)
        VALUES (@RoomID, @ServiceID)
      `);
  },

  async remove(roomId, serviceId) {
    const pool = await getConnection();
    await pool.request()
      .input("RoomID", sql.Int, roomId)
      .input("ServiceID", sql.Int, serviceId)
      .query(`
        DELETE FROM RoomServices
        WHERE RoomID = @RoomID AND ServiceID = @ServiceID
      `);
  },

  async getByRoom(roomId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("RoomID", sql.Int, roomId)
      .query(`
        SELECT 
          S.ServiceID,
          S.ServiceName,
          S.Price,
          S.Descriptions
        FROM RoomServices RS
        JOIN ServiceMonthly S ON RS.ServiceID = S.ServiceID
        WHERE RS.RoomID = @RoomID
      `);
    return result.recordset;
  },

  async getAllRoomServices() {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT RoomID, ServiceID FROM RoomServices
    `);
    return result.recordset;
  }
};
