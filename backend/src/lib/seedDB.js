import sql from 'mssql'
import bcrypt from 'bcryptjs'
import { getConnection } from './db.js'
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
    -- 1. Xóa các bảng phụ thuộc hoàn toàn (Bảng con)
    DELETE FROM Feedbacks;
    DELETE FROM Notifications;
    DELETE FROM TopUpTransactions;
    DELETE FROM RoomRequests;
    DELETE FROM UserServices;
    DELETE FROM RoomServices;
    DELETE FROM MonthlyBills;

    -- 2. Xóa các bảng trung gian hoặc bảng bị tham chiếu bởi bảng trên
    DELETE FROM ServicePayments;
    DELETE FROM UserBalance;

    DELETE FROM Users;

    -- 3. Xoá các bảng gốc
    DELETE FROM Rooms;
    DELETE FROM ServiceMonthly;

    --Reset identity counter to 1 or 2
    DBCC CHECKIDENT ('Feedbacks', RESEED, 1);
    DBCC CHECKIDENT ('Notifications', RESEED, 1);
    DBCC CHECKIDENT ('TopUpTransactions', RESEED, 1);
    DBCC CHECKIDENT ('RoomRequests', RESEED, 1);
    DBCC CHECKIDENT ('MonthlyBills', RESEED, 1);
    DBCC CHECKIDENT ('ServicePayments', RESEED, 1);
    DBCC CHECKIDENT ('Users', RESEED, 1);
    DBCC CHECKIDENT ('Rooms', RESEED, 1);
    DBCC CHECKIDENT ('ServiceMonthly', RESEED, 1);
  `)

  console.log('🌱 Seeding database...')

  // ================== ROOM ==================
  const roomsData = [
    { RoomNumber: 301, Building: 'V1', Capacity: 4 },
    { RoomNumber: 302, Building: 'V1', Capacity: 4 },
    { RoomNumber: 713, Building: 'V2', Capacity: 8 },

    { RoomNumber: 806, Building: 'V3', Capacity: 4 },
    { RoomNumber: 202, Building: 'V3', Capacity: 8 },
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

  // ================== SERVICE ==================
  const servicesData = [
    // Room services
    {
      ServiceName: 'Điện',
      Price: 350000,
      Descriptions: 'Tiền điện theo tháng',
      Type: 'Room',
    },
    {
      ServiceName: 'Nước',
      Price: 150000,
      Descriptions: 'Tiền nước theo tháng',
      Type: 'Room',
    },
    {
      ServiceName: 'Internet',
      Price: 120000,
      Descriptions: 'Internet tốc độ cao',
      Type: 'Room',
    },

    // Personal services
    {
      ServiceName: 'Gửi xe máy',
      Price: 50000,
      Descriptions: 'Gửi xe máy hàng tháng',
      Type: 'Personal',
    },
    {
      ServiceName: 'Gửi ô tô',
      Price: 90000,
      Descriptions: 'Gửi ô tô hàng tháng',
      Type: 'Personal',
    },
    {
      ServiceName: 'Gym',
      Price: 100000,
      Descriptions: 'Thẻ tập Gym hàng tháng',
      Type: 'Personal',
    }
  ]

  const serviceIds = {}

  for (const s of servicesData) {
    const result = await pool
      .request()
      .input('ServiceName', sql.NVarChar(100), s.ServiceName)
      .input('Price', sql.Decimal(15, 3), s.Price)
      .input('Descriptions', sql.NVarChar(200), s.Descriptions)
      .input('Type', sql.NVarChar(20), s.Type)
      .query(`
        INSERT INTO ServiceMonthly (ServiceName, Price, Descriptions, [Type])
        VALUES (@ServiceName, @Price, @Descriptions, @Type);
        SELECT SCOPE_IDENTITY() AS ServiceID;
      `)

    serviceIds[s.ServiceName] = result.recordset[0].ServiceID
  }

  console.log('✅ Services inserted:', serviceIds)

  // ================== USER ==================
  const usersData = [
    {
      Email: 'admin@example.com',
      FullName: 'Admin User',
      Password: 'admin123',
      BirthDate: '2003-01-01',
      HomeTown: 'Hà Nội',
      ResidentType: 'Tạm trú',
      ID: '0123456789',
      Role: 'Admin',
    },

    // ROOM B5-101 (4 slots - FULL)
    {
      Email: 'user1@example.com',
      FullName: 'Nguyen Van A',
      Password: 'password1',
      BirthDate: '2006-05-10',
      HomeTown: 'Nam Định',
      ResidentType: 'Thường trú',
      ID: '0551231231',
      RoomID: roomIds[0],
      Role: 'User',
    },
    {
      Email: 'user2@example.com',
      FullName: 'Tran Thi B',
      Password: 'password2',
      BirthDate: '2005-08-22',
      HomeTown: 'Quảng Ninh',
      ResidentType: 'Tạm trú',
      ID: '0662342342',
      RoomID: roomIds[0],
      Role: 'User',
    },
    {
      Email: 'user3@example.com',
      FullName: 'Le Van C',
      Password: 'password3',
      BirthDate: '2005-11-02',
      HomeTown: 'Thái Bình',
      ResidentType: 'Thường trú',
      ID: '0773453453',
      RoomID: roomIds[0],
      Role: 'User',
    },
    {
      Email: 'user4@example.com',
      FullName: 'Pham Thi D',
      Password: 'password4',
      BirthDate: '2006-02-14',
      HomeTown: 'Nghệ An',
      ResidentType: 'Thường trú',
      ID: '0884564564',
      RoomID: roomIds[0],
      Role: 'User',
    },

    // ROOM B5-102 (1/4)
    {
      Email: 'user5@example.com',
      FullName: 'Hoang Van E',
      Password: 'password5',
      BirthDate: '2004-07-19',
      HomeTown: 'Hải Phòng',
      ResidentType: 'Tạm trú',
      ID: '0995675675',
      RoomID: roomIds[1],
      Role: 'User',
    },

    // ROOM B6-103 (2/8)
    {
      Email: 'user6@example.com',
      FullName: 'Dang Thi F',
      Password: 'password6',
      BirthDate: '2005-03-09',
      HomeTown: 'Quảng Ninh',
      ResidentType: 'Tạm trú',
      ID: '0116786786',
      RoomID: roomIds[2],
      Role: 'User',
    },
    {
      Email: 'user7@example.com',
      FullName: 'Bui Van G',
      Password: 'password7',
      BirthDate: '2004-12-30',
      HomeTown: 'Hà Nội',
      ResidentType: 'Tạm vắng',
      ID: '0227897897',
      RoomID: roomIds[2],
      Role: 'User',
    },

    // NO ROOM
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
      .input('HomeTown', sql.NVarChar(20), u.HomeTown)
      .input('ID', sql.NVarChar(20), u.ID)
      .input('RoomID', sql.Int, u.RoomID)
      .input('Role', sql.NVarChar(10), u.Role).query(`
        INSERT INTO Users (Email, FullName, [Password], BirthDate, HomeTown, ID, RoomID, Role)
        VALUES (@Email, @FullName, @Password, @BirthDate, @HomeTown, @ID, @RoomID, @Role);
        SELECT SCOPE_IDENTITY() AS UserID;
      `)

    userIds.push(result.recordset[0].UserID)
  }

  console.log('✅ Users inserted:', userIds)

  // Cập nhật cư dân vào phòng (Gán ngẫu nhiên cho ví dụ)
  await pool.request().query(`UPDATE Rooms SET OwnerID = ${userIds[1]} WHERE RoomID = ${roomIds[0]}`);
  await pool.request().query(`UPDATE Rooms SET OwnerID = ${userIds[5]} WHERE RoomID = ${roomIds[1]}`);
  await pool.request().query(`UPDATE Rooms SET OwnerID = ${userIds[6]} WHERE RoomID = ${roomIds[2]}`);

  const adminId = userIds[0]
  const user1 = userIds[1]
  const user2 = userIds[2]

  // ================== NOTIFICATION ==================
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

  // ================== BALANCE ==================
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

  // ================== TOPUP ==================
  const topUps = [
    { UserID: user1, Amount: 300000, Status: 'Success' },
    { UserID: user2, Amount: 200000, Status: 'Success' },
    { UserID: user2, Amount: 100000, Status: 'Success' },
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

  // ================== USER SERVICE ==================
  const userServicesData = [
    // roomIds[0] = B5-101
    { UserID: userIds[1], ServiceID: serviceIds["Gym"] },
    { UserID: userIds[1], ServiceID: serviceIds["Gửi xe máy"] },
    { UserID: userIds[8], ServiceID: serviceIds["Gửi xe máy"] }
  ]

  for (const us of userServicesData) {
    await pool
      .request()
      .input('UserID', sql.Int, us.UserID)
      .input('ServiceID', sql.Int, us.ServiceID)
      .query(`
        INSERT INTO UserServices (UserID, ServiceID)
        VALUES (@UserID, @ServiceID)
      `)
    
    // Tạo Bill tương ứng cho tháng hiện tại
    await pool
      .request()
      .input('UserID', sql.Int, us.UserID)
      .input('ServiceID', sql.Int, us.ServiceID)
      .query(`
        INSERT INTO MonthlyBills (UserID, ServiceID, Status) 
        VALUES (@UserID, @ServiceID, 'Unpaid')
      `);
  }

  console.log('✅ UserServices & Personal Bills inserted');

    // ================== ROOM REQUESTS ==================
  const roomRequestsData = [
    {
      UserID: userIds[7], // user8 - chưa có phòng
      RoomID: roomIds[1], // B5-102
      Status: 'Pending',
    },
    {
      UserID: userIds[7],
      RoomID: roomIds[2], // B6-103
      Status: 'Rejected',
    },
    {
      UserID: userIds[6], // user7
      RoomID: roomIds[1],
      Status: 'Approved',
    },
    {
      UserID: userIds[5], // user6
      RoomID: roomIds[0],
      Status: 'Cancelled',
    },
  ]

  for (const rr of roomRequestsData) {
    await pool
      .request()
      .input('UserID', sql.Int, rr.UserID)
      .input('RoomID', sql.Int, rr.RoomID)
      .input('Status', sql.NVarChar(20), rr.Status)
      .query(`
        INSERT INTO RoomRequests (UserID, RoomID, Status)
        VALUES (@UserID, @RoomID, @Status)
      `)
  }

  console.log('✅ RoomRequests inserted')

  // ================== ROOM SERVICE ==================
  const roomServicesData = [
    // roomIds[0] = B5-101
    { RoomID: roomIds[0], ServiceID: serviceIds["Điện"] },
    { RoomID: roomIds[0], ServiceID: serviceIds["Nước"] },
    { RoomID: roomIds[0], ServiceID: serviceIds["Internet"] },

    // roomIds[1] = B5-102
    { RoomID: roomIds[1], ServiceID: serviceIds["Điện"] },
    { RoomID: roomIds[1], ServiceID: serviceIds["Nước"] },
    { RoomID: roomIds[1], ServiceID: serviceIds["Internet"] },

    // roomIds[2] = B6-103
    { RoomID: roomIds[2], ServiceID: serviceIds["Điện"] },
    { RoomID: roomIds[2], ServiceID: serviceIds["Nước"] },
  ]

  for (const rs of roomServicesData) {
    await pool
      .request()
      .input('RoomID', sql.Int, rs.RoomID)
      .input('ServiceID', sql.Int, rs.ServiceID)
      .query(`
        INSERT INTO RoomServices (RoomID, ServiceID)
        VALUES (@RoomID, @ServiceID)
      `)
    
    // Tạo Bill cho cả phòng (Dùng RoomID, UserID để NULL)
    await pool.request()
      .input('RoomID', sql.Int, rs.RoomID)
      .input('ServiceID', sql.Int, rs.ServiceID)
      .query(`
        INSERT INTO MonthlyBills (RoomID, ServiceID, Status) 
        VALUES (@RoomID, @ServiceID, 'Unpaid')
      `);
  }

  console.log('✅ RoomServices & Room Bills inserted');

  // ================== FEEDBACKS ==================
  const feedbacksData = [
    {
      UserID: userIds[1],
      Title: 'Mất điện phòng B5-101',
      Content: 'Tối qua phòng em bị mất điện từ 22h đến 23h, mong ban quản lý kiểm tra.',
      Status: 'Pending',
    },
    {
      UserID: userIds[2],
      Title: 'Nước chảy yếu',
      Content: 'Nước sinh hoạt buổi sáng rất yếu, khó sinh hoạt.',
      Status: 'Done',
    },
    {
      UserID: userIds[6],
      Title: 'Internet chập chờn',
      Content: 'Internet trong phòng thường xuyên bị mất kết nối vào buổi tối.',
      Status: 'Pending',
    },
  ]

  for (const fb of feedbacksData) {
    await pool
      .request()
      .input('UserID', sql.Int, fb.UserID)
      .input('Title', sql.NVarChar(200), fb.Title)
      .input('Content', sql.NVarChar(sql.MAX), fb.Content)
      .input('Status', sql.NVarChar(20), fb.Status)
      .query(`
        INSERT INTO Feedbacks (UserID, Title, Content, Status)
        VALUES (@UserID, @Title, @Content, @Status)
      `)
  }

  console.log('✅ Feedbacks inserted')
  
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
