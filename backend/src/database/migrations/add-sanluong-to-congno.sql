-- Migration: Add SanLuong (kg) column to CONGNO + update CongNo_Insert & SP_CapNhat_CongNo
-- Mục đích: CSKH nhập sản lượng (cân kg) cho loại phát sinh "Cân Kg" (style = 8) vào cột số
--           riêng thay vì ô Ghi chú → cuối tháng tổng hợp (SUM) được qua Excel export.
-- Trang: admin/debt-management
-- Ghi chú: SP_Lay_CongNo1 trả về SELECT CN.* nên TỰ ĐỘNG có cột SanLuong, KHÔNG cần sửa.
-- Run once on the target SQL Server database.

-- 1) Thêm cột SanLuong (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.CONGNO')
      AND name = 'SanLuong'
)
BEGIN
    ALTER TABLE dbo.CONGNO ADD SanLuong FLOAT NULL;
END
GO

-- 2) Cập nhật CongNo_Insert — thêm @SanLuong (DEFAULT NULL để tương thích caller cũ)
IF OBJECT_ID('dbo.CongNo_Insert', 'P') IS NOT NULL
    DROP PROCEDURE dbo.CongNo_Insert;
GO

CREATE PROCEDURE [dbo].[CongNo_Insert]
    @NoiDung nvarchar(100)
    ,@NgayGhiNo date
    ,@DR float
    ,@CR float
    ,@UserName nvarchar(100)
    ,@GhiChu nvarchar(500)
    ,@Status int
    ,@LoHangID int
    ,@NguoiTao nvarchar(250)
    ,@LoaiPhatSinh int
    ,@SanLuong float = NULL          -- MỚI: sản lượng (kg), chỉ có giá trị khi style = 8
AS
BEGIN
    DECLARE @DuocCapNhat int
    EXEC @DuocCapNhat = [SP_KiemTra_DuocCapNhatCongNo] @NgayGhiNo, @UserName

    IF (@DuocCapNhat = 0)
    BEGIN
        INSERT INTO [dbo].[CONGNO]
              ([NoiDung],[NgayGhiNo],[DR],[CR],[UserName]
               ,[GhiChu],[Status],[style], LoHangID, NguoiTao, SanLuong)
            VALUES
            (@NoiDung,@NgayGhiNo,@DR,@CR,@UserName
            ,@GhiChu,@Status,@LoaiPhatSinh,@LoHangID, @NguoiTao, @SanLuong
            )
    END
END;
GO

-- 3) Cập nhật SP_CapNhat_CongNo — thêm @SanLuong + cờ @udSanLuong (theo pattern @ud* sẵn có)
IF OBJECT_ID('dbo.SP_CapNhat_CongNo', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_CapNhat_CongNo;
GO

CREATE PROCEDURE [dbo].[SP_CapNhat_CongNo]
    @CongNo_ID int
    ,@NoiDung nvarchar(100)
    ,@DR float
    ,@CR float
    ,@UserName nvarchar(100)
    ,@GhiChu nvarchar(500)
    ,@Status int
    ,@LoHangID int
    ,@NguoiTao nvarchar(250)
    ,@udNoiDung bit
    ,@udDR bit
    ,@udCR bit
    ,@udUserName bit
    ,@udGhiChu bit
    ,@udStatus bit
    ,@udLoHangID bit
    ,@SanLuong float = NULL           -- MỚI
    ,@udSanLuong bit = 0              -- MỚI: cờ cập nhật cột SanLuong
AS
BEGIN
    DECLARE @usernameOld nvarchar(50)
    DECLARE @NgayGhiNoOld datetime
    SELECT @usernameOld = username, @NgayGhiNoOld = NgayGhiNo FROM CONGNO WHERE CongNo_ID = @CongNo_ID

    DECLARE @DuocCapNhat int
    DECLARE @DuocCapNhatOld int
    EXEC @DuocCapNhat = [SP_KiemTra_DuocCapNhatCongNo] @NgayGhiNoOld, @username
    EXEC @DuocCapNhatOld = [SP_KiemTra_DuocCapNhatCongNo] @NgayGhiNoOld, @usernameOld

    IF ((@DuocCapNhat = 0) AND (@DuocCapNhatOld = 0))
    BEGIN
        UPDATE CONGNO
        SET
        NoiDung = (CASE WHEN @udNoiDung = 1 THEN @NoiDung ELSE NoiDung END)
        ,[DR] = (CASE WHEN @udDR = 1 THEN @DR ELSE [DR] END)
        ,[CR] = (CASE WHEN @udCR = 1 THEN @CR ELSE [CR] END)
        ,[UserName] = (CASE WHEN @udUserName = 1 THEN @UserName ELSE [UserName] END)
        ,[GhiChu] = (CASE WHEN @udGhiChu = 1 THEN @GhiChu ELSE [GhiChu] END)
        ,[Status] = (CASE WHEN @udStatus = 1 THEN @Status ELSE [Status] END)
        ,[LoHangID] = (CASE WHEN @udLoHangID = 1 THEN @LoHangID ELSE [LoHangID] END)
        ,[SanLuong] = (CASE WHEN @udSanLuong = 1 THEN @SanLuong ELSE [SanLuong] END)   -- MỚI
        , NgayCapNhatCuoi = GETDATE()
        , NguoiCapNhatCuoi = @NguoiTao
        WHERE CongNo_ID = @CongNo_ID
    END
END;
GO
