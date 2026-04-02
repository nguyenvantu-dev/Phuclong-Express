import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

/**
 * Create Batch DTO
 */
export class CreateBatchDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsDateString()
  ngayDatHang?: string;

  @IsOptional()
  @IsNumber()
  nhaVanChuyenId?: number;

  @IsOptional()
  @IsString()
  tenLoHang?: string;

  @IsOptional()
  @IsString()
  tinhTrang?: string;

  @IsOptional()
  @IsString()
  ghiChu?: string;

  @IsOptional()
  @IsString()
  loaiTien?: string;

  @IsOptional()
  @IsNumber()
  tyGia?: number;

  @IsOptional()
  @IsDateString()
  ngayDenDuKien?: string;

  @IsOptional()
  @IsDateString()
  ngayDenThucTe?: string;

  @IsOptional()
  @IsString()
  nguoiTao?: string;
}
