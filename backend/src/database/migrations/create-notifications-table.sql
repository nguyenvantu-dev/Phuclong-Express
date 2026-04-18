-- Migration: Create Notifications table
-- Run this script once on the MSSQL database before deploying the notifications module.

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'Notifications' AND xtype = 'U')
BEGIN
  CREATE TABLE Notifications (
    Id        INT            IDENTITY(1,1) PRIMARY KEY,
    UserName  NVARCHAR(100)  NOT NULL,
    Title     NVARCHAR(255)  NOT NULL,
    Message   NVARCHAR(MAX)  NOT NULL,
    Type      NVARCHAR(50)   NOT NULL CONSTRAINT DF_Notifications_Type DEFAULT 'info',
    IsRead    BIT            NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT 0,
    CreatedAt DATETIME       NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100)  NULL,
    RefType   NVARCHAR(50)   NULL,
    RefId     NVARCHAR(100)  NULL
  );

  CREATE INDEX IX_Notifications_UserName_IsRead ON Notifications (UserName, IsRead);
  CREATE INDEX IX_Notifications_CreatedAt       ON Notifications (CreatedAt DESC);

  PRINT 'Notifications table created successfully.';
END
ELSE
BEGIN
  PRINT 'Notifications table already exists — skipping.';
END
