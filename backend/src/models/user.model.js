import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const User = {
  async create({ Email, FullName, Password, BirthDate, ResidentType, HomeTown, ID, Role}) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar(50), Email)
      .input("FullName", sql.NVarChar(30), FullName)
      .input("Password", sql.NVarChar(100), Password)
      .input("BirthDate", sql.Date, BirthDate)
      .input("ResidentType", sql.NVarChar(20), ResidentType)
      .input("HomeTown", sql.NVarChar(20), HomeTown)
      .input("ID", sql.NVarChar(20), ID)
      .input("Role", sql.NVarChar(20), Role)
      .query(`
        INSERT INTO Users (Email, FullName, [Password], BirthDate, ResidentType, HomeTown, ID, Role)
        VALUES (@Email, @FullName, @Password, @BirthDate, @ResidentType, @HomeTown, @ID, @Role);
        SELECT SCOPE_IDENTITY() AS UserID;
      `);
    return result.recordset[0];
  },

  async getAll({page = 1, limit = 10, keyword = null} ) {
    const pool = await getConnection();
    if(keyword) {
      const searchPattern = `%${keyword}%`;
      const result = await pool
        .request()
        .input("Keyword", sql.NVarChar(100), searchPattern)
        .query(`
          SELECT UserID, Email, FullName, BirthDate, ID, Role 
          FROM Users
          WHERE FullName LIKE @Keyword OR Email LIKE @Keyword
          ORDER BY UserID DESC
        `);
      
      return {
        mode: 'search', 
        users: result.recordset,
        totalCount: result.recordset.length
      };
    }
    const offset = (page - 1) * limit;
    const result = await pool
      .request()
      .input("Limit", sql.Int, limit)
      .input("Offset", sql.Int, offset)
      .query(`
        -- Query 1: Lấy danh sách user phân trang
        SELECT UserID, Email, FullName, BirthDate, ID, Role 
        FROM Users
        ORDER BY UserID DESC -- Sắp xếp người mới nhất lên đầu
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY;

        -- Query 2: Đếm tổng số user (để tính tổng số trang)
        SELECT COUNT(*) AS Total FROM Users
      `);

    return {
      mode: "pagination",
      users: result.recordsets[0],          // Kết quả query 1
      totalCount: result.recordsets[1][0].Total // Kết quả query 2
    };
  },
  

  async findByEmail(email) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar(50), email)
      .query("SELECT * FROM Users WHERE Email = @Email");
    return result.recordset[0];
  },

  async findById(userId) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .query(`
        SELECT U.UserID, U.Email, U.FullName, U.BirthDate, U.ResidentType, U.HomeTown, U.ID, U.Role, U.RoomID, ISNULL(UB.Balance,0) AS Balance, R.RoomNumber, R.Building
        FROM Users U 
        LEFT JOIN UserBalance UB ON U.UserID = UB.UserID
        LEFT JOIN Rooms R ON U.RoomID = R.RoomID
        WHERE U.UserID = @UserID`
        );
    return result.recordset[0];
  },

  async updateUserProfile(userId, { FullName, BirthDate, ResidentType, HomeTown, ID, Role }) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("FullName", sql.NVarChar(30), FullName)
      .input("BirthDate", sql.Date, BirthDate)
      .input("ResidentType", sql.NVarChar(20), ResidentType)
      .input("HomeTown", sql.NVarChar(20), HomeTown)
      .input("ID", sql.NVarChar(20), ID)
      .input("Role", sql.NVarChar(20), Role)
      .query(`
        UPDATE Users
        SET FullName = @FullName, BirthDate = @BirthDate, ResidentType = @ResidentType, HomeTown = @HomeTown, ID = @ID, Role = @Role
        WHERE UserID = @UserID;
    `);
    return true;
  },

  async deleteUser(userId) {
    const pool = await getConnection();
    await pool.request()
      .input("UserID", sql.Int, userId)
      .query("DELETE FROM Users WHERE UserID = @UserID");
    return true;
  },
};
