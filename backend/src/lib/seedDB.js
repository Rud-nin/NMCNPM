import sql from 'mssql'
import { getConnection } from './db.js'
import bcrypt from 'bcryptjs'

// Generate random date
function randomNovember2025() {
  const start = new Date('2025-11-01T00:00:00')
  const end = new Date('2026-01-01T23:59:59')
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
    DELETE FROM Users;

    --Reset identity counter to 1
    DBCC CHECKIDENT ('Users', RESEED, 0);
    DBCC CHECKIDENT ('Notifications', RESEED, 0);
    DBCC CHECKIDENT ('TopUpTransactions', RESEED, 0);
  `)

  console.log('🌱 Seeding database...')

  const roomsData = [
    { RoomNumber: 101, Building: 'B5', Capacity: 4 },
    { RoomNumber: 102, Building: 'B5', Capacity: 4 },
    { RoomNumber: 103, Building: 'B6', Capacity: 8 },

    { RoomNumber: 201, Building: 'B13', Capacity: 4 },
    { RoomNumber: 202, Building: 'B9', Capacity: 8 },
  ]

  const roomIds = []

  for (const r of roomsData) {
    const result = await pool
      .request()
      .input('RoomNumber', sql.Int, r.RoomNumber)
      .input('Building', sql.NVarChar(10), r.Building)
      .input('Capacity', sql.Int, r.Capacity)
      .query(`
        INSERT INTO Rooms (RoomNumber, Building, Capacity)
        VALUES (@RoomNumber, @Building, @Capacity);
        SELECT SCOPE_IDENTITY() AS RoomID;
      `)

    roomIds.push(result.recordset[0].RoomID)
  }

  console.log('✅ Rooms inserted:', roomIds)

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

    // ===== ROOM B5-101 (4 slots - FULL) =====
    {
      Email: 'user1@example.com',
      FullName: 'Nguyen Van A',
      Password: 'password1',
      BirthDate: '2006-05-10',
      StudentID: '20241234',
      ID: '0551231231',
      RoomID: roomIds[0],
      Role: 'User',
    },
    {
      Email: 'user2@example.com',
      FullName: 'Tran Thi B',
      Password: 'password2',
      BirthDate: '2005-08-22',
      StudentID: '20235719',
      ID: '0662342342',
      RoomID: roomIds[0],
      Role: 'User',
    },
    {
      Email: 'user3@example.com',
      FullName: 'Le Van C',
      Password: 'password3',
      BirthDate: '2005-11-02',
      StudentID: '20236666',
      ID: '0773453453',
      RoomID: roomIds[0],
      Role: 'User',
    },
    {
      Email: 'user4@example.com',
      FullName: 'Pham Thi D',
      Password: 'password4',
      BirthDate: '2006-02-14',
      StudentID: '20237777',
      ID: '0884564564',
      RoomID: roomIds[0],
      Role: 'User',
    },

    // ===== ROOM B5-102 (1/4) =====
    {
      Email: 'user5@example.com',
      FullName: 'Hoang Van E',
      Password: 'password5',
      BirthDate: '2004-07-19',
      StudentID: '20238888',
      ID: '0995675675',
      RoomID: roomIds[1],
      Role: 'User',
    },

    // ===== ROOM B6-103 (2/8) =====
    {
      Email: 'user6@example.com',
      FullName: 'Dang Thi F',
      Password: 'password6',
      BirthDate: '2005-03-09',
      StudentID: '20239999',
      ID: '0116786786',
      RoomID: roomIds[2],
      Role: 'User',
    },
    {
      Email: 'user7@example.com',
      FullName: 'Bui Van G',
      Password: 'password7',
      BirthDate: '2004-12-30',
      StudentID: '20230001',
      ID: '0227897897',
      RoomID: roomIds[2],
      Role: 'User',
    },

    // ===== NO ROOM =====
    {
      Email: 'user8@example.com',
      FullName: 'Tran Van H',
      Password: 'password8',
      BirthDate: '2006-06-06',
      StudentID: '20230002',
      ID: '0338908908',
      RoomID: null,
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
      .input('RoomID', sql.Int, u.RoomID)
      .input('Role', sql.NVarChar(10), u.Role).query(`
        INSERT INTO Users (Email, FullName, [Password], BirthDate, StudentID, ID, RoomID, Role)
        VALUES (@Email, @FullName, @Password, @BirthDate, @StudentID, @ID, @RoomID, @Role);
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
