import { Module } from '@nestjs/common';
import { InStockItemsController } from './in-stock-items.controller';
import { InStockItemsService } from './in-stock-items.service';

@Module({
  controllers: [InStockItemsController],
  providers: [InStockItemsService],
  exports: [InStockItemsService],
})
export class InStockItemsModule {}
