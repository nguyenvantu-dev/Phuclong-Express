import { Module } from '@nestjs/common';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';
import { DatabaseModule } from '../database/database.module';

/**
 * Tracking Module
 *
 * Handles tracking management.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [TrackingController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
