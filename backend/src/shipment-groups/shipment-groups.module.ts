import { Module } from '@nestjs/common';
import { ShipmentGroupsController } from './shipment-groups.controller';
import { ShipmentGroupsService } from './shipment-groups.service';
import { DatabaseModule } from '../database/database.module';

/**
 * Shipment Groups Module
 *
 * Handles shipment group (DotHang) management.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [ShipmentGroupsController],
  providers: [ShipmentGroupsService],
  exports: [ShipmentGroupsService],
})
export class ShipmentGroupsModule {}
