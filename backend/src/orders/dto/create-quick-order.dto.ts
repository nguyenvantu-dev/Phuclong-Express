import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsArray, ValidateNested } from 'class-validator';

/**
 * DTO for creating a quick order (DatHangM - simple order)
 * Converted from: DatHangM.aspx - ThemDatHangSimple logic
 *
 * Uses stored procedure: SP_Them_DonHang_Simple
 */
export class CreateQuickOrderDto {
  @IsString()
  @IsOptional()
  websiteName?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  usernameSave?: string;

  @IsString()
  linkWeb: string;

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
  @Min(1)
  soLuong: number;

  @IsNumber()
  @IsOptional()
  donGiaWeb?: number;

  @IsString()
  @IsOptional()
  loaiTien?: string;

  @IsString()
  @IsOptional()
  ghiChu?: string;

  @IsNumber()
  @IsOptional()
  tyGia?: number;

  @IsNumber()
  @IsOptional()
  saleOff?: number;

  @IsBoolean()
  @IsOptional()
  hangKhoan?: boolean;

  @IsNumber()
  @IsOptional()
  loaiHangId?: number;

  @IsString()
  @IsOptional()
  maSoHang?: string;

  @IsNumber()
  @IsOptional()
  quocGiaId?: number;

  @IsNumber()
  @IsOptional()
  shipUsa?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  phuThu?: number;

  @IsNumber()
  @IsOptional()
  cong?: number;

  @IsString()
  @IsOptional()
  nguoiTao?: string;
}

/**
 * DTO for creating multiple quick orders at once
 */
export class CreateQuickOrdersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuickOrderDto)
  orders: CreateQuickOrderDto[];
}
