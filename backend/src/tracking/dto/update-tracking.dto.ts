import { PartialType } from '@nestjs/mapped-types';
import { CreateTrackingDto } from './create-tracking.dto';

/**
 * Update Tracking DTO
 */
export class UpdateTrackingDto extends PartialType(CreateTrackingDto) {}
