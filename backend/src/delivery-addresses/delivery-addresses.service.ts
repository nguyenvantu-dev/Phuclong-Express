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
   * Get paginated delivery addresses (USP: SP_Lay_DiaChiNhanHang)
   */
  async findAll(query: QueryDeliveryAddressDto): Promise<{ data: DeliveryAddress[]; total: number; page: number; limit: number }> {
    const { username, search, page = 1, limit = 20 } = query;

    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();

      // SP_Lay_DiaChiNhanHang returns 2 result sets merged into 1 array by Sequelize:
      // - rows with TOTALROW = count row (result set 1)
      // - rows with ID, UserName, DiaChi (result set 2)
      const [rows]: any[] = await sequelize.query(
        `EXEC SP_Lay_DiaChiNhanHang @UserName=:username, @NoiDungTim=:search, @PageSize=:pageSize, @PageNum=:pageNum`,
        {
          replacements: {
            username: username || '',
            search: search || '',
            pageSize: limit,
            pageNum: page,
          },
          raw: true,
        }
      );

      const totalRow = rows.find((r: any) => 'TOTALROW' in r);
      const total = Number(totalRow?.TOTALROW) || 0;
      const data = (rows as any[]).filter((r: any) => 'ID' in r);

      await sequelize.close();

      return {
        data,
        total,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error getting delivery addresses:', error.message, error.stack);
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
   * Get delivery address by ID
   */
  async findOne(id: number): Promise<DeliveryAddress | null> {
    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(
        `SELECT ID, UserName, DiaChi FROM dbo.DiaChiNhanHang WHERE ID = :id`,
        {
          replacements: { id },
          raw: true,
        }
      );
      await sequelize.close();
      return data[0] || null;
    } catch (error: any) {
      console.error('Error getting delivery address:', error.message, error.stack);
      if (sequelize) await sequelize.close();
      return null;
    }
  }

  /**
   * Create new delivery address (USP: SP_Them_DiaChiNhanHang)
   */
  async create(createDto: CreateDeliveryAddressDto, nguoiTao: string): Promise<{ success: boolean; id?: number; error?: string }> {
    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();

      // Use stored procedure: SP_Them_DiaChiNhanHang with parameterized query
      await sequelize.query(
        `EXEC SP_Them_DiaChiNhanHang @UserName=:username, @DiaChi=:diaChi`,
        {
          replacements: {
            username: createDto.username,
            diaChi: createDto.diaChi,
          },
        }
      );

      // Get the ID just created
      const [result]: any[] = await sequelize.query(
        `SELECT TOP 1 ID FROM dbo.DiaChiNhanHang WHERE UserName = :username ORDER BY ID DESC`,
        {
          replacements: { username: createDto.username },
          raw: true,
        }
      );
      const id = result[0]?.ID;

      // Log system
      await this.logAction(nguoiTao, 'ThemMoi', 'DanhMucDiaChiNhanHang:ThemDiaChiNhanHang', id, `UserName: ${createDto.username}; DiaChi: ${createDto.diaChi}`);

      await sequelize.close();
      return { success: true, id };
    } catch (error: any) {
      console.error('Error creating delivery address:', error.message, error.stack);
      if (sequelize) await sequelize.close();
      return { success: false, error: error.message };
    }
  }

  /**
   * Update delivery address (USP: SP_CapNhat_DiaChiNhanHang)
   */
  async update(updateDto: UpdateDeliveryAddressDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();

      // Use stored procedure: SP_CapNhat_DiaChiNhanHang with parameterized query
      await sequelize.query(
        `EXEC SP_CapNhat_DiaChiNhanHang @ID=:id, @UserName=:username, @DiaChi=:diaChi`,
        {
          replacements: {
            id: updateDto.id,
            username: updateDto.username,
            diaChi: updateDto.diaChi,
          },
        }
      );

      // Log system
      await this.logAction(nguoiCapNhat, 'ChinhSua', 'DanhMucDiaChiNhanHang:CapNhatDiaChiNhanHang', updateDto.id, `UserName: ${updateDto.username}; DiaChi: ${updateDto.diaChi}`);

      await sequelize.close();
      return { success: true };
    } catch (error: any) {
      console.error('Error updating delivery address:', error.message, error.stack);
      if (sequelize) await sequelize.close();
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete delivery address (USP: SP_Xoa_DiaChiNhanHang)
   */
  async remove(id: number, nguoiXoa: string): Promise<{ success: boolean; error?: string }> {
    let sequelize: Sequelize | null = null;
    try {
      sequelize = this.getSequelize();

      // Use stored procedure: SP_Xoa_DiaChiNhanHang with parameterized query
      await sequelize.query(
        `EXEC SP_Xoa_DiaChiNhanHang @ID=:id`,
        {
          replacements: { id },
        }
      );

      // Log system
      await this.logAction(nguoiXoa, 'Xoa', 'DanhMucDiaChiNhanHang:XoaDiaChiNhanHang', id, `ID: ${id}`);

      await sequelize.close();
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting delivery address:', error.message, error.stack);
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
    } catch (error: any) {
      console.error('Error logging action:', error.message, error.stack);
      if (sequelize) await sequelize.close();
    }
  }
}
