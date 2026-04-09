import { IsArray, IsString, IsOptional } from 'class-validator';

export class MassUpdateTrackingDto {
  @IsArray()
  ids: number[];

  @IsString()
  tinhTrang: string;

  @IsOptional()
  @IsString()
  nguoiTao?: string;
}
