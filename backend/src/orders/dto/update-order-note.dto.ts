import { IsString, IsOptional } from 'class-validator';

/**
 * DTO for updating order note (BoSungGhiChu)
 *
 * Converted from EditOrder_BoSungGhiChu.aspx.cs
 * Features:
 * - Add additional note to order
 * - Log the action in system logs
 */
export class UpdateOrderNoteDto {
  @IsString()
  @IsOptional()
  boSungGhiChu?: string;
}
