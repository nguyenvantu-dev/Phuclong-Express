import { IsNumber, IsString, IsOptional, IsArray } from 'class-validator';

/**
 * DTO for batch updating order notes (BoSungGhiChu)
 *
 * Uses SP_CapNhat_BoSungGhiChu which handles comma-separated IDs
 */
export class BatchUpdateNoteDto {
  @IsArray()
  @IsNumber({}, { each: true })
  ids: number[];

  @IsString()
  @IsOptional()
  boSungGhiChu?: string;
}