import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { DatabaseModule } from '../database/database.module';
import { SystemLogsService } from '../system-logs/system-logs.service';

/**
 * Tracking Module
 *
 * Handles tracking management.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [TrackingController],
  providers: [TrackingService, SystemLogsService],
  exports: [TrackingService],
})
export class TrackingModule {}
