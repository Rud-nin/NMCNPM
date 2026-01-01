import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const Feedback = {
  // Tạo phản hồi mới
  async create({ userId, title, content }) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("UserID", sql.Int, userId)
      .input("Title", sql.NVarChar(200), title)
      .input("Content", sql.NVarChar(sql.MAX), content)
      .query(`
        INSERT INTO Feedbacks (UserID, Title, Content)
        VALUES (@UserID, @Title, @Content);

        SELECT SCOPE_IDENTITY() AS FeedbackID;
      `);
    return result.recordset[0];
  },

  // Lấy danh sách phản hồi (Dành cho Admin sau này xem)
  async getAll({page = 1, limit = 10}) {
    const pool = await getConnection();
    const offset = (page-1) * limit;
    const result = await pool
      .request()
      .input("Limit", sql.Int, limit)
      .input("Offset", sql.Int, offset)
      .query(`
        SELECT F.*, U.FullName, U.Email, U.studentID
        FROM Feedbacks F
        JOIN Users U ON F.UserID = U.UserID
        ORDER BY F.CreatedAt DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY;

        SELECT COUNT(*) AS Total FROM Feedbacks;
      `);
    return {
        feedbacks: result.recordsets[0],
        totalCount: result.recordsets[1][0].Total
    };
  }
};