import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for debt management list
 * Matches: LoadDanhSachCongNo() in C#
 */
export class QueryDebtManagementDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status?: number;

  @IsOptional()
  @IsString()
  loaiPhatSinh?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 200;
}

/**
 * Create debt record
 * Matches: btDongY_Click() -> Insert_CongNo() in C#
 */
export class CreateDebtDto {
  @IsString()
  username: string;

  @IsString()
  noiDung: string;

  @IsString()
  ngay: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dr?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cr?: number;

  @IsOptional()
  @IsString()
  ghiChu?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  loHangId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  loaiPhatSinh?: number;

  @IsOptional()
  @IsString()
  bankAccount?: string;
}

/**
 * Update debt record
 * Matches: gvCongNo_RowUpdating() -> CapNhatCongNo() in C#
 */
export class UpdateDebtManagementDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  noiDung?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dr?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  cr?: number;

  @IsOptional()
  @IsString()
  ghiChu?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  status?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  loHangId?: number;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

/**
 * Import debts from Excel
 * Matches: ManageCongNo_Import.cs in C#
 */
export class ImportDebtDto {
  @IsString()
  mode: string; // '0' for new, '1' for edit

  @IsString()
  sheetName: string;

  @IsOptional()
  @IsString()
  editFields?: string; // JSON string of fields to edit in edit mode
}

/**
 * Bank account for dropdown
 */
export class BankAccountDto {
  ID: number;
  TenNganHang: string;
  SoTaiKhoan: string;
  ChuTaiKhoan: string;
}

/**
 * Batch/Lot for dropdown
 */
export class BatchDto {
  LoHang_ID: number;
  TenLoHang: string;
  NgayLoHang: Date;
}
