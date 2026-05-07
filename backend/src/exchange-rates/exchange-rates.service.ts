import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import tedious from 'tedious';

export interface ExchangeRate {
  Name: string;
  TyGiaVND: number;
  CongShipVeVN: number;
}

export interface ExchangeRateHistory {
  Id: number;
  Name: string;
  TyGiaVND: number;
  CongShipVeVN: number;
  NguoiCapNhat: string | null;
  NgayCapNhat: string;
}

export interface DailyRateRow {
  NgayDate: string;
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
    } catch (error: any) {
      console.error('Error getting exchange rates:', error.message);
      return [];
    }
  }

  async findOne(name: string): Promise<ExchangeRate | null> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(
        `SELECT Name, TyGiaVND, CongShipVeVN FROM dbo.TY_GIA WHERE Name = :name`,
        { replacements: { name } },
      );
      await sequelize.close();
      return data[0] || null;
    } catch (error: any) {
      console.error('Error getting exchange rate:', error.message);
      return null;
    }
  }

  /**
   * Latest rate per currency per day, up to N days back.
   * negDays = -days avoids MSSQL parse error with "-:param" syntax.
   */
  async getDailyRates(days: number): Promise<DailyRateRow[]> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(
        `WITH LatestPerDay AS (
           SELECT
             CAST(NgayCapNhat AS DATE) AS NgayDate,
             Name,
             TyGiaVND,
             CongShipVeVN,
             ROW_NUMBER() OVER (
               PARTITION BY CAST(NgayCapNhat AS DATE), Name
               ORDER BY NgayCapNhat DESC
             ) AS rn
           FROM dbo.TY_GIA_HISTORY
           WHERE NgayCapNhat >= DATEADD(DAY, :negDays, GETDATE())
         )
         SELECT NgayDate, Name, TyGiaVND, CongShipVeVN
         FROM LatestPerDay
         WHERE rn = 1
         ORDER BY NgayDate DESC, Name`,
        { replacements: { negDays: -days } },
      );
      await sequelize.close();
      return data || [];
    } catch (error: any) {
      console.error('Error getting daily rates:', error.message);
      return [];
    }
  }

  async getHistory(name: string): Promise<ExchangeRateHistory[]> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(
        `SELECT TOP 100 Id, Name, TyGiaVND, CongShipVeVN, NguoiCapNhat, NgayCapNhat
         FROM dbo.TY_GIA_HISTORY
         WHERE Name = :name
         ORDER BY NgayCapNhat DESC`,
        { replacements: { name } },
      );
      await sequelize.close();
      return data || [];
    } catch (error: any) {
      console.error('Error getting exchange rate history:', error.message);
      return [];
    }
  }

  async update(updateDto: UpdateExchangeRateDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();

      await this.insertHistory(sequelize, updateDto.name, updateDto.tyGiaVND, updateDto.congShipVeVN, nguoiCapNhat);

      await sequelize.query(
        `UPDATE dbo.TY_GIA SET TyGiaVND = :tyGiaVND, CongShipVeVN = :congShipVeVN WHERE Name = :name`,
        { replacements: { tyGiaVND: updateDto.tyGiaVND, congShipVeVN: updateDto.congShipVeVN, name: updateDto.name } },
      );

      await this.logAction(nguoiCapNhat, 'Chinh sua', 'DanhMucTyGia:CapNhatTyGia', updateDto.name, `Name: ${updateDto.name}; TyGia: ${updateDto.tyGiaVND}; CongShipVeVN: ${updateDto.congShipVeVN}`);

      await sequelize.close();
      return { success: true };
    } catch (error: any) {
      console.error('Error updating exchange rate:', error.message);
      return { success: false, error: error.message };
    }
  }

  private async insertHistory(sequelize: Sequelize, name: string, tyGiaVND: number, congShipVeVN: number, nguoiCapNhat: string): Promise<void> {
    try {
      await sequelize.query(
        `INSERT INTO dbo.TY_GIA_HISTORY (Name, TyGiaVND, CongShipVeVN, NguoiCapNhat, NgayCapNhat)
         VALUES (:name, :tyGiaVND, :congShipVeVN, :nguoiCapNhat, GETDATE())`,
        { replacements: { name, tyGiaVND, congShipVeVN, nguoiCapNhat } },
      );
    } catch (error: any) {
      // Non-fatal: history insert failure should not block the update
      console.error('Error inserting exchange rate history:', error.message);
    }
  }

  private async logAction(nguoiTao: string, hanhDong: string, nguon: string, doiTuong: number | string, noiDung: string): Promise<void> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(
        `INSERT INTO dbo.tbSystemLogs (NguoiTao, NgayTao, Nguon, HanhDong, DoiTuong, NoiDung) VALUES (:nguoiTao, GETDATE(), :nguon, :hanhDong, :doiTuong, :noiDung)`,
        { replacements: { nguoiTao, nguon, hanhDong, doiTuong: String(doiTuong), noiDung } },
      );
      await sequelize.close();
    } catch (error: any) {
      console.error('Error logging action:', error.message);
    }
  }
}
