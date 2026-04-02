import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { DatabaseModule } from '../database/database.module';
import { SystemLogsModule } from '../system-logs/system-logs.module';

/**
 * Orders Module
 */
@Module({
  imports: [DatabaseModule, SystemLogsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
