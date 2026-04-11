import { Module } from '@nestjs/common';
import { ServiceFeesController } from './service-fees.controller';
import { ServiceFeesService } from './service-fees.service';
import { SystemLogsModule } from '../system-logs/system-logs.module';

/**
 * Service Fees Module
 *
 * Module for managing service fees (GiaTienCong).
 */
@Module({
  imports: [SystemLogsModule],
  controllers: [ServiceFeesController],
  providers: [ServiceFeesService],
  exports: [ServiceFeesService],
})
export class ServiceFeesModule {}
