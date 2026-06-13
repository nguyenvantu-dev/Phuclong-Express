-- Data repair: khôi phục HienTai=1 cho các dòng nợ "Phí mua" SỐNG bị hạ cờ sai
-- ---------------------------------------------------------------------------
-- Bối cảnh: đơn hàng còn sống (Ordered/Shipped/Completed) bị nhảy trạng thái
--   dồn dập (vd: Ordered->Received->Shipped->Ordered) + mass op xen vào, khiến
--   dòng "Phí mua" gốc bị UPDATE HienTai=0 (SP_CapNhatDonHang nhánh Received/
--   Cancelled, note.txt L2953) NHƯNG giữ DaXoa=0; còn các dòng đảo/tạo lại thì
--   bị DaXoa=1. Kết cục: KHÔNG còn dòng HienTai=1 -> báo cáo (lọc HienTai=1) bỏ
--   sót nợ thật, trong khi danh sách (lọc DaXoa=0) vẫn hiển thị đúng.
-- Phát hiện: query NOT EXISTS(HienTai=1) trên đơn Ordered/Shipped/Completed.
-- Tổng ảnh hưởng: 8 đơn / 6 khách / ~9.461.964 VND nợ bị giấu khỏi báo cáo.
-- An toàn: các CongNo_ID này đã được xác nhận KHÔNG có sibling HienTai=1 -> set
--   HienTai=1 khôi phục đúng 1 bản hiện hành, không tạo trùng.
-- Lưu ý: chạy SAU khi đã COMMIT fix HP2896 (60193, 60581) và xác nhận đúng.
-- LƯU Ý NGHIỆP VỤ: việc này LÀM TĂNG nợ báo cáo của khách -> rà với kế toán.
-- Chạy trong DBeaver, GO-free, bọc transaction tự kiểm tra trước khi COMMIT.

BEGIN TRAN;

-- (a) Kiểm tra: các đơn dưới đây phải KHÔNG có dòng HienTai=1 (kỳ vọng: 0 dòng)
SELECT DonHang_ID, COUNT(*) AS SoBanHienHanh
FROM CONGNO
WHERE DonHang_ID IN (29958, 36871, 36872, 34898, 769, 13194)
  AND HienTai = 1 AND DaXoa = 0
GROUP BY DonHang_ID;

-- (b) Kiểm tra net các dòng SỐNG (DaXoa=0) mỗi đơn = đúng số Phí mua, KHÔNG = 0
--     (nếu = 0 nghĩa là có dòng đảo sống triệt tiêu -> KHÔNG repair đơn đó)
SELECT DonHang_ID, SUM(CanDoi) AS NetSong, COUNT(*) AS SoDongSong
FROM CONGNO
WHERE DonHang_ID IN (29958, 36871, 36872, 34898, 769, 13194)
  AND DaXoa = 0
GROUP BY DonHang_ID;

-- (c) Repair: 6 dòng nợ sống bị hạ cờ sai (trừ HP2896 đã xử lý riêng)
--     HP1128/29958=88900, HP176/36871=111416, HP176/36872=111417,
--     HP2830/34898=105996, HP395/769=3581, HP395/13194=41073
UPDATE CONGNO SET HienTai = 1
WHERE CongNo_ID IN (88900, 111416, 111417, 105996, 3581, 41073)
  AND HienTai = 0 AND DaXoa = 0;
-- kỳ vọng: 6 rows affected

-- Soi (a)(b)(c) hợp lý thì COMMIT; bất thường thì ROLLBACK
-- COMMIT;
-- ROLLBACK;
