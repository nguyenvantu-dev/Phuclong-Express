import { Module } from '@nestjs/common';
import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { DatabaseModule } from '../database/database.module';

/**
 * Q&A Module
 */
@Module({
  imports: [DatabaseModule],
  controllers: [QnaController],
  providers: [QnaService],
  exports: [QnaService],
})
export class QnaModule {}
