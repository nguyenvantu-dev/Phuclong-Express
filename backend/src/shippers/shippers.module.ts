import { Module } from '@nestjs/common';
import { ShippersController } from './shippers.controller';
import { ShippersService } from './shippers.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

/**
 * Shippers Module
 */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ShippersController],
  providers: [ShippersService],
  exports: [ShippersService],
})
export class ShippersModule {}
