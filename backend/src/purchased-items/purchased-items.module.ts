import { Module } from '@nestjs/common';
import { PurchasedItemsController } from './purchased-items.controller';
import { PurchasedItemsService } from './purchased-items.service';

@Module({
  controllers: [PurchasedItemsController],
  providers: [PurchasedItemsService],
  exports: [PurchasedItemsService],
})
export class PurchasedItemsModule {}
