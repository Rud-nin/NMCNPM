import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const Notification = {
    //Admin tạo thông báo mới
    async create({ title, content, receiverId }) {
        const pool = await getConnection();
        const result = await pool
            .request()
            .input("Title", sql.NVarChar(100), title)
            .input("Content", sql.NVarChar(sql.MAX), content)
            .input("UserID", sql.Int, receiverId)
            .query(`
               INSERT INTO Notifications (Title, Content, UserID)
               VALUES (@Title, @Content, @UserID);
        
               -- Trả về thông báo vừa tạo (để có thể bắn socket realtime)
               SELECT * FROM Notifications WHERE NotificationID = SCOPE_IDENTITY();
            `);
        return result.recordset[0];
    },

    //User: Lấy danh sách thông báo (Đẩy thông báo mới nhất lên đầu)
    async getForUser(currentUserId, page = 1, limit = 10) {
        const pool = await getConnection();
        const offset = (page - 1) * limit;
        const result = await pool
            .request()
            .input("CurrentUserID", sql.Int, currentUserId)
            .input("Limit", sql.Int, limit)
            .input("Offset", sql.Int, offset)
            .query(`
                --query 1: Lấy thông báo cho user hiện tại với phân trang
                SELECT N.NotificationID, N.Title, N.Content, N.CreatedAt, U.UserID as AuthorName
                FROM Notifications N
                LEFT JOIN Users U ON N.UserID = U.UserID -- Dùng LEFT JOIN phòng trường hợp UserID null
                WHERE N.UserID IS NULL OR N.UserID = @CurrentUserID
                ORDER BY N.CreatedAt DESC
                OFFSET @Offset ROWS
                FETCH NEXT @Limit ROWS ONLY;

                --query 2: Đếm tổng số thông báo của User để tính tổng số trang
                SELECT COUNT(*) AS Total
                FROM Notifications N
                WHERE N.UserID IS NULL OR N.UserID = @CurrentUserID;

        `);
        return {
            notifications: result.recordsets[0],
            totalCount: result.recordsets[1][0].Total
        };
    }
};