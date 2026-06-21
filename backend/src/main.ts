import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';
import { dirname, join } from 'path';
import { AppModule } from './app.module';

// Walk up from compiled file location until package.json found → app root.
function findAppRoot(): string {
  let dir = __dirname;
  while (dir !== dirname(dir)) {
    if (fs.existsSync(join(dir, 'package.json'))) return dir;
    dir = dirname(dir);
  }
  return process.cwd();
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ limit: '10mb', extended: true }));

  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'https://phuclong-express.vercel.app', 'https://phuclongexpress.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Serve uploaded images from imgLink/ (sibling of dist/, persistent across deploys).
  // Example: GET /imgLink/YYYYMM/<uuid>.jpg
  const appRoot = findAppRoot();
  const uploadDir = process.env.UPLOAD_DIR || join(appRoot, 'imgLink');
  app.useStaticAssets(uploadDir, { prefix: '/imgLink' });

  // Serve other static assets from public/ if needed
  app.useStaticAssets(join(appRoot, 'public'));

  // Set global prefix (applies to controllers only, not static assets)
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
