import sql from 'mssql'
import { getConnection } from '../lib/db.js'

export const Payment = {
  // Create a service payment record
  async payBills(userId, billIds) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);
    try {
      await transaction.begin();

      //Lấy thông tin User
      const userRequest = new sql.Request(transaction);
      const userResult = await userRequest
        .input('UserID', sql.Int, userId)
        .query(`
          SELECT Balance, RoomID
          FROM UserBalance
          JOIN Users ON UserBalance.UserID = Users.UserID
          WHERE Users.UserID = @UserID
        `);
      if(userResult.recordset.length === 0) {
        throw new Error('User not found or balance record missing');
      }
      const userBalance = userResult.recordset[0].Balance;
      const userRoomId = userResult.recordset[0].RoomID;

      //Lấy thông tin hóa đơn
      const requestBills = new sql.Request(transaction);
      const listParams = billIds.map((_,i) => `@id${i}`).join(',');
      billIds.forEach((id,i) => requestBills.input(`id${i}`, sql.Int, id));
      const billsQuery = `
        SELECT * FROM MonthlyBills WITH (UPDLOCK)
        WHERE BillID IN (${listParams}) AND Status = 'Unpaid'
        `;
      const billsResult = await requestBills.query(billsQuery);
      const billsToPay = billsResult.recordset;

      if(billsToPay.length === 0 ) {
        throw new Error('No unpaid bills found for the provided IDs');
      }
      if (billsToPay.length !== billIds.length) {
        throw new Error('Some bills are already paid or do not exist');
      }
      //Tính tổng tiền
      let totalAmount = 0;
      for (const bill of billsToPay) {
        if(bill.UserID != null && bill.UserID !== userId ) {
          throw new Error(`Bill ID ${bill.BillID} does not belong to the user`);
        }
        if ( bill.RoomID !== null && bill.RoomID !== userRoomId ) {
          throw new Error(`Bill ID ${bill.BillID} does not belong to the user's room`);
        }
        totalAmount += bill.Amount;
      }

      //Kiểm tra số dư
      if (userBalance < totalAmount) {
        throw new Error(`Insufficient balance to pay the bills. Need ${totalAmount}, but have ${userBalance}`);
      }
      await transaction.request()
        .input('UserID', sql.Int, userId)
        .input('Amount', sql.Decimal(15, 3), totalAmount)
        .query('UPDATE UserBalance SET Balance = Balance - @Amount WHERE UserID = @UserID');
    
      //Tạo biên lai
      const  paymentResult = await transaction.request()
      .input('UserID', sql.Int, userId)
      .input('TotalAmount', sql.Decimal(15, 3), totalAmount)
      .query(`
        INSERT INTO ServicePayments (UserID, TotalAmount, Status)
        VALUES (@UserID, @TotalAmount, 'Paid');
        SELECT SCOPE_IDENTITY() AS PaymentID;
      `);
      const newPaymentId = paymentResult.recordset[0].PaymentID;

      //Update hóa đơn
      const updateReq = new sql.Request(transaction);
      billIds.forEach((id,i) => updateReq.input(`id${i}`, sql.Int, id));
      updateReq.input('PaymentID', sql.Int, newPaymentId);

      await updateReq.query(`
        UPDATE MonthlyBills
        SET Status = 'Paid',
            PaymentID = @PaymentID
        WHERE BillID IN (${listParams})
      `);
      await transaction.commit();
      return {
        success: true,
        paymentId: newPaymentId,
        totalPaid: totalAmount,
        paidBillsCount: billsToPay.length
      };

    } catch(error) {
      await transaction.rollback();
      throw error;
    }
  },

  async getUnpaidBills(userId) {
    const pool = await getConnection();
    const result = await pool.request()
      .input('UserID', sql.Int, userId)
      .query(`
        SELECT 
            B.BillID,
            S.ServiceName,
            B.Period,   -- Kỳ thu (VD: 11/2025)
            B.Amount,
            B.RoomID,   -- Để FE biết đây là tiền phòng...
            B.UserID,   -- ...hay tiền riêng
            S.Price     -- Đơn giá gốc (tham khảo)
        FROM MonthlyBills B
        JOIN ServiceMonthly S ON B.ServiceID = S.ServiceID
        JOIN Users U ON U.UserID = @UserID -- Lấy thông tin User hiện tại
        WHERE B.Status = 'Unpaid'
          AND (
              (B.UserID = @UserID)  -- Hóa đơn riêng
              OR 
              (B.RoomID IS NOT NULL AND B.RoomID = U.RoomID) -- Hóa đơn chung phòng
          )
        ORDER BY B.Period DESC, S.ServiceName ASC;
      `);

    return result.recordset;

  },

   async getHistory(userId,{ page = 1, limit = 10  }) {
    const pool = await getConnection();
    const offset = (page - 1) * limit;
    const result = await pool.request()
      .input("UserID", sql.Int, userId)
      .input("Limit", sql.Int, limit)
      .input("Offset", sql.Int, offset)
      .query(`
        -- Lấy danh sách giao dịch
        SELECT P.PaymentID, P.TotalAmount, P.Status, P.CreatedAt,
        (
          SELECT STRING_AGG(S.ServiceName, ', ')
          FROM MonthlyBills B
          JOIN ServiceMonthly S ON B.ServiceID = S.ServiceID
          WHERE B.PaymentID = P.PaymentID
        ) AS ServicesNames,
         (
          SELECT COUNT(*)
          FROM MonthlyBills B
          WHERE B.PaymentID = P.PaymentID
         ) AS BillsCount
        FROM ServicePayments P
        WHERE P.UserID = @UserID
        ORDER BY P.CreatedAt DESC
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY;

        -- Đếm tổng số giao dịch
        SELECT COUNT(*) AS TotalCount
        FROM ServicePayments P
        WHERE P.UserID = @UserID;
        `);

        return {
          data: result.recordsets[0],
          total: result.recordsets[1][0].TotalCount
        }
        
  },

  async getAllHistoryForAdmin({ page = 1, limit = 10, search = '' }) {
    const pool = await getConnection();
    const offset = (page - 1) * limit;

    // Logic tìm kiếm: Nếu có search thì lọc theo Tên hoặc Email
    const searchCondition = search ? `AND (U.FullName LIKE @Search OR U.Email LIKE @Search)` : '';
    const searchParam = search ? `%${search}%` : '';

    const result = await pool.request()
      .input('Limit', sql.Int, limit)
      .input('Offset', sql.Int, offset)
      .input('Search', sql.NVarChar(100), searchParam)
      .query(`
        --  Lấy danh sách (Kèm thông tin User)
        SELECT 
            P.PaymentID, 
            P.TotalAmount, 
            P.Status, 
            P.CreatedAt,
            U.FullName, -- Admin cần biết ai trả
            U.RoomID,   -- Admin cần biết phòng nào
            (
                SELECT STRING_AGG(S.ServiceName, ', ') 
                FROM MonthlyBills B
                JOIN ServiceMonthly S ON B.ServiceID = S.ServiceID
                WHERE B.PaymentID = P.PaymentID
            ) AS ServiceNames
        FROM ServicePayments P
        JOIN Users U ON P.UserID = U.UserID
        WHERE 1=1 ${searchCondition}
        ORDER BY P.CreatedAt DESC
        OFFSET @Offset ROWS 
        FETCH NEXT @Limit ROWS ONLY;

        -- Đếm tổng
        SELECT COUNT(*) AS TotalCount 
        FROM ServicePayments P
        JOIN Users U ON P.UserID = U.UserID
        WHERE 1=1 ${searchCondition};
      `);

    return {
      data: result.recordsets[0],
      total: result.recordsets[1][0].TotalCount
    };
  }

}
