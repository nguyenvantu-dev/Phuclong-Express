import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';
import { SystemLogsModule } from '../system-logs/system-logs.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Users Module
 */
@Module({
  imports: [
    DatabaseModule,
    SystemLogsModule,
    AuthModule,
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
