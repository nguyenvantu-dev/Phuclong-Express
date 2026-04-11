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
      database: process.env.DB_DATABASE || 'PhucLong',
      logging: false,
      dialectOptions: {
        options: {
          encrypt: true,
          trustServerCertificate: true,
          enableArithAbort: true,
        },
      },
      dialectModule: tedious
    });
  }

  /**
   * Get all periods (list)
   * Matches: DBConnect.LayDanhSachKy() → SP_Lay_Ky
   */
  async findAll(): Promise<Period[]> {
    const sequelize = this.getSequelize();
    try {
      const [data]: any[] = await sequelize.query(`EXEC SP_Lay_Ky`);
      return data || [];
    } catch (error) {
      console.error('Error getting periods:', (error as any).message);
      return [];
    } finally {
      await sequelize.close();
    }
  }

  /**
   * Get period by ID
   * Matches: DBConnect.LayKyByID(@KyID) → SP_Lay_KyByID
   */
  async findOne(id: number): Promise<Period | null> {
    const sequelize = this.getSequelize();
    try {
      const [data]: any[] = await sequelize.query(
        `EXEC SP_Lay_KyByID @KyID = :id`,
        { replacements: { id } },
      );
      return (data as any[])[0] || null;
    } catch (error) {
      console.error('Error getting period:', (error as any).message);
      return null;
    } finally {
      await sequelize.close();
    }
  }

  /**
   * Create new period
   * Matches: DBConnect.ThemKy(@Thang, @Nam) → SP_Them_Ky
   * Return codes: 0 = success, 1 = duplicate, -1 = error
   */
  async create(createDto: CreatePeriodDto, nguoiTao: string): Promise<{ success: boolean; code?: number; error?: string }> {
    const sequelize = this.getSequelize();
    try {
      const [[result]]: any = await sequelize.query(
        `EXEC SP_Them_Ky @Thang = :thang, @Nam = :nam`,
        { replacements: { thang: createDto.thang, nam: createDto.nam } },
      );
      const code = Number((Object.values(result)[0]) ?? -1);

      if (code === 0) {
        await this.logAction(nguoiTao, 'ThemMoi', 'Ky', '', `Năm: ${createDto.nam}; Tháng: ${createDto.thang}`);
      }

      return { success: code === 0, code };
    } catch (error) {
      console.log(error);
      console.error('Error creating period:', (error as any).message);
      return { success: false, code: -1, error: (error as any).message };
    } finally {
      await sequelize.close();
    }
  }

  /**
   * Update period
   * Matches: DBConnect.SuaKy(@KyID, @Thang, @Nam) → SP_Sua_Ky
   * Return codes: 0 = success, 1 = duplicate, 2 = has data, -1 = error
   */
  async update(updateDto: UpdatePeriodDto, nguoiCapNhat: string): Promise<{ success: boolean; code?: number; error?: string }> {
    const sequelize = this.getSequelize();
    try {
      const [[result]]: any[] = await sequelize.query(
        `EXEC SP_Sua_Ky @KyID = :id, @Thang = :thang, @Nam = :nam`,
        { replacements: { id: updateDto.id, thang: updateDto.thang, nam: updateDto.nam } },
      );
      const code = Number(Object.values(result)[0] ?? -1);

      if (code === 0) {
        await this.logAction(nguoiCapNhat, 'ChinhSua', 'Ky', updateDto.id, `KyID: ${updateDto.id}; Năm: ${updateDto.nam}; Tháng: ${updateDto.thang}`);
      }

      return { success: code === 0, code };
    } catch (error) {
      console.error('Error updating period:', (error as any).message);
      return { success: false, code: -1, error: (error as any).message };
    } finally {
      await sequelize.close();
    }
  }

  /**
   * Delete period
   * Matches: DBConnect.XoaKy(@KyID) → SP_Xoa_Ky
   * Return codes: 0 = success, 1 = has data, -1 = error
   */
  async remove(id: number, nguoiXoa: string): Promise<{ success: boolean; code?: number; error?: string }> {
    const sequelize = this.getSequelize();
    try {
      const [[result]]: any[] = await sequelize.query(
        `EXEC SP_Xoa_Ky @KyID = :id`,
        { replacements: { id } },
      );
      const code = Number(Object.values(result)[0] ?? -1);

      if (code === 0) {
        await this.logAction(nguoiXoa, 'Xoa', 'Ky', id, `KyID: ${id}`);
      }

      return { success: code === 0, code };
    } catch (error) {
      console.error('Error deleting period:', (error as any).message);
      return { success: false, code: -1, error: (error as any).message };
    } finally {
      await sequelize.close();
    }
  }

  /**
   * Close period (DongKy)
   * Matches: DBConnect.DongKy(@KyCanDongID, @UserName, @LaKyDauTien, @NguoiTao) → SP_DongKy
   * Return codes: 0 = success, 1 = previous not closed, 2 = no previous, 3 = pending data, -1 = error
   */
  async closePeriod(id: number, nguoiDong: string): Promise<{ success: boolean; code?: number; error?: string }> {
    const sequelize = this.getSequelize();
    try {
      const [[result]]: any[] = await sequelize.query(
        `EXEC SP_DongKy @KyCanDongID = :id, @UserName = :username, @LaKyDauTien = 0, @NguoiTao = :nguoiTao`,
        { replacements: { id, username: nguoiDong, nguoiTao: nguoiDong } },
      );
      const code = Number(Object.values(result)[0] ?? -1);

      if (code === 0) {
        await this.logAction(nguoiDong, 'ChinhSua', 'Ky', id, `Đóng kỳ ID: ${id}`);
      }

      return { success: code === 0, code };
    } catch (error) {
      console.error('Error closing period:', (error as any).message);
      return { success: false, code: -1, error: (error as any).message };
    } finally {
      await sequelize.close();
    }
  }

  // ========== Period Detail (ChotKy) Methods ==========

  /**
   * Get periods filtered by status (open/closed)
   * Matches: DBConnect.LayDanhSachKyByTinhTrang(@DaDong) → SP_Lay_KyByTinhTrang
   */
  async findByStatus(daDong: boolean): Promise<Period[]> {
    const sequelize = this.getSequelize();
    try {
      const [data]: any[] = await sequelize.query(
        `EXEC SP_Lay_KyByTinhTrang @DaDong = :daDong`,
        { replacements: { daDong } },
      );
      return data || [];
    } catch (error) {
      console.error('Error getting periods by status:', (error as any).message);
      return [];
    } finally {
      await sequelize.close();
    }
  }

  /**
   * Get period details with pagination
   * Matches: DBConnect.LayDanhSachChotKy(@KyID, @UserName, @TamMoKy, @PageSize, @PageNum) → SP_Lay_ChotKyPhanTrang
   * SP returns 2 result sets: Tables[0] = TotalItem count, Tables[1] = ChotKy rows
   */
  async findAllDetails(query: QueryPeriodDetailDto): Promise<{ data: PeriodDetail[]; total: number; page: number; limit: number }> {
    const { kyId, username, trangThai, page = 1, limit = 200 } = query;
    const sequelize = this.getSequelize();
    try {
      const [rawResult]: any[] = await sequelize.query(
        `EXEC SP_Lay_ChotKyPhanTrang @KyID = :kyId, @UserName = :username, @TamMoKy = :tamMoKy, @PageSize = :pageSize, @PageNum = :pageNum`,
        {
          replacements: {
            kyId: kyId && kyId > 0 ? kyId : -1,
            username: username || '',
            tamMoKy: trangThai !== undefined ? trangThai : -1,
            pageSize: limit,
            pageNum: page,
          },
        },
      );
      // SP returns 2 tables: [0] = total count row, [1] = ChotKy data rows
      // tedious may return them as nested arrays or concatenated
      let total = 0;
      let data: any[] = [];
      if (Array.isArray(rawResult)) {
        if (Array.isArray(rawResult[0])) {
          // Multiple result sets returned as nested arrays
          total = Number(rawResult[0]?.[0]?.[0] ?? 0);
          data = rawResult[1] ?? [];
        } else {
          // Single result set: first row is count, rest are data
          total = Number(Object.values(rawResult[0] ?? {})[0] ?? 0);
          data = rawResult.slice(1);
        }
      }
      return { data, total, page, limit };
    } catch (error) {
      console.error('Error getting period details:', (error as any).message);
      return { data: [], total: 0, page, limit };
    } finally {
      await sequelize.close();
    }
  }

  /**
   * Temporarily open period for user (TamMoKy)
   * Matches: DBConnect.TamMoKy(@ChotKyID) → SP_TamMoKy
   * Return codes: 0 = success, 1 = too far from current period, -1 = error
   */
  async tempOpenPeriod(chotKyId: number, nguoiMo: string): Promise<{ success: boolean; code?: number; error?: string }> {
    const sequelize = this.getSequelize();
    try {
      const [[result]]: any[] = await sequelize.query(
        `EXEC SP_TamMoKy @ChotKyID = :chotKyId`,
        { replacements: { chotKyId } },
      );
      const code = Number((result as any)?.[0] ?? -1);

      if (code === 0) {
        await this.logAction(nguoiMo, 'ChinhSua', 'ChotKy', chotKyId, `Tạm mở kỳ ID: ${chotKyId}`);
      }

      return { success: code === 0, code };
    } catch (error) {
      console.error('Error temp opening period:', (error as any).message);
      return { success: false, code: -1, error: (error as any).message };
    } finally {
      await sequelize.close();
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
      console.error('Error closing temp period:', (error as any).message);
      return { success: false, code: -1, error: (error as any).message };
    }
  }

  /**
   * Log system action
   */
  private async logAction(nguoiTao: string, hanhDong: string, nguon: string, doiTuong: number | string, noiDung: string): Promise<void> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        INSERT INTO dbo.tbSystemLogs (NguoiTao, NgayTao, Nguon, HanhDong, DoiTuong, NoiDung)
        VALUES ('${nguoiTao}', GETDATE(), '${nguon}', '${hanhDong}', '${doiTuong}', '${noiDung}')
      `);
      await sequelize.close();
    } catch (error) {
      console.error('Error logging action:', (error as any).message);
    }
  }

  /**
   * Get sent shipment batches for user with pagination (DotHangUser.aspx)
   * Matches: DotHangUser.cs -> Page_Load -> bLL.LayDotHangGui(username, 20, pageNum)
   * Uses: SP_Lay_DotHangGui @UserName, @PageSize, @PageNum
   */
  async getDotHangGui(username: string, pageSize: number = 20, pageNum: number = 1): Promise<{ data: any[]; total: number }> {
    const sequelize = this.getSequelize();
    try {
      const [results] = await sequelize.query(
        `EXEC SP_Lay_DotHangGui
          @UserName = :username,
          @PageSize = :pageSize,
          @PageNum = :pageNum`,
        { replacements: { username, pageSize, pageNum }, type: 'SELECT' as const },
      );
      const data = Array.isArray(results) ? results : [];
      const total = data.length > 0 ? ((data[0] as any).TOTALROW ?? data.length) : 0;
      return { data, total };
    } catch (error) {
      console.error('Error in getDotHangGui:', (error as any).message);
      return { data: [], total: 0 };
    } finally {
      await sequelize.close();
    }
  }

  /**
   * Get shipment batch names by user (ThongTinDotHang.aspx - dropdown)
   * Matches: ThongTinDotHang.cs -> Page_Load -> SP_Lay_TenDotHangByUserName(@UserName)
   */
  async getTenDotHangByUserName(username: string): Promise<any[]> {
    const sequelize = this.getSequelize();
    try {
      const [results] = await sequelize.query(
        `EXEC SP_Lay_TenDotHangByUserName @UserName = :username`,
        { replacements: { username }, type: 'SELECT' as const },
      );
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error('Error in getTenDotHangByUserName:', (error as any).message);
      return [];
    } finally {
      await sequelize.close();
    }
  }

  /**
   * Get orders in a shipment batch for user (ThongTinDotHang.aspx - btTimKiem)
   * Matches: ThongTinDotHang.cs -> btTimKiem_Click -> SP_Lay_DonHangUserTheoDotHang(@TenDotHang, @UserName)
   * SP returns 2 tables: summary + order list
   */
  async getDonHangUserTheoDotHang(tenDotHang: string, username: string): Promise<{ data: any[]; summary: any }> {
    const sequelize = this.getSequelize();
    try {
      const [results] = await sequelize.query(
        `EXEC [SP_Lay_DonHangUserTheoDotHang]
          @TenDotHang = :tenDotHang,
          @UserName = :username`,
        { replacements: { tenDotHang, username } },
      );
      const rows = Array.isArray(results) ? results as any[] : [];
      // First row is summary, rest are order details (C# reads 2 DataTables)
      const summary = rows.length > 0 ? rows[0] : {};
      const data = rows.slice(1);
      return { data, summary };
    } catch (error) {
      console.error('Error in getDonHangUserTheoDotHang:', (error as any).message);
      return { data: [], summary: {} };
    } finally {
      await sequelize.close();
    }
  }
}
