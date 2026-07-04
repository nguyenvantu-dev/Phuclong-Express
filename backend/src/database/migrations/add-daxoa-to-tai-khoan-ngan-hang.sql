-- Migration: Add DaXoa (soft delete) column to TaiKhoanNganHang + update SP_LayTaiKhoanNganHang
-- Mục đích: Danh mục tài khoản ngân hàng (admin/bank-accounts) hiện xoá cứng chưa được hỗ trợ.
--   Bổ sung xoá mềm (DaXoa) để không mất dữ liệu tham chiếu (vd. lịch sử ChuyenKhoan) khi xoá.
-- Idempotent — chạy lại an toàn.

-- 1) Thêm cột DaXoa (bit, mặc định 0)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.TaiKhoanNganHang')
      AND name = 'DaXoa'
)
BEGIN
    ALTER TABLE dbo.TaiKhoanNganHang
        ADD DaXoa bit NOT NULL
        CONSTRAINT DF_TaiKhoanNganHang_DaXoa DEFAULT (0);
END
GO

-- 2) Cập nhật SP_LayTaiKhoanNganHang — loại bỏ tài khoản đã xoá mềm (dropdown ChuyenKhoan/ManageCongNo)
IF OBJECT_ID('dbo.SP_LayTaiKhoanNganHang', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_LayTaiKhoanNganHang;
GO

CREATE PROCEDURE [dbo].[SP_LayTaiKhoanNganHang]
AS
BEGIN
	SELECT * FROM TaiKhoanNganHang WHERE DaXoa = 0
END;
GO
