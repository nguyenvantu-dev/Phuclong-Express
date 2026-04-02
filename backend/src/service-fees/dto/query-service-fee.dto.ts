import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

/**
 * Query Service Fee DTO
 *
 * Used for filtering and pagination.
 */
export class QueryServiceFeeDto {
  @IsOptional()
  @IsString()
  loaiTien?: string;

  @IsOptional()
  @IsBoolean()
  khachBuon?: boolean;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
