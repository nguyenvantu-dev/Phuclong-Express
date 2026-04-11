import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

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
  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {}

  /**
   * Get all bank accounts
   */
  async findAll(): Promise<BankAccount[]> {
    try {
      const [data]: any[] = await this.sequelize.query(`
        SELECT ID, TenTaiKhoanNganHang, GhiChu
        FROM dbo.TaiKhoanNganHang
        ORDER BY TenTaiKhoanNganHang
      `);
      return data || [];
    } catch (error) {
      console.error('Error getting bank accounts:', error.message);
      return [];
    }
  }

  /**
   * Create new bank account (ThemTaiKhoanNganHang)
   */
  async create(createDto: CreateBankAccountDto, nguoiTao: string): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const [result]: any[] = await this.sequelize.query(
        `INSERT INTO dbo.TaiKhoanNganHang (TenTaiKhoanNganHang, GhiChu)
         VALUES (:ten, :ghiChu);
         SELECT SCOPE_IDENTITY() as ID;`,
        { replacements: { ten: createDto.tenTaiKhoanNganHang, ghiChu: createDto.ghiChu || '' } },
      );
      const id = result[0]?.ID;

      await this.logAction(
        nguoiTao,
        'DanhMucTaiKhoanNganHang:ThemTaiKhoanNganHang',
        'Chinh sua',
        '',
        `TaiKhoanNganHangName: ${createDto.tenTaiKhoanNganHang}; GhiChu: ${createDto.ghiChu || ''}`,
      );

      return { success: true, id };
    } catch (error) {
      console.error('Error creating bank account:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update bank account (CapNhatTaiKhoanNganHang)
   */
  async update(id: number, updateDto: UpdateBankAccountDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.sequelize.query(
        `UPDATE dbo.TaiKhoanNganHang
         SET TenTaiKhoanNganHang = :ten, GhiChu = :ghiChu
         WHERE ID = :id`,
        { replacements: { ten: updateDto.tenTaiKhoanNganHang, ghiChu: updateDto.ghiChu || '', id } },
      );

      await this.logAction(
        nguoiCapNhat,
        'DanhMucTaiKhoanNganHang:CapNhatTaiKhoanNganHang',
        'Chinh sua',
        String(id),
        `TaiKhoanNganHangName: ${updateDto.tenTaiKhoanNganHang}; GhiChu: ${updateDto.ghiChu || ''}`,
      );

      return { success: true };
    } catch (error) {
      console.error('Error updating bank account:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log system action (ThemSystemLogs)
   */
  private async logAction(nguoiTao: string, nguon: string, hanhDong: string, doiTuong: string, noiDung: string): Promise<void> {
    try {
      await this.sequelize.query(
        `INSERT INTO dbo.tbSystemLogs (NguoiTao, NgayTao, Nguon, HanhDong, DoiTuong, NoiDung)
         VALUES (:nguoiTao, GETDATE(), :nguon, :hanhDong, :doiTuong, :noiDung)`,
        { replacements: { nguoiTao, nguon, hanhDong, doiTuong, noiDung } },
      );
    } catch (error) {
      console.error('Error logging action:', error.message);
    }
  }
}
