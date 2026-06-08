import { IsOptional, IsString } from 'class-validator';

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
}
