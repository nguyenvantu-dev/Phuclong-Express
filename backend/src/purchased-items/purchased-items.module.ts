import { Module } from '@nestjs/common';
import { PurchasedItemsController } from './purchased-items.controller';
import { PurchasedItemsService } from './purchased-items.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PurchasedItemsController],
  providers: [PurchasedItemsService],
  exports: [PurchasedItemsService],
})
export class PurchasedItemsModule {}
