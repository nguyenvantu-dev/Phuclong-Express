import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
const tedious = require('tedious');

export interface Website {
  ID: number;
  WebsiteName: string;
  GhiChu: string;
}

export interface CreateWebsiteDto {
  websiteName: string;
  ghiChu?: string;
}

export interface UpdateWebsiteDto {
  id: number;
  websiteName: string;
  ghiChu?: string;
}

/**
 * Websites Service (DanhMucWebsite)
 *
 * CRUD operations for website catalog
 */
@Injectable()
export class WebsitesService {
  private getSequelize(): Sequelize {
    return new Sequelize({
      dialect: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '1433'),
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || process.env.DB_NAME || 'PhucLong',
      logging: false,
      dialectOptions: {
        encrypt: true,
        trustServerCertificate: true,
      },
      dialectModule: tedious
    });
  }

  /**
   * Get all websites
   */
  async findAll(): Promise<Website[]> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(`
        SELECT ID, WebsiteName, GhiChu
        FROM dbo.WEBSITE
        ORDER BY WebsiteName
      `);
      await sequelize.close();
      return data || [];
    } catch (error) {
      console.error('Error getting websites:', error.message);
      return [];
    }
  }

  /**
   * Get website by ID
   */
  async findOne(id: number): Promise<Website | null> {
    try {
      const sequelize = this.getSequelize();
      const [data]: any[] = await sequelize.query(`
        SELECT ID, WebsiteName, GhiChu
        FROM dbo.WEBSITE
        WHERE ID = ${id}
      `);
      await sequelize.close();
      return data[0] || null;
    } catch (error) {
      console.error('Error getting website:', error.message);
      return null;
    }
  }

  /**
   * Create new website
   */
  async create(createDto: CreateWebsiteDto, nguoiTao: string): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      const [result]: any[] = await sequelize.query(`
        INSERT INTO dbo.WEBSITE (WebsiteName, GhiChu)
        VALUES ('${createDto.websiteName}', '${createDto.ghiChu || ''}');
        SELECT SCOPE_IDENTITY() as ID;
      `);
      const id = result[0]?.ID;

      // Log system
      await this.logAction(nguoiTao, 'ThemMoi', 'Website', id, `WebsiteName: ${createDto.websiteName}; GhiChu: ${createDto.ghiChu || ''}`);

      await sequelize.close();
      return { success: true, id };
    } catch (error) {
      console.error('Error creating website:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update website
   */
  async update(updateDto: UpdateWebsiteDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        UPDATE dbo.WEBSITE
        SET WebsiteName = '${updateDto.websiteName}',
            GhiChu = '${updateDto.ghiChu || ''}'
        WHERE ID = ${updateDto.id}
      `);

      // Log system
      await this.logAction(nguoiCapNhat, 'ChinhSua', 'Website', updateDto.id, `WebsiteName: ${updateDto.websiteName}; GhiChu: ${updateDto.ghiChu || ''}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error updating website:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete website
   */
  async remove(id: number, nguoiXoa: string): Promise<{ success: boolean; error?: string }> {
    try {
      const sequelize = this.getSequelize();
      await sequelize.query(`
        DELETE FROM dbo.WEBSITE WHERE ID = ${id}
      `);

      // Log system
      await this.logAction(nguoiXoa, 'Xoa', 'Website', id, `ID: ${id}`);

      await sequelize.close();
      return { success: true };
    } catch (error) {
      console.error('Error deleting website:', error.message);
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
