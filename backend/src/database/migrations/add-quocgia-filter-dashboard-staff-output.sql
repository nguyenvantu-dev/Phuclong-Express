-- Migration: Thêm filter @QuocGiaID (Tuyến) cho 2 SP dashboard "Sản lượng nhân viên theo tháng"
-- Mục đích: trang admin/dashboard cho phép lọc bảng sản lượng nhân viên theo Tuyến (Quốc gia).
--           DON_HANG.QuocGiaID lọc số đơn; CONGNO.QuocGiaID lọc sản lượng (kg) — độc lập nhau
--           giống cách Tuyến được lưu trên từng bảng (xem add-quocgia-to-congno.sql).
-- Trang: admin/dashboard
-- Run once on the target SQL Server database.

IF OBJECT_ID('dbo.SP_Dashboard_SanLuongNhanVienTheoThang', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_Dashboard_SanLuongNhanVienTheoThang;
GO
EXEC(N'
CREATE PROCEDURE dbo.SP_Dashboard_SanLuongNhanVienTheoThang
    @TuNgay     datetime,
    @DenNgay    datetime,
    @QuocGiaID  int = NULL
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
          AND (@QuocGiaID IS NULL OR QuocGiaID = @QuocGiaID)
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
          AND (@QuocGiaID IS NULL OR QuocGiaID = @QuocGiaID)
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
GO

IF OBJECT_ID('dbo.SP_Dashboard_SanLuongChiTiet', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_Dashboard_SanLuongChiTiet;
GO
EXEC(N'
CREATE PROCEDURE dbo.SP_Dashboard_SanLuongChiTiet
    @NhanVien   nvarchar(250),
    @Thang      nvarchar(7),
    @QuocGiaID  int = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
        CAST(NgayGhiNo AS date)     AS NgayGhiNo,
        UserName                    AS KhachHang,
        NoiDung,
        ISNULL(SanLuong, 0)         AS SanLuongKg,
        ISNULL(GhiChu, '''')        AS GhiChu
    FROM dbo.CONGNO
    WHERE DaXoa = 0
      AND SanLuong IS NOT NULL
      AND NguoiTao = @NhanVien
      AND FORMAT(NgayGhiNo, ''yyyy-MM'') = @Thang
      AND (@QuocGiaID IS NULL OR QuocGiaID = @QuocGiaID)
    ORDER BY NgayGhiNo, CongNo_ID;
END');
GO
