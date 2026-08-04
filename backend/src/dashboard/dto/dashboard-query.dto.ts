import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters cho các endpoint dashboard.
 * fromDate / toDate dạng dd/MM/yyyy (khớp flatpickr 'd/m/Y' của FE).
 * Bỏ trống -> service mặc định = đầu→cuối tháng hiện tại.
 */
export class DashboardQueryDto {
  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  /** Lọc theo Tuyến (tbQuocGia.QuocGiaID) — chỉ áp dụng cho output-by-staff. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  quocGiaId?: number;
}
