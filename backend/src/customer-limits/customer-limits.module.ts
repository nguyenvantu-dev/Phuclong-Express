import { Module } from '@nestjs/common';
import { CustomerLimitsController } from './customer-limits.controller';
import { CustomerLimitsService } from './customer-limits.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [CustomerLimitsController],
  providers: [CustomerLimitsService],
  exports: [CustomerLimitsService],
})
export class CustomerLimitsModule {}
