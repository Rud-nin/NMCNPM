import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const Room = {

  async getAll({ page, limit }) {
    const offset = (page - 1) * limit;
    const pool = await getConnection();

    const result = await pool.request()
      .input("Limit", sql.Int, limit)
      .input("Offset", sql.Int, offset)
      .query(`
        SELECT *
        FROM Rooms
        ORDER BY Building, RoomNumber
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

        SELECT COUNT(*) AS Total FROM Rooms;
      `);

    return {
      data: result.recordsets[0],
      totalRows: result.recordsets[1][0].Total
    };
  },

  async getAvailable({ page, limit }) {
    const offset = (page - 1) * limit;
    const pool = await getConnection();

    const result = await pool.request()
      .input("Limit", sql.Int, limit)
      .input("Offset", sql.Int, offset)
      .query(`
        SELECT *
        FROM Rooms
        WHERE Occupancy < Capacity
        ORDER BY Building, RoomNumber
        OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY;

        SELECT COUNT(*) AS Total
        FROM Rooms
        WHERE Occupancy < Capacity;
      `);

    return {
      data: result.recordsets[0],
      totalRows: result.recordsets[1][0].Total
    };
  },

  async findById(roomId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("RoomID", sql.Int, roomId)
      .query(`SELECT * FROM Rooms WHERE RoomID = @RoomID`);
    return result.recordset[0];
  },

  async create({ RoomNumber, Building, Capacity }) {
    const pool = await getConnection();
    await pool.request()
      .input("RoomNumber", sql.Int, RoomNumber)
      .input("Building", sql.NVarChar(10), Building)
      .input("Capacity", sql.Int, Capacity)
      .query(`
        INSERT INTO Rooms (RoomNumber, Building, Capacity)
        VALUES (@RoomNumber, @Building, @Capacity)
      `);
    return true;
  },

  async delete(roomId) {
    const pool = await getConnection();
    await pool.request()
      .input("RoomID", sql.Int, roomId)
      .query(`
        DELETE FROM Rooms
        WHERE RoomID = @RoomID AND Occupancy = 0
      `);
    return true;
  },

  async assignUser(userId, roomId) {
    const pool = await getConnection();
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("RoomID", sql.Int, roomId)
      .query(`UPDATE Users SET RoomID = @RoomID WHERE UserID = @UserID`);
    return true;
  },

  async removeUser(userId) {
    const pool = await getConnection();
    await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`UPDATE Users SET RoomID = NULL WHERE UserID = @UserID`);
    return true;
  },

  async getUsersInRoom(roomId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("RoomID", sql.Int, roomId)
      .query(`
        SELECT 
          U.UserID,
          U.FullName,
          U.Email,
          U.BirthDate,
          U.HomeTown
        FROM Users U
        WHERE U.RoomID = @RoomID
        ORDER BY U.FullName
      `);
    return result.recordset;
  },

  async promoteUserToOwner(userId, roomId) {
    const pool = await getConnection();
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("RoomID", sql.Int, roomId)
      .query(`UPDATE Rooms SET OwnerID = @UserID WHERE RoomID = @RoomID`);
    return true;
  },

  async deleteOwner(roomId) {
    const pool = await getConnection();
    await pool.request()
      .input("RoomID", sql.Int, roomId)
      .query(`UPDATE Rooms SET OwnerID = NULL WHERE RoomID = @RoomID`);
    return true;
  },
};
