-- Migration: 4 stored procedure tổng hợp cho Dashboard thống kê admin
-- Ngày tạo: 2026-06-06
-- Mục đích: KH mới/ngày, doanh thu/ngày, sản lượng(kg)/ngày, sản lượng NV theo tháng (số đơn + kg).
-- Nguồn: AspNetUsers.NgayTao | DON_HANG (trangthaiOrder='Completed') | CONGNO.SanLuong.
-- Tham số: @TuNgay, @DenNgay (datetime). Run once. Idempotent (DROP + CREATE).
-- Yêu cầu trước: chạy add-ngay-tao-to-asp-net-users.sql; cột CONGNO.SanLuong đã tồn tại.
--
-- GHI CHÚ: KHÔNG dùng 'GO'. Mỗi CREATE PROCEDURE bọc trong EXEC(N'...') để là MỘT câu lệnh
-- (không có ';' ở cấp ngoài) -> chạy được ở mọi client. Dấu nháy đơn bên trong nhân đôi ('' = một ').
--
-- CÁCH CHẠY (DBeaver/TablePlus): chạy CẢ file — "Execute SQL Script" (DBeaver: Alt+X).
--   ĐỪNG bôi đen phần bên trong EXEC('...') rồi chạy riêng — dấu nháy nhân đôi sẽ lỗi near ';'.

-- ===== 1) KH mới theo ngày =====
IF OBJECT_ID('dbo.SP_Dashboard_KhachHangMoiTheoNgay', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_Dashboard_KhachHangMoiTheoNgay;
EXEC(N'
CREATE PROCEDURE dbo.SP_Dashboard_KhachHangMoiTheoNgay
    @TuNgay  datetime,
    @DenNgay datetime
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CAST(NgayTao AS date) AS Ngay,
           COUNT(*)              AS SoKHMoi
    FROM dbo.AspNetUsers
    WHERE NgayTao IS NOT NULL
      AND NgayTao BETWEEN @TuNgay AND @DenNgay
    GROUP BY CAST(NgayTao AS date)
    ORDER BY Ngay;
END');

-- ===== 2) Doanh thu theo ngày (đơn đã hoàn tất) =====
IF OBJECT_ID('dbo.SP_Dashboard_DoanhThuTheoNgay', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_Dashboard_DoanhThuTheoNgay;
EXEC(N'
CREATE PROCEDURE dbo.SP_Dashboard_DoanhThuTheoNgay
    @TuNgay  datetime,
    @DenNgay datetime
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CAST(NgayHoanThanh AS date)  AS Ngay,
           SUM(ISNULL(tongtienVND, 0))  AS DoanhThu,
           COUNT(*)                     AS SoDon
    FROM dbo.DON_HANG
    WHERE DaXoa = 0
      AND trangthaiOrder = ''Completed''
      AND NgayHoanThanh BETWEEN @TuNgay AND @DenNgay
    GROUP BY CAST(NgayHoanThanh AS date)
    ORDER BY Ngay;
END');

-- ===== 3) Sản lượng (kg) theo ngày =====
IF OBJECT_ID('dbo.SP_Dashboard_SanLuongTheoNgay', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_Dashboard_SanLuongTheoNgay;
EXEC(N'
CREATE PROCEDURE dbo.SP_Dashboard_SanLuongTheoNgay
    @TuNgay  datetime,
    @DenNgay datetime
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CAST(NgayGhiNo AS date)     AS Ngay,
           SUM(ISNULL(SanLuong, 0))    AS SanLuongKg
    FROM dbo.CONGNO
    WHERE DaXoa = 0
      AND SanLuong IS NOT NULL
      AND NgayGhiNo BETWEEN @TuNgay AND @DenNgay
    GROUP BY CAST(NgayGhiNo AS date)
    ORDER BY Ngay;
END');

-- ===== 4) Sản lượng NV theo tháng (số đơn + số kg) =====
-- Số đơn: DON_HANG group theo usernamesave + tháng(ngaymuahang).
-- Số kg : CONGNO  group theo NguoiTao    + tháng(NgayGhiNo).
-- usernamesave (DON_HANG) = NguoiTao (CONGNO) -> cùng nhân viên.
IF OBJECT_ID('dbo.SP_Dashboard_SanLuongNhanVienTheoThang', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_Dashboard_SanLuongNhanVienTheoThang;
EXEC(N'
CREATE PROCEDURE dbo.SP_Dashboard_SanLuongNhanVienTheoThang
    @TuNgay  datetime,
    @DenNgay datetime
AS
BEGIN
    SET NOCOUNT ON;
    WITH DonTheoNV AS (
        SELECT usernamesave                    AS NhanVien,
               FORMAT(ngaymuahang, ''yyyy-MM'') AS Thang,
               COUNT(*)                         AS SoDon
        FROM dbo.DON_HANG
        WHERE DaXoa = 0
          AND ngaymuahang BETWEEN @TuNgay AND @DenNgay
        GROUP BY usernamesave, FORMAT(ngaymuahang, ''yyyy-MM'')
    ),
    KgTheoNV AS (
        SELECT NguoiTao                       AS NhanVien,
               FORMAT(NgayGhiNo, ''yyyy-MM'') AS Thang,
               SUM(ISNULL(SanLuong, 0))       AS SanLuongKg
        FROM dbo.CONGNO
        WHERE DaXoa = 0
          AND SanLuong IS NOT NULL
          AND NgayGhiNo BETWEEN @TuNgay AND @DenNgay
        GROUP BY NguoiTao, FORMAT(NgayGhiNo, ''yyyy-MM'')
    )
    SELECT ISNULL(d.NhanVien, k.NhanVien)   AS NhanVien,
           ISNULL(d.Thang, k.Thang)         AS Thang,
           ISNULL(d.SoDon, 0)               AS SoDon,
           ISNULL(k.SanLuongKg, 0)          AS SanLuongKg
    FROM DonTheoNV d
    FULL OUTER JOIN KgTheoNV k
        ON d.NhanVien = k.NhanVien AND d.Thang = k.Thang
    ORDER BY Thang, SoDon DESC, SanLuongKg DESC;
END');
