-- Migration: Add NgayHoanThanh column to DON_HANG + update SP_CapNhat_MassComplete
-- Mục đích: Lưu ngày hoàn thành khi mass complete đơn hàng ở admin/orders/list
-- Run once on the target SQL Server database.

-- 1) Thêm column NgayHoanThanh (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.DON_HANG')
      AND name = 'NgayHoanThanh'
)
BEGIN
    ALTER TABLE dbo.DON_HANG ADD NgayHoanThanh DATE NULL;
END
GO

-- 2) Cập nhật stored procedure SP_CapNhat_MassComplete để nhận @NgayHoanThanh
--    Nếu không truyền, mặc định = ngày hôm nay (GETDATE)
IF OBJECT_ID('dbo.SP_CapNhat_MassComplete', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_CapNhat_MassComplete;
GO

CREATE PROCEDURE [dbo].[SP_CapNhat_MassComplete]
    @id            NVARCHAR(4000),
    @NgayHoanThanh DATE = NULL
AS
BEGIN TRY
    SET NOCOUNT ON;
    BEGIN TRANSACTION

    DECLARE @ngay DATE = ISNULL(@NgayHoanThanh, CAST(GETDATE() AS DATE));

    UPDATE DON_HANG
    SET trangthaiOrder = 'Completed',
        NgayHoanThanh  = @ngay
    WHERE ID IN (SELECT CAST(s AS INT) FROM dbo.SplitString(@id, ','));

    --UPDATE CONGNO
    --SET DaXoa = 1
    --WHERE DonHang_ID IN (SELECT CAST(s as int) FROM dbo.SplitString(@id, ','))

    COMMIT TRANSACTION
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION

    DECLARE @ErrMsg NVARCHAR(4000), @ErrSeverity INT;
    SELECT @ErrMsg = ERROR_MESSAGE(),
           @ErrSeverity = ERROR_SEVERITY();
    RAISERROR(@ErrMsg, @ErrSeverity, 1);
END CATCH;
GO
