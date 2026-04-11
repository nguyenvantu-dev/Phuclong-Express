import { Module } from '@nestjs/common';
import { DebtReportsController } from './debt-reports.controller';
import { DebtReportsService } from './debt-reports.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Debt Reports Module
 */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [DebtReportsController],
  providers: [DebtReportsService],
  exports: [DebtReportsService],
})
export class DebtReportsModule {}
