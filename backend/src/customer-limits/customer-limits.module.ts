import { Module } from '@nestjs/common';
import { CustomerLimitsController } from './customer-limits.controller';
import { CustomerLimitsService } from './customer-limits.service';

@Module({
  imports: [],
  controllers: [CustomerLimitsController],
  providers: [CustomerLimitsService],
  exports: [CustomerLimitsService],
})
export class CustomerLimitsModule {}
