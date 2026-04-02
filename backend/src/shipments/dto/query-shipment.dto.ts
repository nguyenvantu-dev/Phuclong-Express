import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query Shipment DTO
 *
 * Data Transfer Object for querying shipments with filters and pagination.
 */
export class QueryShipmentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  tenDotHang?: string;

  @IsOptional()
  username?: string;

  @IsOptional()
  maDatHang?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeCompleted?: boolean;

  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
