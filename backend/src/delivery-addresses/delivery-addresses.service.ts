import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
const tedious = require('tedious');

export interface DeliveryAddress {
  ID: number;
  UserName: string;
  DiaChi: string;
}

export interface QueryDeliveryAddressDto {
  username?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateDeliveryAddressDto {
  username: string;
  diaChi: string;
}

export interface UpdateDeliveryAddressDto {
  id: number;
  username: string;
  diaChi: string;
}

/**
 * Delivery Addresses Service (DanhMucDiaChiNhanHang)
 *
 * CRUD operations for customer delivery addresses with pagination
 */
@Injectable()
export class DeliveryAddressesService {
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
   * Get paginated delivery addresses
   */
  async findAll(query: QueryDeliveryAddressDto): Promise<{ data: DeliveryAddress[]; total: number; page: number; limit: number }> {
    const { username, search, page = 1, limit = 20 } = query;

    try {
      const sequelize = this.getSequelize();

      let whereClause = 'WHERE 1=1';

      if (username) {
        whereClause += ` AND UserName = '${username}'`;
      }
      if (search) {
        whereClause += ` AND DiaChi LIKE '%${search}%'`;
      }

      // Get total count
      const [countResult]: any[] = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM dbo.DiaChiNhanHang ${whereClause}
      `);
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data
      const offset = (page - 1) * limit;
      const [data]: any[] = await sequelize.query(`
        SELECT ID, UserName, DiaChi
        FROM dbo.DiaChiNhanHang
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
      console.error('Error getting delivery addresses:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Get delivery address by ID
   */
  async findOne(id: number): Promise<DeliveryAddress | null> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(`
        SELECT ID, UserName, DiaChi
        FROM dbo.DiaChiNhanHang
        WHERE ID = ${id}
      `);
      await sequelize.close();
      return data[0] || null;
    } catch (error) {
      console.error('Error getting delivery address:', error.message);
      return null;
    }
  }

  /**
   * Create new delivery address
   */
  async create(createDto: CreateDeliveryAddressDto, nguoiTao: string): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      const [result]: any[] = await sequelize.query(`
        INSERT INTO dbo.DiaChiNhanHang (UserName, DiaChi)
        VALUES ('${createDto.username}', '${createDto.diaChi}');
        SELECT SCOPE_IDENTITY() as ID;
      `);
      const id = result[0]?.ID;

      // Log system
      await this.logAction(nguoiTao, 'ThemMoi', 'DiaChiNhanHang', id, `UserName: ${createDto.username}; DiaChi: ${createDto.diaChi}`);

      await sequelize.close();
      return { success: true, id };
    } catch (error) {
      console.error('Error creating delivery address:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update delivery address
   */
  async update(updateDto: UpdateDeliveryAddressDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        UPDATE dbo.DiaChiNhanHang
        SET UserName = '${updateDto.username}',
            DiaChi = '${updateDto.diaChi}'
        WHERE ID = ${updateDto.id}
      `);

      // Log system
      await this.logAction(nguoiCapNhat, 'ChinhSua', 'DiaChiNhanHang', updateDto.id, `UserName: ${updateDto.username}; DiaChi: ${updateDto.diaChi}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error updating delivery address:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete delivery address
   */
  async remove(id: number, nguoiXoa: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        DELETE FROM dbo.DiaChiNhanHang WHERE ID = ${id}
      `);

      // Log system
      await this.logAction(nguoiXoa, 'Xoa', 'DiaChiNhanHang', id, `ID: ${id}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error deleting delivery address:', error.message);
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
