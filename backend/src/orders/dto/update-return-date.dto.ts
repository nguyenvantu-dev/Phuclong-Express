import { IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';

/**
 * DTO for updating order return date to Vietnam (NgayVeVN)
 *
 * Converted from EditOrder_NgayVeVN.aspx.cs
 * Features:
 * - Update return date to Vietnam
 * - Auto-generate tenDotHang = yyyyMMdd
 * - Optional additional note
 * - Optional: change status to Completed
 */
export class UpdateReturnDateDto {
  @IsDateString()
  ngayVeVn: string;

  @IsString()
  @IsOptional()
  boSungGhiChu?: string;

  @IsBoolean()
  @IsOptional()
  chuyenVeCompleted?: boolean;

  @IsString()
  @IsOptional()
  username?: string;
}
