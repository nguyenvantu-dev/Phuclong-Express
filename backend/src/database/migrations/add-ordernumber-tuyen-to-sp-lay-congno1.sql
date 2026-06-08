-- Migration: Thêm Order number + Tuyến (Quốc gia) vào SP_Lay_CongNo1
-- Mục đích: Bộ phận admin kế toán cần thấy mã đơn hàng (ordernumber) và tuyến (quốc gia)
--           trong trang Quản lý công nợ để đối chiếu. CONGNO chỉ lưu DonHang_ID (int) nên
--           SELECT cuối của SP phải LEFT JOIN Don_Hang (lấy ordernumber) và tbQuocGia
--           (lấy TenQuocGia qua DonHang.QuocGiaID).
-- Trang: admin/debt-management
-- Ghi chú: Chỉ thêm 2 cột vào SELECT cuối + 2 LEFT JOIN; phần phân trang/cursor giữ nguyên.
--          Dòng công nợ thủ công (DonHang_ID = NULL) → OrderNumber/Tuyen = NULL (LEFT JOIN).
-- Run once on the target SQL Server database.

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

	-- MỚI: LEFT JOIN Don_Hang (OrderNumber) + tbQuocGia (Tuyến) theo DonHang_ID
	SELECT CN.*, LH.TenLoHang, DH.ordernumber AS OrderNumber, QG.TenQuocGia AS Tuyen
	FROM CONGNO CN
	INNER JOIN #MyPage ON CN.CongNo_ID = #MyPage.CongNo_ID
	LEFT JOIN tbLoHang LH ON CN.LoHangID = LH.LoHangID
	LEFT JOIN Don_Hang DH ON CN.DonHang_ID = DH.ID
	LEFT JOIN tbQuocGia QG ON DH.QuocGiaID = QG.QuocGiaID
	ORDER BY CN.CongNo_ID desc
END;
GO
