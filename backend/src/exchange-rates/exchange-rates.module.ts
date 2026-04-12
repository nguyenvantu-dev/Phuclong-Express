import { Module } from '@nestjs/common';
import { ExchangeRatesController } from './exchange-rates.controller';
import { TyGiaController } from './ty-gia.controller';
import { ExchangeRatesService } from './exchange-rates.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ExchangeRatesController, TyGiaController],
  providers: [ExchangeRatesService],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
