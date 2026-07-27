-- Migration: Add QuocGiaID (Tuyến) column to CONGNO + update CongNo_Insert,
--            SP_CapNhat_CongNo, SP_Lay_CongNo1
-- Mục đích: Tuyến trước đây chỉ được suy diễn qua CONGNO.DonHang_ID -> Don_Hang -> tbQuocGia,
--           nên chỉ có giá trị khi công nợ gắn với đơn hàng. Công nợ tạo tay/import Excel
--           (DonHang_ID = NULL) không có cách nhập Tuyến. Thêm cột QuocGiaID (FK tbQuocGia)
--           để kế toán tự chọn Tuyến, KHÔNG còn suy diễn từ đơn hàng nữa (Tuyến giờ luôn lấy
--           từ CONGNO.QuocGiaID do người dùng tự chọn/import — độc lập hoàn toàn với đơn hàng).
-- Trang: admin/debt-management, admin/debt-management/import
-- Ghi chú: OrderNumber (mã đơn hàng) vẫn suy diễn qua Don_Hang như cũ; chỉ Tuyến là đổi.
-- Run once on the target SQL Server database.

-- 1) Thêm cột QuocGiaID (idempotent)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.CONGNO')
      AND name = 'QuocGiaID'
)
BEGIN
    ALTER TABLE dbo.CONGNO ADD QuocGiaID INT NULL;
END
GO

-- 2) Cập nhật CongNo_Insert — thêm @QuocGiaID (DEFAULT NULL để tương thích caller cũ)
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
    ,@SanLuong float = NULL
    ,@QuocGiaID int = NULL          -- MỚI: Tuyến, chọn độc lập với đơn hàng
AS
BEGIN
    DECLARE @DuocCapNhat int
    EXEC @DuocCapNhat = [SP_KiemTra_DuocCapNhatCongNo] @NgayGhiNo, @UserName

    IF (@DuocCapNhat = 0)
    BEGIN
        INSERT INTO [dbo].[CONGNO]
              ([NoiDung],[NgayGhiNo],[DR],[CR],[UserName]
               ,[GhiChu],[Status],[style], LoHangID, NguoiTao, SanLuong, QuocGiaID)
            VALUES
            (@NoiDung,@NgayGhiNo,@DR,@CR,@UserName
            ,@GhiChu,@Status,@LoaiPhatSinh,@LoHangID, @NguoiTao, @SanLuong, @QuocGiaID
            )
    END
END;
GO

-- 3) Cập nhật SP_CapNhat_CongNo — thêm @QuocGiaID + cờ @udQuocGiaID (theo pattern @ud* sẵn có)
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
    ,@SanLuong float = NULL
    ,@udSanLuong bit = 0
    ,@QuocGiaID int = NULL           -- MỚI
    ,@udQuocGiaID bit = 0            -- MỚI: cờ cập nhật cột QuocGiaID
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
        ,[SanLuong] = (CASE WHEN @udSanLuong = 1 THEN @SanLuong ELSE [SanLuong] END)
        ,[QuocGiaID] = (CASE WHEN @udQuocGiaID = 1 THEN @QuocGiaID ELSE [QuocGiaID] END)   -- MỚI
        , NgayCapNhatCuoi = GETDATE()
        , NguoiCapNhatCuoi = @NguoiTao
        WHERE CongNo_ID = @CongNo_ID
    END
END;
GO

-- 4) Cập nhật SP_Lay_CongNo1 — Tuyến lấy trực tiếp từ CN.QuocGiaID, không còn suy diễn từ đơn hàng
IF OBJECT_ID('dbo.SP_Lay_CongNo1', 'P') IS NOT NULL
    DROP PROCEDURE dbo.SP_Lay_CongNo1;
GO

CREATE PROCEDURE [dbo].[SP_Lay_CongNo1]
	@username nvarchar(100)
	,@status int
	,@LoaiPhatSinh nvarchar(50)
	,@NoiDungTim nvarchar(250)
	,@PageSize int
	,@PageNum int
	,@TuNgay nvarchar(15)
	,@DenNgay nvarchar(15)
AS
BEGIN
	CREATE TABLE #MyPage(CongNo_ID int);
    DECLARE @selectitem int;
    DECLARE @start int;
    DECLARE @run int;
    SET @start=(@PageNum - 1)*@PageSize+1;
    SET @run=0;

	DECLARE @Sql nvarchar(MAX);
    SET @Sql = 'DECLARE RS SCROLL CURSOR FOR ';

	SET @Sql = @Sql + ' SELECT CongNo_ID FROM CONGNO WHERE DaXoa = 0 '

	IF(@UserName <> '')
	BEGIN
		SET @Sql = @Sql + ' AND username = ''' + @username + ''''
	END

	IF(@status <> -1)
	BEGIN
		SET @Sql = @Sql + ' AND status = ' + CAST(@status as nvarchar(2))
	END

	IF(@LoaiPhatSinh <> '')
	BEGIN
		SET @Sql = @Sql + ' AND style in (' + @LoaiPhatSinh + ')'
	END

	IF(@NoiDungTim <> '')
	BEGIN
		SET @Sql = @Sql + ' AND ((DonHang_ID like ''%' + @NoiDungTim + '%'') OR (NoiDung like ''%' + @NoiDungTim + '%'') OR (GhiChu like ''%' + @NoiDungTim + '%''))'
	END

	IF(@TuNgay <> '')
	BEGIN
		SET @Sql = @Sql + ' AND NgayGhiNo >= ''' + @TuNgay + ''''
	END

	IF(@DenNgay <> '')
	BEGIN
		SET @Sql = @Sql + ' AND NgayGhiNo <= ''' + @DenNgay+ ''''
	END

	SET @Sql = @Sql + ' ORDER BY CongNo_ID desc'

	--select @Sql

	EXEC sp_executesql @Sql;

	OPEN RS
	--return total record
	SELECT @@CURSOR_ROWS AS TOTALROW;
	---------
	FETCH ABSOLUTE @start FROM RS INTO @selectitem
	WHILE(@@FETCH_STATUS <> -1 and @run < @PageSize)
	BEGIN
		INSERT INTO #MyPage(CongNo_ID) VALUES(@selectitem)
		SET @run=@run+1;
		FETCH NEXT FROM RS INTO @selectitem
	END
	CLOSE RS
	DEALLOCATE RS

	-- Tuyến: lấy trực tiếp từ CN.QuocGiaID (người dùng tự chọn/import), không suy diễn từ đơn hàng
	SELECT CN.*, LH.TenLoHang, DH.ordernumber AS OrderNumber, QG_Own.TenQuocGia AS Tuyen
	FROM CONGNO CN
	INNER JOIN #MyPage ON CN.CongNo_ID = #MyPage.CongNo_ID
	LEFT JOIN tbLoHang LH ON CN.LoHangID = LH.LoHangID
	LEFT JOIN Don_Hang DH ON CN.DonHang_ID = DH.ID
	LEFT JOIN tbQuocGia QG_Own ON CN.QuocGiaID = QG_Own.QuocGiaID
	ORDER BY CN.CongNo_ID desc
END;
GO
