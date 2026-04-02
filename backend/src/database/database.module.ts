import { Module, Global } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
const tedious = require('tedious');

/**
 * Global Database Module
 * Exports Sequelize instance for use in all modules
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'SEQUELIZE',
      useFactory: async (configService: ConfigService) => {
        const sequelize = new Sequelize({
          dialect: 'mssql',
          host: configService.get('DB_HOST') || 'localhost',
          port: parseInt(configService.get('DB_PORT') || '1433'),
          username: configService.get('DB_USERNAME') || 'sa',
          password: configService.get('DB_PASSWORD') || 'your_password',
          database: configService.get('DB_DATABASE') || 'phuclong',
          logging: false,
          dialectOptions: {
            encrypt: true,
            trustServerCertificate: true,
          },
        });
        return sequelize;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SEQUELIZE'],
})
export class DatabaseModule {}
