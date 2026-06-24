-- Migration: fix-sp-baocao-chitiet-congno-luyke-performance
-- Date: 2026-06-22
-- Fix: SP_BaoCao_ChiTietCongNo1 - thay triangular self-join O(N²) bằng window function O(N)
--
-- Nguyên nhân chậm:
--   Tính LuyKe bằng self-join CTE với điều kiện t1.STT <= t2.STT
--   → N bản ghi = N*(N+1)/2 phép tính (500 rows = 125.250 phép)
--   → User có nhiều công nợ + chọn "tất cả kỳ" → 1-2 phút
--
-- Fix:
--   Dùng SUM(...) OVER (... ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING)
--   → O(N), thêm ROUND(..., 0) để tránh floating-point drift từ kiểu float

-- Step 1: Index covering cho các filter thường gặp
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'IX_CONGNO_User_NgayGhiNo'
      AND object_id = OBJECT_ID('CONGNO')
)
BEGIN
    CREATE INDEX IX_CONGNO_User_NgayGhiNo
    ON CONGNO (UserName, NgayGhiNo, DaXoa, [Status])
    INCLUDE (CanDoi, CongNo_ID);
END;
GO

-- Step 2: Cập nhật stored procedure
ALTER PROCEDURE [dbo].[SP_BaoCao_ChiTietCongNo1]
    @username  nvarchar(100)
   ,@TuKyID   int
   ,@DenKyID  int
   ,@PageSize  int
   ,@PageNum   int
