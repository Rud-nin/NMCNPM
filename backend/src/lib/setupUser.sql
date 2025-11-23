CREATE DATABASE CNPM;

CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,   -- Auto-increment unique ID
    Email NVARCHAR(50) NOT NULL UNIQUE,     -- Email must be unique and required
    FullName NVARCHAR(30) NOT NULL,         -- Required full name
    [Password] NVARCHAR(100) NOT NULL CHECK (LEN([Password]) >= 6),  -- Required, min length 6
    BirthDate DATE NOT NULL,                -- Required birthdate (YYYY-MM-DD)
    StudentID NVARCHAR(20) NOT NULL UNIQUE,        -- Required student ID (MSSV)
    ID NVARCHAR(20) NOT NULL UNIQUE,               -- Required ID Number (Số CCCD)
    ProfilePic NVARCHAR(100) NULL DEFAULT (''),  -- Optional, defaults to empty string
    Role NVARCHAR(10) NOT NULL DEFAULT 'User'
);

CREATE TABLE dbo.Notifications (
    NotificationID INT IDENTITY(1,1) PRIMARY KEY,--ID thông báo tăng tự động
    Title NVARCHAR(100) NOT NULL,--Tiêu đề thông báo
    Content NVARCHAR(MAX) NOT NULL, --Nội dung thông báo
    CreatedBy INT NOT NULL, -- Admin nào tạo thông báo này(Lưu UserID của admin tạo thông báo)
    CreatedAt DATETIME DEFAULT GETDATE(),--Thời gian tạo
    
    -- Foreign Key: Link tới người tạo (Admin)
    CONSTRAINT FK_Notifications_User FOREIGN KEY (CreatedBy) REFERENCES dbo.Users(UserID)
);

UPDATE dbo.Users SET Role = 'Admin' WHERE UserID = 1; --Để test
INSERT INTO dbo.Users (Email, FullName, [Password], BirthDate, StudentID, ID, ProfilePic)
VALUES ('test@example.com', 'Test1', 'secret123', "2005-04-11", '20235412', '12345', '');

SELECT * FROM Users