import { Module } from '@nestjs/common';
import { DeliveryAddressesController } from './delivery-addresses.controller';
import { DeliveryAddressesService } from './delivery-addresses.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DeliveryAddressesController],
  providers: [DeliveryAddressesService],
  exports: [DeliveryAddressesService],
})
export class DeliveryAddressesModule {}
