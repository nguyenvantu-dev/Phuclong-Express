import { IsString, IsNumber, IsOptional } from 'class-validator';

/**
 * Create In-Stock Item DTO
 */
export class CreateInStockItemDto {
  @IsString()
  maSoHang!: string;

  @IsString()
  @IsOptional()
  tenHinh?: string;

  @IsString()
  tenHang!: string;

  @IsString()
  @IsOptional()
  linkHang?: string;

  @IsNumber()
  @IsOptional()
  giaTien?: number;

  @IsString()
  @IsOptional()
  moTa?: string;

  @IsNumber()
  @IsOptional()
  soSao?: number;

  @IsNumber()
  @IsOptional()
  thuTu?: number;

  @IsString()
  @IsOptional()
  noiDungTimKiem?: string;
}
