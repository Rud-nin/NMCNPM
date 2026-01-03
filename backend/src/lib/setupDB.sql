CREATE DATABASE CNPM;

USE CNPM;

CREATE TABLE dbo.Rooms (
    RoomID INT IDENTITY(1, 1) PRIMARY KEY,
    RoomNumber INT NOT NULL,
    Building NVARCHAR(10) NOT NULL,
    Capacity INT NOT NULL DEFAULT 4,  -- Sức chứa của phòng
    Occupancy INT NOT NULL DEFAULT 0, -- Lượng user hiện tại

    CONSTRAINT CK_Rooms_Occupancy
        CHECK (Occupancy <= Capacity AND Occupancy >= 0),

    CONSTRAINT UQ_Rooms_Building_RoomNumber -- Đảm bảo trong một toà nhà không có 2 phòng trùng nhau
        UNIQUE (Building, RoomNumber)
);

CREATE TABLE dbo.RoomRequests (
    RequestID INT IDENTITY(1,1) PRIMARY KEY,

    UserID INT NOT NULL,
    RoomID INT NOT NULL,

    Status NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    -- Pending | Approved | Rejected | Cancelled

    CreatedAt DATETIME DEFAULT GETDATE(),
    ProcessedAt DATETIME NULL,

    CONSTRAINT FK_RoomRequests_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
    CONSTRAINT FK_RoomRequests_Room FOREIGN KEY (RoomID) REFERENCES dbo.Rooms(RoomID),

    CONSTRAINT UQ_RoomRequests_User_Room_Status
        UNIQUE (UserID, RoomID, Status)
);


CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,       -- Auto-increment unique ID
    Email NVARCHAR(50) NOT NULL UNIQUE,         -- Email must be unique and required
    FullName NVARCHAR(30) NOT NULL,             -- Required full name
    [Password] NVARCHAR(100) NOT NULL CHECK (LEN([Password]) >= 6),  -- Required, min length 6
    BirthDate DATE NOT NULL,                    -- Required birthdate (YYYY-MM-DD)
    StudentID NVARCHAR(20) NOT NULL UNIQUE,     -- Required student ID (MSSV)
    ID NVARCHAR(20) NOT NULL UNIQUE,            -- Required ID Number (Số CCCD)
    ProfilePic NVARCHAR(100) NULL DEFAULT (''), -- Optional, defaults to empty string
    RoomID INT NULL,
    Role NVARCHAR(10) NOT NULL DEFAULT 'User',

    CONSTRAINT FK_Users_Rooms
        FOREIGN KEY (RoomID) REFERENCES dbo.Rooms(RoomID)
);

CREATE TABLE dbo.Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,   -- ID thông báo tăng tự động

    UserID INT NULL,

    Title NVARCHAR(100) NOT NULL,                   -- Tiêu đề thông báo
    Content NVARCHAR(MAX) NOT NULL,                 -- Nội dung thông báo
    CreatedAt DATETIME DEFAULT GETDATE(),           -- Thời gian tạo
    
    -- Foreign Key: Link tới người tạo (Admin)
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.UserBalance (
    UserID INT PRIMARY KEY,
    Balance DECIMAL(15, 3) NOT NULL DEFAULT 0,

    CONSTRAINT FK_UserBalance_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.TopUpTransactions ( -- Nạp tiền
    TopUpID INT IDENTITY(1,1) PRIMARY KEY,

    UserID INT NOT NULL,
    Amount DECIMAL(15, 3) NOT NULL CHECK (Amount > 0), -- 0 < x <= 999_999_999_999.999 (vnđ)

    Status NVARCHAR(20) NOT NULL DEFAULT 'Completed',
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Transaction_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
)

CREATE TABLE dbo.ServicePayments ( -- Trả tiền dịch vụ
    PaymentID INT IDENTITY(1,1) PRIMARY KEY,
    UserID INT NOT NULL,
    TotalAmount DECIMAL(15, 3) NOT NULL CHECK (TotalAmount >= 0), -- Tổng số tiền phải trả
    Status NVARCHAR(20) NOT NULL DEFAULT 'Paid',
    -- Paid | Failed | Refunded
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Payment_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID),
);

