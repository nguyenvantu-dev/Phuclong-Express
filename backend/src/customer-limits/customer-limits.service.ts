import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
const tedious = require('tedious');


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
      database: process.env.DB_DATABASE || 'PhucLong',
      logging: false,
      dialectOptions: {
        encrypt: true,
        trustServerCertificate: true,
      },
      dialectModule: tedious
    });
  }

  /**
   * Get paginated customer limits (USP: SP_Lay_HanMucKhachHang)
   */
  async findAll(query: QueryCustomerLimitDto): Promise<{ data: CustomerLimit[]; total: number; page: number; limit: number }> {
    const { username, page = 1, limit = 20 } = query;

    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();

      // Use stored procedure: SP_Lay_HanMucKhachHang with parameterized query
      const [data]: any[] = await sequelize.query(
        `EXEC SP_Lay_HanMucKhachHang @UserName=:username, @PageSize=:pageSize, @PageNum=:pageNum`,
        {
          replacements: {
            username: username || '',
            pageSize: limit,
            pageNum: page,
          },
          raw: true,
        }
      );

      // Get total count with parameterized query
      const searchPattern = username ? `%${username}%` : '%';
      const [countResult]: any[] = await sequelize.query(
        `SELECT COUNT(*) as total FROM dbo.HanMucKhachHang WHERE UserName LIKE :searchPattern`,
        {
          replacements: { searchPattern },
          raw: true,
        }
      );
      const total = Number(countResult[0]?.total) || 0;

      await sequelize.close();

      return {
        data: data || [],
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error getting customer limits:', error.message, error.stack);
      if (sequelize) await sequelize.close();
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Get customer limit by ID (USP: SP_Lay_HanMucKhachHang_ID)
   */
  async findOne(id: number): Promise<CustomerLimit | null> {
    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(
        `SELECT ID, UserName, DaQuaHanMuc, LaKhachVip FROM dbo.HanMucKhachHang WHERE ID = :id`,
        {
          replacements: { id },
          raw: true,
        }
      );
      await sequelize.close();
      return data[0] || null;
    } catch (error) {
      console.error('Error getting customer limit:', error.message, error.stack);
      if (sequelize) await sequelize.close();
      return null;
    }
  }

  /**
   * Create new customer limit (USP: SP_Them_HanMucKhachHang)
   */
  async create(createDto: CreateCustomerLimitDto, nguoiTao: string): Promise<{ success: boolean; id?: number; error?: string }> {
    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();

      // Use stored procedure: SP_Them_HanMucKhachHang with parameterized query
      await sequelize.query(
        `EXEC SP_Them_HanMucKhachHang @UserName=:username, @DaQuaHanMuc=:daQuaHanMuc, @LaKhachVip=:laKhachVip`,
        {
          replacements: {
            username: createDto.username,
            daQuaHanMuc: createDto.daQuaHanMuc ? 1 : 0,
            laKhachVip: createDto.laKhachVip ? 1 : 0,
          },
        }
      );

      // Get the ID just created
      const [result]: any[] = await sequelize.query(
        `SELECT TOP 1 ID FROM dbo.HanMucKhachHang WHERE UserName = :username ORDER BY ID DESC`,
        {
          replacements: { username: createDto.username },
          raw: true,
        }
      );
      const id = result[0]?.ID;

      // Log system
      await this.logAction(nguoiTao, 'Them moi', 'DanhMucHanMucKhachHang:ThemHanMucKhachHang', '', `UserName: ${createDto.username}; DaQuaHanMuc: ${createDto.daQuaHanMuc}; LaKhachVip: ${createDto.laKhachVip}`);

      await sequelize.close();
      return { success: true, id };
    } catch (error) {
      console.error('Error creating customer limit:', error.message, error.stack);
      if (sequelize) await sequelize.close();
      return { success: false, error: error.message };
    }
  }

  /**
   * Update customer limit (USP: SP_CapNhat_HanMucKhachHang)
   */
  async update(updateDto: UpdateCustomerLimitDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();

      // Use stored procedure: SP_CapNhat_HanMucKhachHang with parameterized query
      await sequelize.query(
        `EXEC SP_CapNhat_HanMucKhachHang @ID=:id, @DaQuaHanMuc=:daQuaHanMuc, @LaKhachVip=:laKhachVip`,
        {
          replacements: {
            id: updateDto.id,
            daQuaHanMuc: updateDto.daQuaHanMuc ? 1 : 0,
            laKhachVip: updateDto.laKhachVip ? 1 : 0,
          },
        }
      );

      // Log system
      await this.logAction(nguoiCapNhat, 'Chinh sua', 'DanhMucHanMucKhachHang:CapNhatHanMucKhachHang', updateDto.id, `DaQuaHanMuc: ${updateDto.daQuaHanMuc}; LaKhachVip: ${updateDto.laKhachVip}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error updating customer limit:', error.message, error.stack);
      if (sequelize) await sequelize.close();
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete customer limit (USP: SP_Xoa_HanMucKhachHang)
   */
  async remove(id: number, nguoiXoa: string): Promise<{ success: boolean; error?: string }> {
    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();

      // Use stored procedure: SP_Xoa_HanMucKhachHang with parameterized query
      await sequelize.query(
        `EXEC SP_Xoa_HanMucKhachHang @ID=:id`,
        {
          replacements: { id },
        }
      );

      // Log system
      await this.logAction(nguoiXoa, 'Xoa', 'DanhMucHanMucKhachHang:XoaHanMucKhachHang', id, `ID: ${id}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error deleting customer limit:', error.message, error.stack);
      if (sequelize) await sequelize.close();
      return { success: false, error: error.message };
    }
  }

  /**
   * Log system action
   */
  private async logAction(nguoiTao: string, hanhDong: string, nguon: string, doiTuong: number | string, noiDung: string): Promise<void> {
    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();
      await sequelize.query(
        `INSERT INTO dbo.tbSystemLogs (NguoiTao, NgayTao, Nguon, HanhDong, DoiTuong, NoiDung) VALUES (:nguoiTao, GETDATE(), :nguon, :hanhDong, :doiTuong, :noiDung)`,
        {
          replacements: {
            nguoiTao,
            nguon,
            hanhDong,
            doiTuong: String(doiTuong),
            noiDung,
          },
        }
      );
      await sequelize.close();
    } catch (error) {
      console.error('Error logging action:', error.message, error.stack);
      if (sequelize) await sequelize.close();
    }
  }
}
