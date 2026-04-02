import { Module } from '@nestjs/common';
import { DebtReportsController } from './debt-reports.controller';
import { DebtReportsService } from './debt-reports.service';
import { DatabaseModule } from '../database/database.module';

/**
 * Debt Reports Module
 */
@Module({
  imports: [DatabaseModule],
  controllers: [DebtReportsController],
  providers: [DebtReportsService],
  exports: [DebtReportsService],
})
export class DebtReportsModule {}
