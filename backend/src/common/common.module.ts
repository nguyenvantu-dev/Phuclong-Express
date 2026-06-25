import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from '../auth/auth.module';
import { UploadController } from './controllers/upload.controller';
import { ImageUploadService } from './services/image-upload.service';
import { HttpLogInterceptor } from './interceptors/http-log.interceptor';

/**
 * Global module exposing shared cross-cutting services and controllers.
 *
 * - ImageUploadService: shared image upload (UUID + YYYYMM + resize to 640x480).
 * - UploadController: generic POST /api/upload/image endpoint.
 *
 * Marked @Global so feature modules can inject services without importing.
 */
@Global()
@Module({
  imports: [AuthModule],
  controllers: [UploadController],
  providers: [
    ImageUploadService,
    { provide: APP_INTERCEPTOR, useClass: HttpLogInterceptor },
  ],
  exports: [ImageUploadService],
})
export class CommonModule {}
