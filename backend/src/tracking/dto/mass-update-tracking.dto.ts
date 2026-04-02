import { IsArray, IsString, IsNumber } from 'class-validator';

export class MassUpdateTrackingDto {
  @IsArray()
  ids: number[];

  @IsString()
  tinhTrang: string;
}
