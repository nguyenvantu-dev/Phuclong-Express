import { IsBooleanString, IsOptional, IsString } from 'class-validator';

/**
 * DTO for tracking import endpoint
 *
 * Converted from Tracking_Import.aspx.cs
 * Excel column layout (matches ImportTrackingTemplate.xlsx, header row marker = "$START$"):
 *   B: Số tracking | C: Quốc gia | D: Khách hàng | E: Order number
 *   F: Ngày đặt hàng | G: Tên nhà vận chuyển | H: Tình trạng
 *   I: Ghi chú | J: Kiện | K: Mawb | L: Hawb | M: Ghi chú lô hàng
 */
export class ImportTrackingDto {
  @IsString()
  sheetName: string;

  /** '1' = edit existing tracking (lookup by TrackingNumber); '0' or undefined = create new */
  @IsOptional()
  @IsString()
  mode?: string;

  /** 'true' = persist rows without errors; otherwise dry-run preview */
  @IsOptional()
  @IsBooleanString()
  commit?: string;

  /**
   * For edit mode (m=1): CSV of column indices the user wants updated (0..10).
   * Index map matches Tracking_Import.aspx checkboxes:
   *   0=QuocGia, 1=KhachHang, 2=OrderNumber, 3=NgayDatHang, 4=NhaVanChuyen,
   *   5=TinhTrang, 6=GhiChu, 7=Kien, 8=Mawb, 9=Hawb, 10=GhiChuLoHang
   */
  @IsOptional()
  @IsString()
  editColumns?: string;
}

export interface ImportTrackingPreviewRow {
  excelRowIndex: number;
  trackingNumber: string;
  tenQuocGia: string;
  username: string;
  orderNumber: string;
  ngayDatHang: string;
  tenNhaVanChuyen: string;
  tinhTrang: string;
  ghiChu: string;
  kien: string;
  mawb: string;
  hawb: string;
  ghiChuLoHang: string;
  errors: string[];
}

export interface ImportTrackingResult {
  rows: ImportTrackingPreviewRow[];
  errorCount: number;
  imported: number;
  committed: boolean;
}
