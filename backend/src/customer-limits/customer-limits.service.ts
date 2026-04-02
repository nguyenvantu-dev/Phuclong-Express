import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

export interface CustomerLimit {
  ID: number;
  UserName: string;
  DaQuaHanMuc: boolean;
  LaKhachVip: boolean;
}

export interface QueryCustomerLimitDto {
  username?: string;
  page?: number;
  limit?: number;
}

export interface CreateCustomerLimitDto {
  username: string;
  daQuaHanMuc: boolean;
  laKhachVip: boolean;
}

export interface UpdateCustomerLimitDto {
  id: number;
  daQuaHanMuc: boolean;
  laKhachVip: boolean;
}

/**
 * Customer Limits Service (DanhMucHanMucKhachHang)
 *
 * CRUD operations for customer credit limit management with pagination
 */
@Injectable()
export class CustomerLimitsService {
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
    });
  }

  /**
   * Get paginated customer limits
   */
  async findAll(query: QueryCustomerLimitDto): Promise<{ data: CustomerLimit[]; total: number; page: number; limit: number }> {
    const { username, page = 1, limit = 20 } = query;

    try {
      const sequelize = this.getSequelize();

      let whereClause = 'WHERE 1=1';

      if (username) {
        whereClause += ` AND UserName LIKE '%${username}%'`;
      }

      // Get total count
      const [countResult]: any[] = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM dbo.HanMucKhachHang ${whereClause}
      `);
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data
      const offset = (page - 1) * limit;
      const [data]: any[] = await sequelize.query(`
        SELECT ID, UserName, DaQuaHanMuc, LaKhachVip
        FROM dbo.HanMucKhachHang
        ${whereClause}
        ORDER BY ID DESC
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
      console.error('Error getting customer limits:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Get customer limit by ID
   */
  async findOne(id: number): Promise<CustomerLimit | null> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(`
        SELECT ID, UserName, DaQuaHanMuc, LaKhachVip
        FROM dbo.HanMucKhachHang
        WHERE ID = ${id}
      `);
      await sequelize.close();
      return data[0] || null;
    } catch (error) {
      console.error('Error getting customer limit:', error.message);
      return null;
    }
  }

  /**
   * Create new customer limit
   */
  async create(createDto: CreateCustomerLimitDto, nguoiTao: string): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      const [result]: any[] = await sequelize.query(`
        INSERT INTO dbo.HanMucKhachHang (UserName, DaQuaHanMuc, LaKhachVip)
        VALUES ('${createDto.username}', ${createDto.daQuaHanMuc ? 1 : 0}, ${createDto.laKhachVip ? 1 : 0});
        SELECT SCOPE_IDENTITY() as ID;
      `);
      const id = result[0]?.ID;

      // Log system
      await this.logAction(nguoiTao, 'ThemMoi', 'HanMucKhachHang', id, `UserName: ${createDto.username}; DaQuaHanMuc: ${createDto.daQuaHanMuc}; LaKhachVip: ${createDto.laKhachVip}`);

      await sequelize.close();
      return { success: true, id };
    } catch (error) {
      console.error('Error creating customer limit:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update customer limit
   */
  async update(updateDto: UpdateCustomerLimitDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        UPDATE dbo.HanMucKhachHang
        SET DaQuaHanMuc = ${updateDto.daQuaHanMuc ? 1 : 0},
            LaKhachVip = ${updateDto.laKhachVip ? 1 : 0}
        WHERE ID = ${updateDto.id}
      `);

      // Log system
      await this.logAction(nguoiCapNhat, 'ChinhSua', 'HanMucKhachHang', updateDto.id, `DaQuaHanMuc: ${updateDto.daQuaHanMuc}; LaKhachVip: ${updateDto.laKhachVip}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error updating customer limit:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete customer limit
   */
  async remove(id: number, nguoiXoa: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        DELETE FROM dbo.HanMucKhachHang WHERE ID = ${id}
      `);

      // Log system
      await this.logAction(nguoiXoa, 'Xoa', 'HanMucKhachHang', id, `ID: ${id}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer limit:', error.message);
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
