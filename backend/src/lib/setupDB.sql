CREATE DATABASE CNPM;

CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,       -- Auto-increment unique ID
    Email NVARCHAR(50) NOT NULL UNIQUE,         -- Email must be unique and required
    FullName NVARCHAR(30) NOT NULL,             -- Required full name
    [Password] NVARCHAR(100) NOT NULL CHECK (LEN([Password]) >= 6),  -- Required, min length 6
    BirthDate DATE NOT NULL,                    -- Required birthdate (YYYY-MM-DD)
    StudentID NVARCHAR(20) NOT NULL UNIQUE,     -- Required student ID (MSSV)
    ID NVARCHAR(20) NOT NULL UNIQUE,            -- Required ID Number (Số CCCD)
    ProfilePic NVARCHAR(100) NULL DEFAULT (''), -- Optional, defaults to empty string
    Role NVARCHAR(10) NOT NULL DEFAULT 'User'
);

CREATE TABLE dbo.Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,   -- ID thông báo tăng tự động

    UserID INT NOT NULL,

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
    ServiceName NVARCHAR(100) NOT NULL, -- Tiền điện, Tiền nước, Phí xe, Phí quản lý
    Description NVARCHAR(150) NULL,

    Amount DECIMAL(15, 3) NOT NULL CHECK (Amount > 0),

    Status NVARCHAR(20) NOT NULL DEFAULT 'Paid',
    -- Paid | Failed | Refunded

    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT FK_Payment_User FOREIGN KEY (UserID) REFERENCES dbo.Users(UserID)
);

UPDATE dbo.Users SET Role = 'Admin' WHERE UserID = 1;   -- Để test
INSERT INTO dbo.Users (Email, FullName, [Password], BirthDate, StudentID, ID, ProfilePic)
VALUES ('test@example.com', 'Test1', 'secret123', "2005-04-11", '20235412', '12345', '');


SELECT * FROM Users;
SELECT * FROM Notifications;
SELECT * FROM UserBalance;
SELECT * FROM TopUpTransactions;
SELECT * FROM ServicePayments;

DROP TABLE Notifications;
DROP TABLE UserBalance;
DROP TABLE TopUpTransactions;
DROP TABLE ServicePayments;
DROP TABLE Users;