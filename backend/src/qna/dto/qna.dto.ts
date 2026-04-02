import { IsOptional, IsNumber, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for Q&A list
 * Matches: LoadDanhSachThacMac() in HoiDapAdmin.cs
 */
export class QueryQnaDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  daTraLoi?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number = 20;
}

/**
 * Answer Q&A
 * Matches: gvThacMac_RowUpdating() -> CapNhatTraLoiThacMac() in HoiDapAdmin.cs
 */
export class AnswerQnaDto {
  @IsString()
  traLoi: string;
}
