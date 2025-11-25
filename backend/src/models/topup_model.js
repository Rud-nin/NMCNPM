import sql from 'mssql'
import { getConnection } from '../lib/db.js'

export const TopUp = {
  // Create top-up record
  async create({ UserID, Amount, Status = 'Pending', CreatedAt = null }) {
    const pool = await getConnection()

    const result = await pool
      .request()
      .input('UserID', sql.Int, UserID)
      .input('Amount', sql.Decimal(15, 3), Amount)
      .input('Status', sql.NVarChar(20), Status)
      .input('CreatedAt', sql.DateTime, CreatedAt).query(`
        INSERT INTO TopUpTransactions (UserID, Amount, Status, CreatedAt)
        VALUES (@UserID, @Amount, @Status,
                COALESCE(@CreatedAt, GETDATE()));

        SELECT SCOPE_IDENTITY() AS TopUpID;
      `)

    return result.recordset[0]
  },

  // Get all top-ups
  async getAll() {
    const pool = await getConnection()
    const result = await pool.request().query(`
      SELECT t.*, u.FullName 
      FROM TopUpTransactions t
      JOIN Users u ON t.UserID = u.UserID
      ORDER BY t.CreatedAt DESC
    `)
    return result.recordset
  },

  // Get top-ups by user
  async getByUser(UserID) {
    const pool = await getConnection()
    const result = await pool.request().input('UserID', sql.Int, UserID).query(`
        SELECT t.*, u.FullName 
        FROM TopUpTransactions t
        JOIN Users u ON t.UserID = u.UserID
        WHERE t.UserID = @UserID
        ORDER BY t.CreatedAt DESC
      `)
    return result.recordset
  },

  // Update status
  async updateStatus(TopUpID, Status) {
    const pool = await getConnection()
    await pool
      .request()
      .input('TopUpID', sql.Int, TopUpID)
      .input('Status', sql.NVarChar(20), Status).query(`
        UPDATE TopUpTransactions
        SET Status = @Status,
        WHERE TopUpID = @TopUpID
      `)

    return true
  },
}
