-- Migration: SP chi tiết sản lượng nhân viên cho Dashboard popup
-- Ngày tạo: 2026-06-17
-- Mục đích: Trả về từng bản ghi CONGNO theo nhân viên + tháng, dùng cho modal chi tiết sản lượng.
-- Tham số: @NhanVien (nvarchar 250), @Thang (nvarchar 7, định dạng 'yyyy-MM')
-- Yêu cầu trước: cột CONGNO.SanLuong đã tồn tại (add-sanluong-to-congno.sql).
--
-- CÁCH CHẠY: "Execute SQL Script" (DBeaver: Alt+X) — chạy cả file.

IF OBJECT_ID('dbo.SP_Dashboard_SanLuongChiTiet', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_Dashboard_SanLuongChiTiet;
EXEC(N'
CREATE PROCEDURE dbo.SP_Dashboard_SanLuongChiTiet
    @NhanVien nvarchar(250),
    @Thang    nvarchar(7)
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
    ORDER BY NgayGhiNo, CongNo_ID;
END');
