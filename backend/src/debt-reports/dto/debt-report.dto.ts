import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for debt reports
 * Matches filters in BaoCao_ChiTietCongNo.aspx
 */
export class QueryDebtReportDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fromKyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  toKyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 100;
}

/**
 * Update debt record DTO
 * Matches gvCongNo_RowUpdating() validation in C#
 */
export class UpdateDebtDto {
  @IsOptional()
  @IsString()
  noiDung?: string;

  @IsOptional()
  @Type(() => Number)
  dr?: number;

  @IsOptional()
  @Type(() => Number)
  cr?: number;

  @IsOptional()
  @IsString()
  ghiChu?: string;
}

/**
 * Export debt report DTO
 * Matches btExportToExcelAllWithFilter_Click() in C#
 */
export class ExportDebtReportDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  fromKyId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  toKyId?: number;
}

/**
 * Query parameters for debt report by lot (BaoCao_CongNoKhachHangTheoLo)
 * Matches tbTuNgay, tbDenNgay filters in C#
 */
export class QueryDebtReportByLotDto {
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}

/**
 * Query parameters for debt reconciliation report (BaoCao_DoiChieuCongNo)
 * Matches tbTuNgay, tbDenNgay, druser, tbOrderNumber filters in C#
 */
export class QueryDebtReconciliationDto {
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;
}

/**
 * Update order total VND DTO
 * Matches tbgvSotienBVND in C#
 */
export class UpdateOrderTotalVndDto {
  @IsString()
  ordernumber!: string;

  @IsString()
  trackingNumber!: string;

  @Type(() => Number)
  @IsInt()
  tongTienOrderVND!: number;
}

// ========== BaoCao_TongDoanhThu ==========

/**
 * Query parameters for total revenue report (BaoCao_TongDoanhThu)
 * Matches tbTuNgay, tbDenNgay filters in C#
 */
export class QueryTotalRevenueDto {
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}

// ========== BaoCao_TongCongNoTheoUser ==========

/**
 * Query parameters for total debt by user report (BaoCao_TongCongNoTheoUser)
 * Matches tbTuNgay, tbDenNgay, druser filters in C#
 */
export class QueryDebtByUserDto {
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsString()
  username?: string;
}

// ========== BaoCao_PhanTichLaiLoTheoLoHang ==========

/**
 * Query parameters for profit/loss analysis by lot (BaoCao_PhanTichLaiLoTheoLoHang)
 * Matches tbTuNgay, tbDenNgay filters in C#
 */
export class QueryProfitLossByLotDto {
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}

// ========== BaoCao_InPhieuShipTheoDotHang ==========

/**
 * Query parameters for shipping slip by shipment lot (BaoCao_InPhieuShipTheoDotHang)
 * Matches query strings u, dh in C#
 */
export class QueryShippingSlipDto {
  @IsString()
  user!: string;

  @IsString()
  orderId!: string;
}