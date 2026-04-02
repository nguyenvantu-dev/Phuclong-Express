import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
const tedious = require('tedious');

export interface Period {
  KyID: number;
  Nam: number;
  Thang: number;
  DaDong: boolean;
}

export interface PeriodDetail {
  ChotKyID: number;
  KyID: number;
  Nam: number;
  Thang: number;
  username: string;
  DauKy: number;
  PhatSinhThuDR: number;
  PhatSinhChiCR: number;
  PhatSinhCanDoi: number;
  CuoiKy: number;
  NguoiTao: string;
  NgayTao: string;
  NguoiCapNhatCuoi: string;
  NgayCapNhatCuoi: string;
  TamMoKy: boolean;
}

export interface CreatePeriodDto {
  nam: number;
  thang: number;
}

export interface UpdatePeriodDto {
  id: number;
  nam: number;
  thang: number;
}

export interface QueryPeriodDetailDto {
  kyId?: number;
  username?: string;
  trangThai?: number; // -1: all, 0: da chot, 1: chua chot
  page?: number;
  limit?: number;
}

/**
 * Periods Service (DanhMucKy)
 *
 * CRUD operations for debt periods (Ky) management
 */
@Injectable()
export class PeriodsService {
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
   * Get all periods (list)
   */
  async findAll(): Promise<Period[]> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(`
        SELECT KyID, Nam, Thang, DaDong
        FROM dbo.Ky
        ORDER BY Nam DESC, Thang DESC
      `);
      await sequelize.close();
      return data || [];
    } catch (error) {
      console.error('Error getting periods:', error.message);
      return [];
    }
  }

  /**
   * Get period by ID
   */
  async findOne(id: number): Promise<Period | null> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(`
        SELECT KyID, Nam, Thang, DaDong
        FROM dbo.Ky
        WHERE KyID = ${id}
      `);
      await sequelize.close();
      return data[0] || null;
    } catch (error) {
      console.error('Error getting period:', error.message);
      return null;
    }
  }

  /**
   * Create new period
   * Return codes: 0 = success, 1 = duplicate, -1 = error
   */
  async create(createDto: CreatePeriodDto, nguoiTao: string): Promise<{ success: boolean; code?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();

      // Check if period exists
      const [existing]: any[] = await sequelize.query(`
        SELECT KyID FROM dbo.Ky WHERE Nam = ${createDto.nam} AND Thang = ${createDto.thang}
      `);

      if (existing.length > 0) {
        await sequelize.close();
        return { success: false, code: 1 };
      }

      const [result]: any[] = await sequelize.query(`
        INSERT INTO dbo.Ky (Nam, Thang)
        VALUES (${createDto.nam}, ${createDto.thang});
        SELECT SCOPE_IDENTITY() as KyID;
      `);
      const id = result[0]?.KyID;

      // Log system
      await this.logAction(nguoiTao, 'ThemMoi', 'Ky', id, `Năm: ${createDto.nam}; Tháng: ${createDto.thang}`);

      await sequelize.close();
      return { success: true, code: 0 };
    } catch (error) {
      console.error('Error creating period:', error.message);
      return { success: false, code: -1, error: error.message };
    }
  }

  /**
   * Update period
   * Return codes: 0 = success, 1 = duplicate, 2 = has data, -1 = error
   */
  async update(updateDto: UpdatePeriodDto, nguoiCapNhat: string): Promise<{ success: boolean; code?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();

      // Check if period exists with same year/month but different ID
      const [existing]: any[] = await sequelize.query(`
        SELECT KyID FROM dbo.Ky WHERE Nam = ${updateDto.nam} AND Thang = ${updateDto.thang} AND KyID != ${updateDto.id}
      `);

      if (existing.length > 0) {
        await sequelize.close();
        return { success: false, code: 1 };
      }

      // Check if has debt data
      const [hasData]: any[] = await sequelize.query(`
        SELECT TOP 1 ChotKyID FROM dbo.ChotKy WHERE KyID = ${updateDto.id}
      `);

      if (hasData.length > 0) {
        await sequelize.close();
        return { success: false, code: 2 };
      }

      await sequelize.query(`
        UPDATE dbo.Ky
        SET Nam = ${updateDto.nam}, Thang = ${updateDto.thang}
        WHERE KyID = ${updateDto.id}
      `);

      // Log system
      await this.logAction(nguoiCapNhat, 'ChinhSua', 'Ky', updateDto.id, `KyID: ${updateDto.id}; Năm: ${updateDto.nam}; Tháng: ${updateDto.thang}`);

      await sequelize.close();
      return { success: true, code: 0 };
    } catch (error) {
      console.error('Error updating period:', error.message);
      return { success: false, code: -1, error: error.message };
    }
  }

  /**
   * Delete period
   * Return codes: 0 = success, 1 = has data, -1 = error
   */
  async remove(id: number, nguoiXoa: string): Promise<{ success: boolean; code?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();

      // Check if has debt data
      const [hasData]: any[] = await sequelize.query(`
        SELECT TOP 1 ChotKyID FROM dbo.ChotKy WHERE KyID = ${id}
      `);

      if (hasData.length > 0) {
        await sequelize.close();
        return { success: false, code: 1 };
      }

      await sequelize.query(`
        DELETE FROM dbo.Ky WHERE KyID = ${id}
      `);

      // Log system
      await this.logAction(nguoiXoa, 'Xoa', 'Ky', id, `KyID: ${id}`);

      await sequelize.close();
      return { success: true, code: 0 };
    } catch (error) {
      console.error('Error deleting period:', error.message);
      return { success: false, code: -1, error: error.message };
    }
  }

  /**
   * Close period (DongKy)
   * Return codes: 0 = success, 1 = previous not closed, 2 = no previous, 3 = pending data, -1 = error
   */
  async closePeriod(id: number, nguoiDong: string): Promise<{ success: boolean; code?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();

      // Get current period info
      const [current]: any[] = await sequelize.query(`
        SELECT Nam, Thang FROM dbo.Ky WHERE KyID = ${id}
      `);

      if (current.length === 0) {
        await sequelize.close();
        return { success: false, code: -1 };
      }

      const { Nam, Thang } = current[0];

      // Find previous period
      const [previous]: any[] = await sequelize.query(`
        SELECT TOP 1 KyID, DaDong
        FROM dbo.Ky
        WHERE (Nam < ${Nam} OR (Nam = ${Nam} AND Thang < ${Thang}))
        ORDER BY Nam DESC, Thang DESC
      `);

      if (previous.length === 0) {
        await sequelize.close();
        return { success: false, code: 2 };
      }

      if (!previous[0].DaDong) {
        await sequelize.close();
        return { success: false, code: 1 };
      }

      // Check for pending debt data before closing date
      const [pendingData]: any[] = await sequelize.query(`
        SELECT TOP 1 ChotKyID FROM dbo.ChotKy
        WHERE KyID = ${id} AND DaDuyet = 0
      `);

      if (pendingData.length > 0) {
        await sequelize.close();
        return { success: false, code: 3 };
      }

      // Close the period
      await sequelize.query(`
        UPDATE dbo.Ky SET DaDong = 1 WHERE KyID = ${id}
      `);

      // Log system
      await this.logAction(nguoiDong, 'ChinhSua', 'Ky', id, `Đóng kỳ ID: ${id}`);

      await sequelize.close();
      return { success: true, code: 0 };
    } catch (error) {
      console.error('Error closing period:', error.message);
      return { success: false, code: -1, error: error.message };
    }
  }

  // ========== Period Detail (ChotKy) Methods ==========

  /**
   * Get period details with filters
   */
  async findAllDetails(query: QueryPeriodDetailDto): Promise<{ data: PeriodDetail[]; total: number; page: number; limit: number }> {
    const { kyId, username, trangThai, page = 1, limit = 200 } = query;

    try {
      const sequelize = this.getSequelize();

      let whereClause = 'WHERE 1=1';

      if (kyId && kyId > 0) {
        whereClause += ` AND ck.KyID = ${kyId}`;
      }
      if (username) {
        whereClause += ` AND ck.username = '${username}'`;
      }
      if (trangThai !== undefined && trangThai !== -1) {
        // trangThai: 0 = da chot (TamMoKy = 0), 1 = chua chot (TamMoKy = 1)
        whereClause += ` AND ck.TamMoKy = ${trangThai === 0 ? 0 : 1}`;
      }

      // Get total count
      const [countResult]: any[] = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM dbo.ChotKy ck ${whereClause}
      `);
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data
      const offset = (page - 1) * limit;
      const [data]: any[] = await sequelize.query(`
        SELECT
          ck.ChotKyID, ck.KyID, k.Nam, k.Thang, ck.username,
          ck.DauKy, ck.PhatSinhThuDR, ck.PhatSinhChiCR,
          ck.PhatSinhCanDoi, ck.CuoiKy,
          ck.NguoiTao, ck.NgayTao, ck.NguoiCapNhatCuoi, ck.NgayCapNhatCuoi,
          ck.TamMoKy
        FROM dbo.ChotKy ck
        LEFT JOIN dbo.Ky k ON ck.KyID = k.KyID
        ${whereClause}
        ORDER BY k.Nam DESC, k.Thang DESC, ck.username
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `);

      await sequelize.close();

      return {
        data: data || [],
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error getting period details:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Temporarily open period for user (TamMoKy)
   * Return codes: 0 = success, 1 = too far, -1 = error
   */
  async tempOpenPeriod(chotKyId: number, nguoiMo: string): Promise<{ success: boolean; code?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();

      // Get current ChotKy info
      const [current]: any[] = await sequelize.query(`
        SELECT KyID FROM dbo.ChotKy WHERE ChotKyID = ${chotKyId}
      `);

      if (current.length === 0) {
        await sequelize.close();
        return { success: false, code: -1 };
      }

      // Check if not too far from current period
      const [maxKy]: any[] = await sequelize.query(`
        SELECT TOP 1 KyID FROM dbo.Ky ORDER BY Nam DESC, Thang DESC
      `);

      if (maxKy.length > 0 && current[0].KyID < maxKy[0].KyID - 1) {
        await sequelize.close();
        return { success: false, code: 1 };
      }

      await sequelize.query(`
        UPDATE dbo.ChotKy SET TamMoKy = 1 WHERE ChotKyID = ${chotKyId}
      `);

      // Log system
      await this.logAction(nguoiMo, 'ChinhSua', 'ChotKy', chotKyId, `Tạm mở kỳ ID: ${chotKyId}`);

      await sequelize.close();
      return { success: true, code: 0 };
    } catch (error) {
      console.error('Error temp opening period:', error.message);
      return { success: false, code: -1, error: error.message };
    }
  }

  /**
   * Close temporarily opened period (DongKyMoTam)
   * Return codes: 0 = success, -1 = error
   */
  async closeTempOpenPeriod(chotKyId: number, nguoiDong: string): Promise<{ success: boolean; code?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();

      await sequelize.query(`
        UPDATE dbo.ChotKy SET TamMoKy = 0 WHERE ChotKyID = ${chotKyId}
      `);

      // Log system
      await this.logAction(nguoiDong, 'ChinhSua', 'ChotKy', chotKyId, `Đóng kỳ mở tạm: ${chotKyId}`);

      await sequelize.close();
      return { success: true, code: 0 };
    } catch (error) {
      console.error('Error closing temp period:', error.message);
      return { success: false, code: -1, error: error.message };
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
