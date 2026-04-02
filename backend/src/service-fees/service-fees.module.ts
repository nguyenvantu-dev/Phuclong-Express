import { Module } from '@nestjs/common';
import { ServiceFeesController } from './service-fees.controller';
import { ServiceFeesService } from './service-fees.service';

/**
 * Service Fees Module
 *
 * Module for managing service fees (GiaTienCong).
 */
@Module({
  controllers: [ServiceFeesController],
  providers: [ServiceFeesService],
  exports: [ServiceFeesService],
})
export class ServiceFeesModule {}
