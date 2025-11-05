CREATE DATABASE CNPM;

CREATE TABLE dbo.Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,   -- Auto-increment unique ID
    Email NVARCHAR(50) NOT NULL UNIQUE,     -- Email must be unique and required
    FullName NVARCHAR(30) NOT NULL,         -- Required full name
    [Password] NVARCHAR(100) NOT NULL CHECK (LEN([Password]) >= 6),  -- Required, min length 6
    BirthDate DATE NOT NULL,                -- Required birthdate (YYYY-MM-DD)
    StudentID NVARCHAR(20) NOT NULL UNIQUE,        -- Required student ID (MSSV)
    ID NVARCHAR(20) NOT NULL UNIQUE,               -- Required ID Number (Số CCCD)
    ProfilePic NVARCHAR(100) NULL DEFAULT ('')  -- Optional, defaults to empty string
);

INSERT INTO dbo.Users (Email, FullName, [Password], BirthDate, StudentID, ID, ProfilePic)
VALUES ('test@example.com', 'Test1', 'secret123', "2005-04-11", '20235412', '12345', '');

SELECT * FROM Users