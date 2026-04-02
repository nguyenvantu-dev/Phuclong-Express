import { IsOptional, IsString, IsNumber, IsBoolean, IsDateString } from 'class-validator';

/**
 * Create Shipment Group DTO
 */
export class CreateShipmentGroupDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  tenDotHang?: string;

  @IsOptional()
  @IsNumber()
  canNang?: number;

  @IsOptional()
  @IsNumber()
  phiShipVeVnUsd?: number;

  @IsOptional()
  @IsNumber()
  phiShipVeVnVnd?: number;

  @IsOptional()
  @IsNumber()
  tyGia?: number;

  @IsOptional()
  @IsDateString()
  ngayGuiHang?: string;

  @IsOptional()
  @IsString()
  soVanDon?: string;

  @IsOptional()
  @IsNumber()
  shipperId?: number;

  @IsOptional()
  @IsBoolean()
  daYeuCauGuiHang?: boolean;
}
