import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query Batch DTO
 * Maps to SP_Lay_LoHang parameters: @UserName, @TuNgay, @DenNgay, @PageSize, @PageNum
 */
export class QueryBatchDto {
  /** @UserName — empty string means all users */
  @IsOptional()
  @IsString()
  username?: string = '';

  /** @TuNgay — ISO date string (YYYY-MM-DD) */
  @IsOptional()
  @IsString()
  tuNgay?: string;

  /** @DenNgay — ISO date string (YYYY-MM-DD) */
  @IsOptional()
  @IsString()
  denNgay?: string;

  /** @PageNum */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  /** @PageSize */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number = 200;
}
