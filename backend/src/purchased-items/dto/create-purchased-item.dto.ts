import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreatePurchasedItemDto {
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsString()
  websiteName!: string;

  @IsString()
  username!: string;

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
