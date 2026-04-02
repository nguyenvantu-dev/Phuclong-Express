import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';

/**
 * Update Shipment DTO
 *
 * Data Transfer Object for updating an existing shipment.
 */
export class UpdateShipmentDto {
  @IsString()
  @IsOptional()
  tenDotHang?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  maDatHang?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  canNang?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  phiShipVeVnUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tyGia?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  phiShipVeVnVnd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tienHangUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tienHangVnd?: number;

  @IsNumber()
  @IsOptional()
  shipperId?: number;

  @IsNumber()
  @IsOptional()
  yeuCauGuiHang?: number;

  @IsString()
  @IsOptional()
  yeuCauGuiGhiChu?: string;

  @IsDateString()
  @IsOptional()
  ngayGuiHang?: string;

  @IsString()
  @IsOptional()
  soVanDon?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  phiShipTrongNuoc?: number;

  @IsString()
  @IsOptional()
  diaChiNhanHang?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  datCoc?: number;

  @IsDateString()
  @IsOptional()
  ngayTao?: string;

  @IsString()
  @IsOptional()
  nguoiTao?: string;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;
}
