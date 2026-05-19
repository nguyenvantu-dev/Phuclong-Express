import { IsString, IsBoolean, IsOptional } from 'class-validator';

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
  @IsString()
  ngayVeVn: string;

  @IsString()
  @IsOptional()
  boSungGhiChu?: string;

  @IsBoolean()
  @IsOptional()
  chuyenVeCompleted?: boolean;

  /**
   * Ngày hoàn thành (DD/MM/YYYY hoặc YYYY-MM-DD).
   * Chỉ dùng khi chuyenVeCompleted=true để ghi vào DON_HANG.NgayHoanThanh.
   * Nếu không truyền => mặc định hôm nay (giống SP_CapNhat_MassComplete).
   */
  @IsString()
  @IsOptional()
  ngayHoanThanh?: string;

  @IsString()
  @IsOptional()
  username?: string;
}
