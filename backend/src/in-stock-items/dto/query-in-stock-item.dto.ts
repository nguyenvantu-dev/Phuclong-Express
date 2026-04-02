import { IsOptional, IsString, IsNumber } from 'class-validator';

export class QueryInStockItemDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
