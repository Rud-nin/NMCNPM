import sql from 'mssql'
import { getConnection } from './db.js'
import bcrypt from 'bcryptjs'

// Generate random date in November 2025
function randomNovember2025() {
  const start = new Date('2025-11-01T00:00:00')
  const end = new Date('2025-11-30T23:59:59')
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

async function seed() {
  const pool = await getConnection()

  // clear old data (optional)
  await pool.request().query(`
    DELETE FROM Notifications;
    DELETE FROM UserBalance;
    DELETE FROM TopUpTransactions;
    DELETE FROM ServicePayments;
    DELETE FROM Users;

    --Reset identity counter to 1
    DBCC CHECKIDENT ('Users', RESEED, 0);
    DBCC CHECKIDENT ('Notifications', RESEED, 0);
    DBCC CHECKIDENT ('TopUpTransactions', RESEED, 0);
    DBCC CHECKIDENT ('ServicePayments', RESEED, 0);
  `)

  console.log('🌱 Seeding database...')

  // insert users
  const usersData = [
    {
      Email: 'admin@example.com',
      FullName: 'Admin User',
      Password: 'admin123',
      BirthDate: '2003-01-01',
      StudentID: '20211122',
      ID: '0123456789',
      Role: 'Admin',
    },
    {
      Email: 'user1@example.com',
      FullName: 'Nguyen Van A',
      Password: 'password1',
      BirthDate: '2006-05-10',
      StudentID: '20241234',
      ID: '0551231231',
      Role: 'User',
    },
    {
      Email: 'user2@example.com',
      FullName: 'Tran Thi B',
      Password: 'password2',
      BirthDate: '2005-08-22',
      StudentID: '20235719',
      ID: '0662342342',
      Role: 'User',
    },
  ]

  const userIds = []

  for (const u of usersData) {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(u.Password, salt)
    const result = await pool
      .request()
      .input('Email', sql.NVarChar(50), u.Email)
      .input('FullName', sql.NVarChar(30), u.FullName)
      .input('Password', sql.NVarChar(100), hashedPassword)
      .input('BirthDate', sql.Date, u.BirthDate)
      .input('StudentID', sql.NVarChar(20), u.StudentID)
      .input('ID', sql.NVarChar(20), u.ID)
      .input('Role', sql.NVarChar(10), u.Role).query(`
        INSERT INTO Users (Email, FullName, [Password], BirthDate, StudentID, ID, Role)
        VALUES (@Email, @FullName, @Password, @BirthDate, @StudentID, @ID, @Role);
        SELECT SCOPE_IDENTITY() AS UserID;
      `)

    userIds.push(result.recordset[0].UserID)
  }

  console.log('✅ Users inserted:', userIds)

  const adminId = userIds[0]
  const user1 = userIds[1]
  const user2 = userIds[2]

  // insert notifications
  await pool
    .request()
    .input('UserID', sql.Int, adminId)
    .input('Title', sql.NVarChar(100), 'Welcome to our system')
    .input('Content', sql.NVarChar(sql.MAX), 'This is the first notification.')
    .query(`
      INSERT INTO Notifications (UserID, Title, Content)
      VALUES (@UserID, @Title, @Content)
    `)

  console.log('✅ Notifications inserted')

  const balances = [
    { UserID: adminId, Balance: 0 },
    { UserID: user1, Balance: 500000 },
    { UserID: user2, Balance: 300000 },
  ]

  for (const b of balances) {
    await pool
      .request()
      .input('UserID', sql.Int, b.UserID)
      .input('Balance', sql.Decimal(15, 3), b.Balance).query(`
        INSERT INTO UserBalance (UserID, Balance)
        VALUES (@UserID, @Balance)
      `)
  }
  console.log('✅ UserBalance inserted')

  const topUps = [
    { UserID: user1, Amount: 300000, Status: 'Completed' },
    { UserID: user2, Amount: 200000, Status: 'Completed' },
    { UserID: user2, Amount: 100000, Status: 'Completed' },
  ]

  for (const t of topUps) {
    const fakeDate = randomNovember2025()

    await pool
      .request()
      .input('UserID', sql.Int, t.UserID)
      .input('Amount', sql.Decimal(15, 3), t.Amount)
      .input('Status', sql.NVarChar(20), t.Status)
      .input('CreatedAt', sql.DateTime, fakeDate).query(`
        INSERT INTO TopUpTransactions (UserID, Amount, Status, CreatedAt)
        VALUES (@UserID, @Amount, @Status, @CreatedAt)
      `)
  }
  console.log('✅ TopUpTransactions inserted (random dates)')

  const payments = [
    {
      UserID: user1,
      ServiceName: 'Phí quản lý tháng 11',
      Description: 'Phí quản lý tòa nhà tháng 11/2025',
      Amount: 300000,
    },
    {
      UserID: user1,
      ServiceName: 'Tiền điện tháng 11',
      Description: 'Tiêu thụ 120 kWh',
      Amount: 245000,
    },
    {
      UserID: user2,
      ServiceName: 'Phí gửi xe máy',
      Description: 'Xe tay ga - 1 tháng',
      Amount: 80000,
    },
  ]

  for (const p of payments) {
    const fakeDate = randomNovember2025()

    await pool
      .request()
      .input('UserID', sql.Int, p.UserID)
      .input('ServiceName', sql.NVarChar(100), p.ServiceName)
      .input('Description', sql.NVarChar(sql.MAX), p.Description)
      .input('Amount', sql.Decimal(15, 3), p.Amount)
      .input('Status', sql.NVarChar(20), 'Paid')
      .input('CreatedAt', sql.DateTime, fakeDate).query(`
        INSERT INTO ServicePayments (UserID, ServiceName, Description, Amount, Status, CreatedAt)
        VALUES (@UserID, @ServiceName, @Description, @Amount, @Status, @CreatedAt)
      `)
  }
  console.log('✅ ServicePayments inserted (random dates)')
  process.exit(0)
}

seed()
  .then(() => {
    console.log('Database seeding complete.')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Error seeding database:', err)
    process.exit(1)
  })
