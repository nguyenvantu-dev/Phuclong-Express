import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query Shipment Group DTO
 */
export class QueryShipmentGroupDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  tenDotHang?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
