-- Migration: Create TY_GIA_HISTORY table
-- Run once on the MSSQL database to enable exchange rate change tracking.

IF NOT EXISTS (SELECT * FROM sysobjects WHERE name = 'TY_GIA_HISTORY' AND xtype = 'U')
BEGIN
  CREATE TABLE dbo.TY_GIA_HISTORY (
    Id             INT            IDENTITY(1,1) PRIMARY KEY,
    Name           NVARCHAR(20)   NOT NULL,
    TyGiaVND       FLOAT          NOT NULL,
    CongShipVeVN   FLOAT          NOT NULL,
    NguoiCapNhat   NVARCHAR(100)  NULL,
    NgayCapNhat    DATETIME       NOT NULL CONSTRAINT DF_TyGiaHistory_NgayCapNhat DEFAULT GETDATE()
  );

  CREATE INDEX IX_TyGiaHistory_Name           ON dbo.TY_GIA_HISTORY (Name);
  CREATE INDEX IX_TyGiaHistory_NgayCapNhat    ON dbo.TY_GIA_HISTORY (NgayCapNhat DESC);

  PRINT 'TY_GIA_HISTORY table created successfully.';
END
ELSE
BEGIN
  PRINT 'TY_GIA_HISTORY table already exists — skipping.';
END