AS
BEGIN
    SET QUERY_GOVERNOR_COST_LIMIT 0;

    DECLARE @NgayBatDau    datetime;
    DECLARE @NgayKetThuc   datetime;
    DECLARE @SoDauKy       float;
    DECLARE @DaDong        bit;
    DECLARE @TenKy         int;

    IF (@TuKyID = -1)
    BEGIN
        SET @NgayBatDau = '1900-01-01';
        SET @SoDauKy    = 0;
    END
    ELSE
    BEGIN
        SELECT @NgayBatDau = Ky.NgayDauKy,
               @SoDauKy    = ISNULL(CK.DauKy, 0),
               @DaDong     = DaDong,
               @TenKy      = TenKy
        FROM   tbKy Ky
        LEFT JOIN tbChotKy CK ON Ky.KyID = CK.KyID AND UserName = @username
        WHERE  Ky.KyID = @TuKyID;

        IF (@DaDong = 0)
        BEGIN
            DECLARE @KyIDDaDongGanNhat        int;
            DECLARE @ThangKyDaDongGanNhat     int;
            DECLARE @NamKyDaDongGanNhat       int;
            DECLARE @TenKyDaDongGanNhat       int;
            DECLARE @NgayCuoiKyDaDongGanNhat  datetime;
            DECLARE @SoCuoiKyDaDongGanNhat    float;

            SELECT @KyIDDaDongGanNhat       = Ky.KyID,
                   @ThangKyDaDongGanNhat    = Ky.Thang,
                   @NamKyDaDongGanNhat      = Ky.Nam,
                   @TenKyDaDongGanNhat      = Ky.TenKy,
                   @NgayCuoiKyDaDongGanNhat = Ky.NgayCuoiKy,
                   @SoCuoiKyDaDongGanNhat   = ISNULL(CK.CuoiKy, 0)
            FROM   tbKy Ky
            LEFT JOIN tbChotKy CK ON Ky.KyID = CK.KyID AND UserName = @username
            WHERE  Ky.KyID = (
                SELECT TOP 1 KyID FROM tbKy
                WHERE DaDong = 1 AND TenKy < @TenKy
                ORDER BY TenKy DESC
            );

            IF (@KyIDDaDongGanNhat IS NULL)
            BEGIN
                SELECT @SoDauKy = ISNULL(SUM(CanDoi), 0)
                FROM   [CONGNO]
                WHERE  DaXoa = 0 AND [Status] = 1
                  AND  [UserName] = @username
                  AND  NgayGhiNo <= @NgayBatDau;
            END
            ELSE
            BEGIN
                SELECT @SoDauKy = @SoCuoiKyDaDongGanNhat + ISNULL(SUM(CanDoi), 0)
                FROM   [CONGNO]
                WHERE  DaXoa = 0 AND [Status] = 1
                  AND  [UserName] = @username
                  AND  NgayGhiNo >  @NgayCuoiKyDaDongGanNhat
                  AND  NgayGhiNo <= @NgayBatDau;
            END
        END
    END

    IF (@TuKyID = -1)
        SET @NgayKetThuc = '2900-01-01';
    ELSE
        SELECT @NgayKetThuc = NgayCuoiKy FROM tbKy WHERE KyID = @DenKyID;

    -- Result 1: tổng số dòng
    SELECT COUNT(*) AS TOTALROW
    FROM   [CONGNO]
    WHERE  DaXoa = 0 AND [Status] = 1
      AND  [UserName] = @username
      AND  NgayGhiNo >= @NgayBatDau
      AND  NgayGhiNo <= @NgayKetThuc;

    -- Result 2: chi tiết có phân trang + LuyKe
    -- FIX: window function thay thế triangular self-join O(N²)
    -- ROUND(..., 0) tránh floating-point drift do cột CanDoi kiểu float
    WITH cte_CongNos AS (
        SELECT
            ROW_NUMBER() OVER (
                ORDER BY CONVERT(date, NgayGhiNo) DESC, CongNo_ID DESC
            ) AS STT
           ,CongNo_ID
           ,NgayGhiNo
           ,ROUND(
                SUM(CanDoi) OVER (
                    ORDER BY CONVERT(date, NgayGhiNo) DESC, CongNo_ID DESC
                    ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING
                ) + @SoDauKy
            , 0) AS LuyKe
        FROM [CONGNO]
        WHERE DaXoa = 0 AND [Status] = 1
          AND [UserName] = @username
          AND NgayGhiNo >= @NgayBatDau
          AND NgayGhiNo <= @NgayKetThuc
    )
    SELECT
        CN.CongNo_ID, CN.NgayGhiNo, CN.NoiDung,
        CN.DR, CN.CR, CTE.LuyKe, CN.GhiChu
    FROM cte_CongNos CTE
    INNER JOIN [CONGNO] CN ON CTE.CongNo_ID = CN.CongNo_ID
    WHERE CTE.STT BETWEEN (@PageNum - 1) * @PageSize + 1
                      AND (@PageNum - 1) * @PageSize + @PageSize
    ORDER BY CTE.STT;

    -- Result 3: cân đối (Loai A/B/C/F)
    SELECT 'A' AS Loai, SUM(DR) AS SoTien
    FROM   [CONGNO] CN
    LEFT JOIN Don_Hang DH ON CN.DonHang_ID = DH.ID
    WHERE  CN.DaXoa = 0 AND CN.username = @username
      AND  ([Status] = 1)
      AND  (trangthaiorder IN ('Ordered', 'Completed', 'Shipped') OR trangthaiorder IS NULL)
    UNION
    SELECT 'B' AS Loai, SUM(CR) AS SoTien
    FROM   [CONGNO] CN
    WHERE  CN.DaXoa = 0 AND CN.username = @username AND [Status] = 1
    UNION
    SELECT 'C' AS Loai, SUM(DR) AS SoTien
    FROM   [CONGNO] CN
    LEFT JOIN Don_Hang DH ON CN.DonHang_ID = DH.ID
    WHERE  CN.DaXoa = 0 AND CN.username = @username
      AND  [Status] = 1 AND trangthaiorder = 'Completed'
    UNION
    SELECT 'F' AS Loai, SUM(DR) AS SoTien
    FROM   [CONGNO] CN
    LEFT JOIN Don_Hang DH ON CN.DonHang_ID = DH.ID
    WHERE  CN.DaXoa = 0 AND CN.username = @username
      AND  [Status] = 1 AND trangthaiorder = 'Ordered';

    -- Result 4: tổng kết kỳ
    SELECT
        @SoDauKy                            AS DauKy
       ,ISNULL(SUM(DR),     0)              AS TongPhatSinh
       ,ISNULL(SUM(CR),     0)              AS TongThanhToan
       ,@SoDauKy + ISNULL(SUM(CanDoi), 0)  AS CuoiKy
    FROM [CONGNO]
    WHERE DaXoa = 0 AND [Status] = 1
      AND [UserName] = @username
      AND NgayGhiNo >= @NgayBatDau
      AND NgayGhiNo <= @NgayKetThuc;
END;
GO