CREATE TABLE dbo.Feedbacks (
    FeedbackID INT IDENTITY(1,1) PRIMARY KEY,
    
    UserID INT NOT NULL,                -- Người gửi phản hồi
    Title NVARCHAR(200) NOT NULL,       -- Tiêu đề
    Content NVARCHAR(MAX) NOT NULL,     -- Nội dung
    
    Status NVARCHAR(20) DEFAULT 'Pending', -- Trạng thái: Pending (Chờ), Resolved (Đã xử lý)
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Feedbacks_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

CREATE TABLE dbo.ServiceMonthly (
    ServiceID INT IDENTITY(1,1) PRIMARY KEY,
    ServiceName NVARCHAR(100) NOT NULL UNIQUE,  -- Tên dịch vụ
    Price DECIMAL(15, 3) NOT NULL CHECK (Price >= 0), -- Đơn giá
    Descriptions NVARCHAR(200) NULL,             -- Mô tả chi tiết
    
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng lưu trữ hóa đơn hàng tháng
CREATE TABLE dbo.MonthlyBills (
    BillID INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Phân loại hóa đơn
    RoomID INT NULL,           -- Có RoomID -> Hóa đơn chung (Điện, Nước)
    UserID INT NULL,           -- Có UserID -> Hóa đơn riêng (Gửi xe, Gym)
    ServiceID INT NOT NULL,    

    Period NVARCHAR(20) NOT NULL, 
    Status NVARCHAR(20) NOT NULL DEFAULT 'Unpaid', -- Mặc định là Chưa trả
    
    PaymentID INT NULL, -- Khi trả xong, update ID biên lai vào đây
    CreatedAt DATETIME DEFAULT GETDATE(),

    CONSTRAINT FK_Bills_Service FOREIGN KEY (ServiceID) REFERENCES dbo.ServiceMonthly(ServiceID),
    CONSTRAINT FK_Bills_Payment FOREIGN KEY (PaymentID) REFERENCES dbo.ServicePayments(PaymentID),
    CONSTRAINT FK_Bills_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

GO
CREATE TRIGGER TR_Users_UpdateRoomOccupancy
ON dbo.Users
AFTER INSERT, DELETE, UPDATE
AS
BEGIN
    SET NOCOUNT ON; -- trigger im lặng khi chạy - không show (1 row(s) affected)

    -- Giảm số người ở phòng cũ (DELETE hoặc UPDATE)
    UPDATE r
    SET r.Occupancy = r.Occupancy - x.cnt
    FROM dbo.Rooms r
    JOIN (
        SELECT RoomID, COUNT(*) cnt
        FROM deleted
        WHERE RoomID IS NOT NULL
        GROUP BY RoomID
    ) x ON r.RoomID = x.RoomID;

    -- Tăng số người ở phòng mới (INSERT hoặc UPDATE)
    UPDATE r
    SET r.Occupancy = r.Occupancy + x.cnt
    FROM dbo.Rooms r
    JOIN (
        SELECT RoomID, COUNT(*) cnt
        FROM inserted
        WHERE RoomID IS NOT NULL
        GROUP BY RoomID
    ) x ON r.RoomID = x.RoomID;
END;
GO

UPDATE dbo.Users SET Role = 'Admin' WHERE UserID = 1;   -- Để test
INSERT INTO dbo.Users (Email, FullName, [Password], BirthDate, StudentID, ID, ProfilePic)
VALUES ('test@example.com', 'Test1', 'secret123', '2005-04-11', '20235412', '12345', '');

INSERT INTO dbo.ServiceMonthly (ServiceName, Price, Descriptions) 
VALUES 
(N'Phí gửi xe máy', 80000, N'Tính theo tháng'),
(N'Tiền điện', 360000, N'Tính theo tháng'),
(N'Tiền nước', 100000, N'Tính theo tháng'),
(N'Phí dịch vụ', 50000, N'Tính theo tháng'),
(N'Phí wifi',100000, N'Tính theo tháng'),
(N'Vệ sinh chung', 30000, N'Tính theo tháng');

--------------- Test Room -----------------
-- Thêm userID 8 vào phòng 1 full → FAIL
UPDATE Users SET RoomID = 1 WHERE UserID = 8;

-- Chuyển phòng (user 2 chuyển từ phòng 1 sang phòng 2) 4,1 -> 3,2
UPDATE Users SET RoomID = 2 WHERE UserID = 2;
-- Undo:
UPDATE Users SET RoomID = 1 WHERE UserID = 2;
-------------------------------------------

SELECT * FROM Rooms;
SELECT * FROM RoomRequests;
SELECT * FROM Users;
SELECT * FROM Notifications;
SELECT * FROM UserBalance;
SELECT * FROM TopUpTransactions;
SELECT * FROM Feedbacks;
SELECT * FROM ServiceMonthly;

DROP TABLE Notifications;
DROP TABLE UserBalance;
DROP TABLE TopUpTransactions;
DROP TABLE Users;
DROP TABLE Feedbacks;
DROP TABLE ServiceMonthly;