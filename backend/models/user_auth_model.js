import sql from "mssql";
import { getConnection } from "../lib/db.js";

export const User = {
  async create({ Email, FullName, Password, ProfilePic = "" }) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar(50), Email)
      .input("FullName", sql.NVarChar(30), FullName)
      .input("Password", sql.NVarChar(100), Password)
      .input("ProfilePic", sql.NVarChar(100), ProfilePic)
      .query(`
        INSERT INTO Users (Email, FullName, [Password], ProfilePic)
        VALUES (@Email, @FullName, @Password, @ProfilePic);
        SELECT SCOPE_IDENTITY() AS UserID;
      `);
    return result.recordset[0];
  },

  async getAll() {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Users");
    return result.recordset;
  },

  async findByEmail(email) {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar(50), email)
      .query("SELECT * FROM Users WHERE Email = @Email");
    return result.recordset[0];
  },
};
