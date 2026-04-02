import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

/**
 * Create Tracking DTO
 */
export class CreateTrackingDto {
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
  @IsNumber()
  quocGiaId?: number;

  @IsOptional()
  @IsString()
  tinhTrang?: string;

  @IsOptional()
  @IsString()
  ghiChu?: string;

  @IsOptional()
  @IsString()
  kien?: string;

  @IsOptional()
  @IsString()
  mawb?: string;

  @IsOptional()
  @IsString()
  hawb?: string;

  @IsOptional()
  @IsString()
  nguoiTao?: string;
}
