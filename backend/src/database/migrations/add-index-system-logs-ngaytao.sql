-- Add index on NgayTao DESC for tbSystemLogs pagination performance
-- Without this index, ORDER BY NgayTao DESC forces a full 385K-row scan + sort

IF NOT EXISTS (
  SELECT 1 FROM sys.indexes
  WHERE object_id = OBJECT_ID('dbo.tbSystemLogs')
    AND name = 'IX_tbSystemLogs_NgayTao'
)
BEGIN
  CREATE NONCLUSTERED INDEX IX_tbSystemLogs_NgayTao
    ON dbo.tbSystemLogs (NgayTao DESC)
    INCLUDE (NguoiTao, Nguon, HanhDong, DoiTuong);
  PRINT 'Created index IX_tbSystemLogs_NgayTao';
END
ELSE
BEGIN
  PRINT 'Index IX_tbSystemLogs_NgayTao already exists';
END
