import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

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
 * Uses SP_LayWebsite stored procedure (matching C# DBConnect.LayDanhSachWebsite)
 */
@Injectable()
export class WebsitesService {
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  /**
   * Get all websites using SP_LayWebsite
   */
  async findAll(): Promise<Website[]> {
    try {
      const [data]: any[] = await this.sequelize.query(`
        EXEC SP_LayWebsite
      `);
      return data || [];
    } catch (error: any) {
      console.error('Error getting websites:', error?.message || error);
      return [];
    }
  }

  /**
   * Get websites that have orders with "Received" status (SP_LayWebsiteByReceived)
   * Used in order management list dropdown filter
   */
  async findAllReceived(): Promise<Website[]> {
    try {
      const [data]: any[] = await this.sequelize.query(`
        EXEC SP_LayWebsiteByReceived
      `);
      return data || [];
    } catch (error: any) {
      console.error('Error getting received websites:', error?.message || error);
      return [];
    }
  }

  /**
   * Get website by ID
   */
  async findOne(id: number): Promise<Website | null> {
    try {
      const [data]: any[] = await this.sequelize.query(
        `SELECT * FROM WEBSITE WHERE ID = :id`,
        {
          replacements: { id },
        },
      );
      return data?.[0] || null;
    } catch (error: any) {
      console.error('Error getting website:', error?.message || error);
      return null;
    }
  }

  /**
   * Create new website
   */
  async create(createDto: CreateWebsiteDto, nguoiTao: string): Promise<{ success: boolean; id?: number; error?: string }> {
    try {
      const [result]: any[] = await this.sequelize.query(
        `EXEC SP_Them_Website @WebsiteName = :websiteName, @GhiChu = :ghiChu`,
        {
          replacements: {
            websiteName: createDto.websiteName,
            ghiChu: createDto.ghiChu || '',
          },
        },
      );
      const id = result?.[0]?.ID;

      // Log system
      await this.logAction(nguoiTao, 'Them moi', 'DanhMucWebsite:ThemWebsite', '', `; WebsiteName: ${createDto.websiteName}; GhiChu: ${createDto.ghiChu || ''}`);

      return { success: true, id };
    } catch (error: any) {
      console.error('Error creating website:', error?.message || error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  /**
   * Update website
   */
  async update(updateDto: UpdateWebsiteDto, nguoiCapNhat: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_CapNhat_Website @ID = :id, @WebsiteName = :websiteName, @GhiChu = :ghiChu`,
        {
          replacements: {
            id: updateDto.id,
            websiteName: updateDto.websiteName,
            ghiChu: updateDto.ghiChu || '',
          },
        },
      );

      // Log system
      await this.logAction(nguoiCapNhat, 'Chinh sua', 'DanhMucWebsite:CapNhatWebsite', updateDto.id, `ID: ${updateDto.id}; WebsiteName: ${updateDto.websiteName}; GhiChu: ${updateDto.ghiChu || ''}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error updating website:', error?.message || error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  /**
   * Delete website
   * Uses SP_Xoa_Website (matching C# code: DBConnect.XoaWebsite)
   */
  async remove(id: number, nguoiXoa: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_Xoa_Website @ID = :id`,
        {
          replacements: { id },
        },
      );

      // Log system
      await this.logAction(nguoiXoa, 'Xoa', 'DanhMucWebsite:XoaWebsite', id, `ID: ${id}`);

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting website:', error?.message || error);
      return { success: false, error: error?.message || String(error) };
    }
  }

  /**
   * Log system action
   */
  private async logAction(nguoiTao: string, hanhDong: string, nguon: string, doiTuong: number | string, noiDung: string): Promise<void> {
    try {
      await this.sequelize.query(
        `EXEC SP_Them_SystemLogs @NguoiTao = :nguoiTao, @Nguon = :nguon, @HanhDong = :hanhDong, @DoiTuong = :doiTuong, @NoiDung = :noiDung`,
        {
          replacements: {
            nguoiTao,
            nguon,
            hanhDong,
            doiTuong: String(doiTuong),
            noiDung,
          },
        },
      );
    } catch (error: any) {
      console.error('Error logging action:', error?.message || error);
    }
  }
}
