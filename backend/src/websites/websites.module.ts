import { Module } from '@nestjs/common';
import { WebsitesController } from './websites.controller';
import { WebsitesService } from './websites.service';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [WebsitesController],
  providers: [WebsitesService],
  exports: [WebsitesService],
})
export class WebsitesModule {}
