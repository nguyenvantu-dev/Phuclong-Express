import { Module } from '@nestjs/common';
import { InStockItemsController } from './in-stock-items.controller';
import { InStockItemsService } from './in-stock-items.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InStockItemsController],
  providers: [InStockItemsService],
  exports: [InStockItemsService],
})
export class InStockItemsModule {}
