import {
  IsArray,
  IsNumber,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../entities/order.entity';

/**
 * Mass Update Item DTO
 *
 * Represents a single order update in a mass update operation.
 */
export class MassUpdateItemDto {
  @IsNumber()
  id: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  trangThaiOrder?: OrderStatus;

  @IsOptional()
  adminNote?: string;

  // QLDatHang_MassUpdate fields
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsNumber()
  @IsOptional()
  tyGia?: number;

  @IsNumber()
  @IsOptional()
  cong?: number;

  @IsNumber()
  @IsOptional()
  saleOff?: number;

  @IsNumber()
  @IsOptional()
  phuThu?: number;

  @IsNumber()
  @IsOptional()
  shipUsa?: number;

  @IsNumber()
  @IsOptional()
  tax?: number;

  @IsNumber()
  @IsOptional()
  totalCharged?: number;

  @IsNumber()
  @IsOptional()
  totalItem?: number;

  @IsBoolean()
  @IsOptional()
  heThongTuTinhCong?: boolean;
}

/**
 * Mass Update Order DTO
 *
 * Data Transfer Object for mass updating orders.
 */
export class MassUpdateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MassUpdateItemDto)
  items: MassUpdateItemDto[];

  @IsString()
  @IsOptional()
  username?: string;
}

/**
 * Mass Delete DTO
 *
 * Data Transfer Object for mass deleting (soft delete) orders.
 */
export class MassDeleteDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  note?: string;
}

/**
 * Mass Complete DTO
 *
 * Data Transfer Object for mass completing orders.
 */
export class MassCompleteDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  nguon?: string;
}

/**
 * Mass Received DTO
 *
 * Data Transfer Object for mass received orders.
 * Converted from EditOrder.cs - lbtMassReceived_Click + DBConnect.MassReceived
 */
export class MassReceivedDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @IsString()
  @IsOptional()
  username?: string;
}

/**
 * Mass Shipped DTO
 *
 * Data Transfer Object for mass shipped orders.
 * Converted from EditOrder.cs - lbtMassShipped_Click + DBConnect.MassShipped
 */
export class MassShippedDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  nguon?: string;
}
