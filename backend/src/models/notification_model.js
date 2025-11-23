import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const Notification = {
    //Admin tạo thông báo mới
    async create({ title, content, adminId }) {
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("Title", sql.NVarChar(100), title)
            .input("Content", sql.NVarChar(sql.MAX), content)
            .input("CreatedBy", sql.Int, adminId)
            .query(`
               INSERT INTO Notifications (Title, Content, CreatedBy)
               VALUES (@Title, @Content, @CreatedBy);
        
               -- Trả về thông báo vừa tạo (để có thể bắn socket realtime)
               SELECT * FROM Notifications WHERE NotificationID = SCOPE_IDENTITY();
            `);
      return result.recordset[0];
    },

    //User: Lấy danh sách thông báo (Đẩy thông báo mới nhất lên đầu)
    async getAll(){
        const pool = await getConnection();
        const result = await pool.request().query(`
            SELECT N.NotificationID, N.Title, N.Content, N.CreatedAt, U.FullName as AuthorName
            FROM Notifications N
            JOIN Users U ON N.CreatedBy = UserID
            ORDER BY N.CreatedAt DESC
        `);
        return result.recordset;
    }
};