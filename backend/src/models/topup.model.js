import sql from 'mssql'
import { getConnection } from '../lib/db.js'

export const TopUp = {
  // Create top-up record
  async create({ UserID, Amount }) {
    const pool = await getConnection()

    const result = await pool
      .request()
      .input('UserID', sql.Int, UserID)
      .input('Amount', sql.Decimal(15, 3), Amount)
      .query(`
        INSERT INTO TopUpTransactions (UserID, Amount, Status)
        VALUES (@UserID, @Amount, 'Pending');

        SELECT SCOPE_IDENTITY() AS TopUpID;
      `)

    return result.recordset[0]
  },

  // Get all top-ups
  async getAll({ page = 1, limit = 10 }) {
    const pool = await getConnection()
    const offset = (page - 1) * limit;

    const result = await pool.request()
      .input('Limit', sql.Int, limit)
      .input('Offset', sql.Int, offset)
      .query(`
        SELECT t.*, u.FullName 
        FROM TopUpTransactions t
        JOIN Users u ON t.UserID = u.UserID
        ORDER BY t.CreatedAt DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY;

        SELECT COUNT(*) AS Total FROM TopUpTransactions;
      `)
    return {
      data: result.recordsets[0],
      totalCount: result.recordsets[1][0].Total
    }
  },

  async findById(TopUpID) {
    const pool = await getConnection();
    const result = await pool.request()
      .input("TopUpID", sql.Int, TopUpID)
      .query(`SELECT * FROM TopUpTransactions WHERE TopUpID = @TopUpID`);
    return result.recordset[0];
  },

  // Get top-ups by user
  async getByUser(UserID, { page = 1, limit = 10 }) {
    const pool = await getConnection()
    const offset = (page - 1) * limit;

    const result = await pool.request()
      .input('UserID', sql.Int, UserID)
      .input('Limit', sql.Int, limit)
      .input('Offset', sql.Int, offset)
      .query(`
        SELECT t.*, u.FullName 
        FROM TopUpTransactions t
        JOIN Users u ON t.UserID = u.UserID
        WHERE t.UserID = @UserID
        ORDER BY t.CreatedAt DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY;

        SELECT COUNT(*) AS Total FROM TopUpTransactions WHERE UserID = @UserID;
      `)
    return {
      data: result.recordsets[0],
      totalRows: result.recordsets[1][0].Total
    }
  },

  async acceptTopUp(TopUpID) {
    const pool = await getConnection()
    const transaction = new sql.Transaction(pool)

    await transaction.begin()

    try {
      const request = new sql.Request(transaction)

      const topup = await request
        .input("TopUpID", sql.Int, TopUpID)
        .query(`
          SELECT * FROM TopUpTransactions
          WHERE TopUpID = @TopUpID AND Status = 'Pending'
        `)

      if (topup.recordset.length === 0) {
        throw new Error("Top-up không hợp lệ hoặc đã xử lý")
      }

      const { UserID, Amount } = topup.recordset[0]

      await request
        .input("UserID", sql.Int, UserID)
        .input("Amount", sql.Decimal(15, 3), Amount)
        .query(`
          MERGE UserBalance AS target
          USING (SELECT @UserID AS UserID) AS source
          ON target.UserID = source.UserID
          WHEN MATCHED THEN
            UPDATE SET Balance = Balance + @Amount
          WHEN NOT MATCHED THEN
            INSERT (UserID, Balance) VALUES (@UserID, @Amount);
        `)

      await request
        .query(`
          UPDATE TopUpTransactions
          SET Status = 'Success'
          WHERE TopUpID = @TopUpID
        `)

      await request
        .query(`
          INSERT INTO Notifications (UserID, Title, Content)
          VALUES (
            @UserID,
            N'Nạp tiền thành công',
            N'Số tiền ' + CAST(@Amount AS NVARCHAR(30))
          )
        `)

      await transaction.commit()
      return true
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  async rejectTopUp(TopUpID, reason = "") {
    const pool = await getConnection()

     // Lấy topup đang pending
    const topupResult = await pool.request()
      .input("TopUpID", sql.Int, TopUpID)
      .query(`
        SELECT UserID
        FROM TopUpTransactions
        WHERE TopUpID = @TopUpID AND Status = 'Pending'
      `)

    if (topupResult.recordset.length === 0) {
      throw new Error("Top-up không tồn tại hoặc đã được xử lý")
    }

    const userId = topupResult.recordset[0].UserID

    // Update status
    await pool.request()
      .input("TopUpID", sql.Int, TopUpID)
      .query(`
        UPDATE TopUpTransactions
        SET Status = 'Fail'
        WHERE TopUpID = @TopUpID
      `)

    // Insert notification
    await pool.request()
      .input("UserID", sql.Int, userId)
      .input("Reason", sql.NVarChar(sql.MAX), reason)
      .query(`
        INSERT INTO Notifications (UserID, Title, Content)
        VALUES (
          @UserID,
          N'Nạp tiền bị từ chối',
          N'Lý do: ' + @Reason
        )
      `)

    return true
  }
}
