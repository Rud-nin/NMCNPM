import sql from 'mssql'
import { getConnection } from '../lib/db.js'

export const ServicePayment = {
  // Create a service payment record
  async create({
    UserID,
    ServiceName,
    Description,
    Amount,
    Status = 'Paid',
    CreatedAt = null,
  }) {
    const pool = await getConnection()

    const result = await pool
      .request()
      .input('UserID', sql.Int, UserID)
      .input('ServiceName', sql.NVarChar(100), ServiceName)
      .input('Description', sql.NVarChar(sql.MAX), Description)
      .input('Amount', sql.Decimal(15, 3), Amount)
      .input('Status', sql.NVarChar(20), Status)
      .input('CreatedAt', sql.DateTime, CreatedAt).query(`
        INSERT INTO ServicePayments (UserID, ServiceName, Description, Amount, Status, CreatedAt)
        VALUES (@UserID, @ServiceName, @Description, @Amount, @Status, COALESCE(@CreatedAt, GETDATE()));

        SELECT SCOPE_IDENTITY() AS PaymentID;
      `)

    return result.recordset[0]
  },

  // List all payments
  async getAll() {
    const pool = await getConnection()
    const result = await pool.request().query(`
      SELECT p.*, u.FullName 
      FROM ServicePayments p
      JOIN Users u ON p.UserID = u.UserID
      ORDER BY p.CreatedAt DESC
    `)
    return result.recordset
  },

  // Get payments by user
  async getByUser(UserID) {
    const pool = await getConnection()
    const result = await pool.request().input('UserID', sql.Int, UserID).query(`
        SELECT p.*, u.FullName 
        FROM ServicePayments p
        JOIN Users u ON p.UserID = u.UserID
        WHERE p.UserID = @UserID
        ORDER BY p.CreatedAt DESC
      `)
    return result.recordset
  },
}
