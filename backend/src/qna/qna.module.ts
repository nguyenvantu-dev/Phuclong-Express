import { Module } from '@nestjs/common';
import { QnaController } from './qna.controller';
import { QnaService } from './qna.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Q&A Module
 */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [QnaController],
  providers: [QnaService],
  exports: [QnaService],
})
export class QnaModule {}
