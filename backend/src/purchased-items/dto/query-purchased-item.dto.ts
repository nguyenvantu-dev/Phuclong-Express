import { IsOptional, IsString, IsNumber, IsArray } from 'class-validator';

export class QueryPurchasedItemDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  maDatHang?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}

export class MassUpdatePurchasedItemDto {
  @IsArray()
  items!: Array<{
    id: number;
    websiteName?: string;
    username?: string;
    linkWeb?: string;
    linkHinh?: string;
    color?: string;
    size?: string;
    soLuong?: number;
    donGiaWeb?: number;
    ghiChu?: string;
  }>;
}

export class ShareOrdersDto {
  @IsString()
  ids!: string;

  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsNumber()
  totalCharged!: number;

  @IsNumber()
  totalItem!: number;
}
