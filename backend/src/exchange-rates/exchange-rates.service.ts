import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
const tedious = require('tedious');

export interface ExchangeRate {
  Name: string;
  TyGiaVND: number;
  CongShipVeVN: number;
}

export interface UpdateExchangeRateDto {
  name: string;
  tyGiaVND: number;
  congShipVeVN: number;
}

/**
 * Exchange Rates Service (DanhMucTyGia)
 *
 * CRUD operations for exchange rate catalog
 */
@Injectable()
export class ExchangeRatesService {
  private getSequelize(): Sequelize {
    return new Sequelize({
      dialect: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'PLELOGISTICS_OrderMan_1ST_01Jun2023',
      logging: false,
      dialectOptions: {
        encrypt: true,
        trustServerCertificate: true,
      },
      dialectModule: tedious
    });
  }

  /**
   * Get all exchange rates
   */
  async findAll(): Promise<ExchangeRate[]> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(`
        SELECT Name, TyGiaVND, CongShipVeVN
        FROM dbo.TY_GIA
        ORDER BY Name
      `);
      await sequelize.close();
      return data || [];
    } catch (error) {
      console.error('Error getting exchange rates:', error.message);
      return [];
    }
  }

  /**
   * Get exchange rate by name
   */
  async findOne(name: string): Promise<ExchangeRate | null> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(
        `SELECT Name, TyGiaVND, CongShipVeVN FROM dbo.TY_GIA WHERE Name = :name`,
        { replacements: { name } },
      );
      await sequelize.close();
      return data[0] || null;
    } catch (error) {
      console.error('Error getting exchange rate:', error.message);
      return null;
    }
  }

  /**
   * Update exchange rate
   */
  async update(updateDto: UpdateExchangeRateDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(
        `UPDATE dbo.TY_GIA SET TyGiaVND = :tyGiaVND, CongShipVeVN = :congShipVeVN WHERE Name = :name`,
        { replacements: { tyGiaVND: updateDto.tyGiaVND, congShipVeVN: updateDto.congShipVeVN, name: updateDto.name } },
      );

      // Log system
      await this.logAction(nguoiCapNhat, 'ChinhSua', 'TyGia', updateDto.name, `Name: ${updateDto.name}; TyGia: ${updateDto.tyGiaVND}; CongShipVeVN: ${updateDto.congShipVeVN}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error updating exchange rate:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log system action
   */
  private async logAction(nguoiTao: string, hanhDong: string, nguon: string, doiTuong: number | string, noiDung: string): Promise<void> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(
        `INSERT INTO dbo.tbSystemLogs (NguoiTao, NgayTao, Nguon, HanhDong, DoiTuong, NoiDung) VALUES (:nguoiTao, GETDATE(), :nguon, :hanhDong, :doiTuong, :noiDung)`,
        { replacements: { nguoiTao, nguon, hanhDong, doiTuong: String(doiTuong), noiDung } },
      );
      await sequelize.close();
    } catch (error) {
      console.error('Error logging action:', error.message);
    }
  }
}
