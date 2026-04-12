import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Query DTO for QLDatHang_LietKe (Order Management List)
 *
 * Matches the filters from QLDatHang_LietKe.aspx.cs:
 * - website: ddWebsite.SelectedValue
 * - username: ddUserName.SelectedValue
 * - search: tbNoiDungTim.Text (general search)
 * - ids: tbMaDatHang.Text (exact order ID)
 * - quocGiaId: ddQuocGia.SelectedValue
 * - startDate: tbTuNgay.Text
 * - endDate: tbDenNgay.Text
 * - page, limit: pagination (default 2000)
 */
export class QueryQLDatHangDto {
  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      return value.split(',').map((v) => v.trim()).filter(Boolean);
    }
    return undefined;
  })
  statuses?: string[];

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  ids?: string; // Exact order ID (tbMaDatHang)

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quocGiaId?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(5000)
  limit?: number = 2000; // Default 2000 like C#

  @IsString()
  @IsOptional()
  sortBy?: string = 'ID';

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  daXoa?: number = 0; // Default: false (DaXoa = 0)
}

/**
 * Response DTO for QLDatHang_LietKe
 *
 * Matches DonHangPhanTrang from C#:
 * - totalItem: total count
 * - danhSachDonHang: list of orders
 */
export class QLDatHangResponseDto {
  totalItem: number;
  danhSachDonHang: any[];
  page: number;
  limit: number;
}
