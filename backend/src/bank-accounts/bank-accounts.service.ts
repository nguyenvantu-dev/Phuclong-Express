import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
const tedious = require('tedious');

export interface BankAccount {
  ID: number;
  TenTaiKhoanNganHang: string;
  GhiChu: string;
}

export interface CreateBankAccountDto {
  tenTaiKhoanNganHang: string;
  ghiChu?: string;
}

export interface UpdateBankAccountDto {
  id: number;
  tenTaiKhoanNganHang: string;
  ghiChu?: string;
}

/**
 * Bank Accounts Service (DanhMucTaiKhoanNganHang)
 *
 * CRUD operations for bank account catalog
 */
@Injectable()
export class BankAccountsService {
  private getSequelize(): Sequelize {
    return new Sequelize({
      dialect: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'PhucLong',
      logging: false,
      dialectOptions: {
        encrypt: true,
        trustServerCertificate: true,
      },
      dialectModule: tedious
    });
  }

  /**
   * Get all bank accounts
   */
  async findAll(): Promise<BankAccount[]> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(`
        SELECT ID, TenTaiKhoanNganHang, GhiChu
        FROM dbo.TaiKhoanNganHang
        ORDER BY TenTaiKhoanNganHang
      `);
      await sequelize.close();
      return data || [];
    } catch (error) {
      console.error('Error getting bank accounts:', error.message);
      return [];
    }
  }

  /**
   * Get bank account by ID
   */
  async findOne(id: number): Promise<BankAccount | null> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(`
        SELECT ID, TenTaiKhoanNganHang, GhiChu
        FROM dbo.TaiKhoanNganHang
        WHERE ID = ${id}
      `);
      await sequelize.close();
      return data[0] || null;
    } catch (error) {
      console.error('Error getting bank account:', error.message);
      return null;
    }
  }

  /**
   * Create new bank account
   */
  async create(createDto: CreateBankAccountDto, nguoiTao: string): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      const [result]: any[] = await sequelize.query(`
        INSERT INTO dbo.TaiKhoanNganHang (TenTaiKhoanNganHang, GhiChu)
        VALUES ('${createDto.tenTaiKhoanNganHang}', '${createDto.ghiChu || ''}');
        SELECT SCOPE_IDENTITY() as ID;
      `);
      const id = result[0]?.ID;

      // Log system
      await this.logAction(nguoiTao, 'ThemMoi', 'TaiKhoanNganHang', id, `TenTaiKhoanNganHang: ${createDto.tenTaiKhoanNganHang}; GhiChu: ${createDto.ghiChu || ''}`);

      await sequelize.close();
      return { success: true, id };
    } catch (error) {
      console.error('Error creating bank account:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update bank account
   */
  async update(updateDto: UpdateBankAccountDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        UPDATE dbo.TaiKhoanNganHang
        SET TenTaiKhoanNganHang = '${updateDto.tenTaiKhoanNganHang}',
            GhiChu = '${updateDto.ghiChu || ''}'
        WHERE ID = ${updateDto.id}
      `);

      // Log system
      await this.logAction(nguoiCapNhat, 'ChinhSua', 'TaiKhoanNganHang', updateDto.id, `TenTaiKhoanNganHang: ${updateDto.tenTaiKhoanNganHang}; GhiChu: ${updateDto.ghiChu || ''}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error updating bank account:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete bank account
   */
  async remove(id: number, nguoiXoa: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        DELETE FROM dbo.TaiKhoanNganHang WHERE ID = ${id}
      `);

      // Log system
      await this.logAction(nguoiXoa, 'Xoa', 'TaiKhoanNganHang', id, `ID: ${id}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error deleting bank account:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log system action
   */
  private async logAction(nguoiTao: string, hanhDong: string, nguon: string, doiTuong: number | string, noiDung: string): Promise<void> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        INSERT INTO dbo.SystemLogs (NguoiTao, NgayTao, Nguon, HanhDong, DoiTuong, NoiDung)
        VALUES ('${nguoiTao}', GETDATE(), '${nguon}', '${hanhDong}', '${doiTuong}', '${noiDung}')
      `);
      await sequelize.close();
    } catch (error) {
      console.error('Error logging action:', error.message);
    }
  }
}
