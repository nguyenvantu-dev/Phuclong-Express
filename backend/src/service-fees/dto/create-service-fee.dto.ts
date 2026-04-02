import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

/**
 * Create Service Fee DTO
 *
 * Used for creating a new service fee configuration.
 */
export class CreateServiceFeeDto {
  @IsString()
  loaiTien!: string;

  @IsNumber()
  tuGia!: number;

  @IsNumber()
  denGia!: number;

  @IsNumber()
  tienCong1Mon!: number;

  @IsBoolean()
  @IsOptional()
  tinhTheoPhanTram?: boolean;

  @IsBoolean()
  @IsOptional()
  khachBuon?: boolean;
}
