-- Indexes for tbTracking and tbChiTietTracking
-- Improves SP_Lay_Tracking cursor open time and correlated subquery

-- Main filter + ORDER BY (covers most list queries)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tbTracking_DaXoa_NgayDatHang' AND object_id = OBJECT_ID('dbo.tbTracking'))
    CREATE INDEX IX_tbTracking_DaXoa_NgayDatHang ON dbo.tbTracking (DaXoa, NgayDatHang DESC, TrackingID DESC);

-- UserName filter
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tbTracking_UserName' AND object_id = OBJECT_ID('dbo.tbTracking'))
    CREATE INDEX IX_tbTracking_UserName ON dbo.tbTracking (UserName, DaXoa);

-- TinhTrang filter
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tbTracking_TinhTrang' AND object_id = OBJECT_ID('dbo.tbTracking'))
    CREATE INDEX IX_tbTracking_TinhTrang ON dbo.tbTracking (TinhTrang, DaXoa);

-- QuocGiaID filter
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tbTracking_QuocGiaID' AND object_id = OBJECT_ID('dbo.tbTracking'))
    CREATE INDEX IX_tbTracking_QuocGiaID ON dbo.tbTracking (QuocGiaID, DaXoa);

-- Date range filter
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tbTracking_NgayDatHang' AND object_id = OBJECT_ID('dbo.tbTracking'))
    CREATE INDEX IX_tbTracking_NgayDatHang ON dbo.tbTracking (NgayDatHang, DaXoa);

-- searchByCode: lookup by TrackingNumber / OrderNumber
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tbTracking_TrackingNumber' AND object_id = OBJECT_ID('dbo.tbTracking'))
    CREATE INDEX IX_tbTracking_TrackingNumber ON dbo.tbTracking (TrackingNumber, DaXoa);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tbTracking_OrderNumber' AND object_id = OBJECT_ID('dbo.tbTracking'))
    CREATE INDEX IX_tbTracking_OrderNumber ON dbo.tbTracking (OrderNumber, DaXoa);

-- Correlated subquery: COUNT(*) FROM tbChiTietTracking WHERE TrackingID = ...
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tbChiTietTracking_TrackingID' AND object_id = OBJECT_ID('dbo.tbChiTietTracking'))
    CREATE INDEX IX_tbChiTietTracking_TrackingID ON dbo.tbChiTietTracking (TrackingID);

-- tbTinhTrangTracking: lookup by TrackingID + sort by NgayTao
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tbTinhTrangTracking_TrackingID_NgayTao' AND object_id = OBJECT_ID('dbo.tbTinhTrangTracking'))
    CREATE INDEX IX_tbTinhTrangTracking_TrackingID_NgayTao ON dbo.tbTinhTrangTracking (TrackingID, NgayTao DESC);
