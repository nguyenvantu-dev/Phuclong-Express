import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

/**
 * DTO for importing orders from Excel
 *
 * Converted from QLDatHang_Import.aspx.cs
 * Features:
 * - Import new orders from Excel file
 * - Support edit mode (m=1) for updating existing orders
 * - Validate required fields: username, loaitien, QuocGia, linkweb, soluong, dongiaweb
 */
export class ImportOrderItemDto {
  @IsNumber()
  @IsOptional()
  excelRowIndex?: number;

  @IsNumber()
  @IsOptional()
  id?: number;

  @IsString()
  websiteName: string;

  @IsString()
  username: string;

  @IsString()
  loaitien: string;

  @IsNumber()
  tygia: number;

  @IsNumber()
  quocGiaId: number;

  @IsString()
  tenQuocGia: string;

  @IsString()
  linkweb: string;

  @IsString()
  @IsOptional()
  linkhinh?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  soluong: number;

  @IsNumber()
  dongiaweb: number;

  @IsNumber()
  @IsOptional()
  cong?: number;

  @IsNumber()
  @IsOptional()
  saleoff?: number;

  @IsNumber()
  @IsOptional()
  phuthu?: number;

  @IsNumber()
  @IsOptional()
  shipUSA?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsString()
  @IsOptional()
  ghichu?: string;

  @IsBoolean()
  @IsOptional()
  error?: boolean;
}

export class ImportOrdersDto {
  @IsString()
  sheetName: string;

  @IsString()
  mode?: string; // '1' for edit mode

  @IsOptional()
  items?: ImportOrderItemDto[];
}
