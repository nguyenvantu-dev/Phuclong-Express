import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for shipper list
 */
export class QueryShipperDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 50;
}

/**
 * Create shipper
 * Matches: btCapNhat_Click() -> ThemShipper() in Shipper_Them.cs
 */
export class CreateShipperDto {
  @IsString()
  shipperName: string;

  @IsString()
  shipperPhone: string;

  @IsOptional()
  @IsString()
  shipperAddress?: string;
}

/**
 * Update shipper
 * Matches: btCapNhat_Click() -> CapNhatShipper() in Shipper_Them.cs
 */
export class UpdateShipperDto {
  @IsOptional()
  @IsString()
  shipperName?: string;

  @IsOptional()
  @IsString()
  shipperPhone?: string;

  @IsOptional()
  @IsString()
  shipperAddress?: string;
}
