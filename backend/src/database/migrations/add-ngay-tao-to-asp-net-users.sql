-- Migration: Add NgayTao column to AspNetUsers + backfill from tbSystemLogs
-- Ngày tạo: 2026-06-06
-- Mục đích: phục vụ thống kê "KH mới/ngày" trên dashboard admin.
--   AspNetUsers vốn KHÔNG có cột ngày tạo. Ngày tạo lịch sử suy ra từ log tạo user
--   (tbSystemLogs, Nguon='CreateNewUser') do cả app v2 và app C# cũ ghi.
--   User tạo mới về sau tự lấy GETDATE() qua DEFAULT (không cần sửa code insert).
--
-- CÁCH CHẠY (DBeaver/TablePlus): chạy CẢ file — "Execute SQL Script" (DBeaver: Alt+X).
--   Đừng bôi đen từng dòng. 2 câu lệnh dưới chạy lần lượt; backfill chạy sau khi cột đã thêm.
-- Idempotent — chạy lại an toàn.

-- 1) Thêm cột NgayTao + DEFAULT getdate() (idempotent)
--    Cột nullable: hàng cũ = NULL (backfill ở bước 2); insert mới (bỏ trống cột) = GETDATE().
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.AspNetUsers')
      AND name = 'NgayTao'
)
    ALTER TABLE dbo.AspNetUsers
        ADD NgayTao datetime NULL
        CONSTRAINT DF_AspNetUsers_NgayTao DEFAULT (GETDATE());

-- 2) Backfill ngày tạo cho user hiện hữu (chỉ hàng đang NULL).
--    Log lưu username TRONG cột NoiDung dạng:  'UserName: <name>; HoTen: ...'  (DoiTuong để rỗng)
--    -> parse <name> giữa 'UserName: ' (10 ký tự) và dấu ';' đầu tiên. MIN(NgayTao) = sớm nhất.
;WITH Parsed AS (
    SELECT
        LTRIM(RTRIM(SUBSTRING(NoiDung, 11, CHARINDEX(';', NoiDung + ';') - 11))) AS UserName,
        NgayTao
    FROM dbo.tbSystemLogs
    WHERE Nguon = 'CreateNewUser'
      AND NoiDung LIKE 'UserName: %'
),
FirstCreate AS (
    SELECT UserName, MIN(NgayTao) AS NgayTaoLog
    FROM Parsed
    WHERE UserName <> ''
    GROUP BY UserName
)
UPDATE u
SET u.NgayTao = f.NgayTaoLog
FROM dbo.AspNetUsers u
INNER JOIN FirstCreate f ON u.UserName = f.UserName
WHERE u.NgayTao IS NULL;

-- LƯU Ý: user tạo trước khi hệ thống bắt đầu ghi log 'CreateNewUser' -> không có bản ghi
-- tương ứng -> NgayTao vẫn NULL. SP thống kê lọc theo NgayTao nên các user NULL không bị
-- tính vào bất kỳ ngày nào (chấp nhận, không backfill được).
