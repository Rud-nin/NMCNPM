import sql from "mssql";
import { getConnection } from "../lib/db.js";

const UserBalance = {
  async getUserBalance(userId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .query(`SELECT * FROM UserBalance ub WHERE UserID = @UserID`);
    return result.recordset[0];
  }
}

export default UserBalance