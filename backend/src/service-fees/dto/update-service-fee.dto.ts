import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceFeeDto } from './create-service-fee.dto';

/**
 * Update Service Fee DTO
 *
 * Partial type of CreateServiceFeeDto for updating existing service fee.
 */
export class UpdateServiceFeeDto extends PartialType(CreateServiceFeeDto) {}
