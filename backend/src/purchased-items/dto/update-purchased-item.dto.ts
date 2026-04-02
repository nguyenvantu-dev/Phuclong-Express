import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class UpdatePurchasedItemDto {
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsString()
  @IsOptional()
  websiteName?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  linkWeb?: string;

  @IsString()
  @IsOptional()
  linkHinh?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @IsOptional()
  soLuong?: number;

  @IsNumber()
  @IsOptional()
  donGiaWeb?: number;

  @IsString()
  @IsOptional()
  loaiTien?: string;

  @IsString()
  @IsOptional()
  ghiChu?: string;

  @IsBoolean()
  @IsOptional()
  hangKhoan?: boolean;
}
