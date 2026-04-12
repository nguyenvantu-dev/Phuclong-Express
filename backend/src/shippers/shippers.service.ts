import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

/**
 * Shippers Service
 *
 * Handles shipper management operations
 */
@Injectable()
export class ShippersService {
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  /**
   * Get all shippers
   * Matches: LoadDanhSachShipper() in Shipper_LietKe.cs
   */
  async getShippers(): Promise<any[]> {
    try {
      const [results] = await this.sequelize.query(`EXEC SP_Lay_Shipper`, {
        type: 'SELECT' as const,
      });
      return results || [];
    } catch (error) {
      console.error('Error in getShippers:', error.message);
      return [];
    }
  }

  /**
   * Get shipper by ID
   * Matches: LoadDataShipper() in Shipper_Them.cs
   */
  async getShipperById(id: number): Promise<any> {
    try {
      const [results] = await this.sequelize.query(
        `EXEC SP_Lay_ShipperByID @ID = :id`,
        {
          replacements: { id },
          type: 'SELECT' as const,
        },
      );
      const data = Array.isArray(results) && results.length > 0 ? results[0] : null;
      return data;
    } catch (error) {
      console.error('Error in getShipperById:', error.message);
      return null;
    }
  }

  /**
   * Create new shipper
   * Matches: btCapNhat_Click() -> ThemShipper() in Shipper_Them.cs
   */
  async createShipper(
    dto: {
      shipperName: string;
      shipperPhone: string;
      shipperAddress?: string;
    },
    username?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!dto.shipperName || dto.shipperName.trim() === '') {
        return { success: false, message: 'Vui lòng nhập tên shipper' };
      }

      if (!dto.shipperPhone || dto.shipperPhone.trim() === '') {
        return { success: false, message: 'Vui lòng nhập số điện thoại shipper' };
      }

      await this.sequelize.query(
        `EXEC SP_Them_Shipper
          @ShipperName = :shipperName,
          @ShipperPhone = :shipperPhone,
          @ShipperAddress = :shipperAddress`,
        {
          replacements: {
            shipperName: dto.shipperName.trim(),
            shipperPhone: dto.shipperPhone.trim(),
            shipperAddress: dto.shipperAddress?.trim() || '',
          },
          type: 'SELECT' as const,
        },
      );

      // Log the action
      if (username) {
        await this.sequelize.query(
          `EXEC SP_Them_SystemLogs
            @NguoiTao = :username,
            @Nguon = :chucNang,
            @HanhDong = :hanhDong,
            @DoiTuong = :ma,
            @NoiDung = :ghiChu`,
          {
            replacements: {
              username,
              chucNang: 'Shipper_Them:ThemShipper',
              hanhDong: 'Them moi',
              ma: '',
              ghiChu: `ShipperName: ${dto.shipperName}; ShipperPhone: ${dto.shipperPhone}; ShipperAddress: ${dto.shipperAddress || ''}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in createShipper:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update shipper
   * Matches: btCapNhat_Click() -> CapNhatShipper() in Shipper_Them.cs
   */
  async updateShipper(
    id: number,
    dto: {
      shipperName?: string;
      shipperPhone?: string;
      shipperAddress?: string;
    },
    username?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!dto.shipperName || dto.shipperName.trim() === '') {
        return { success: false, message: 'Vui lòng nhập tên shipper' };
      }

      if (!dto.shipperPhone || dto.shipperPhone.trim() === '') {
        return { success: false, message: 'Vui lòng nhập số điện thoại shipper' };
      }

      await this.sequelize.query(
        `EXEC SP_CapNhat_Shipper
          @ID = :id,
          @ShipperName = :shipperName,
          @ShipperPhone = :shipperPhone,
          @ShipperAddress = :shipperAddress`,
        {
          replacements: {
            id,
            shipperName: dto.shipperName.trim(),
            shipperPhone: dto.shipperPhone.trim(),
            shipperAddress: dto.shipperAddress?.trim() || '',
          },
          type: 'SELECT' as const,
        },
      );

      // Log the action
      if (username) {
        await this.sequelize.query(
          `EXEC SP_Them_SystemLogs
            @NguoiTao = :username,
            @Nguon = :chucNang,
            @HanhDong = :hanhDong,
            @DoiTuong = :ma,
            @NoiDung = :ghiChu`,
          {
            replacements: {
              username,
              chucNang: 'Shipper_Them:CapNhatShipper',
              hanhDong: 'Chinh sua',
              ma: id.toString(),
              ghiChu: `ID:${id}; ShipperName: ${dto.shipperName}; ShipperPhone: ${dto.shipperPhone}; ShipperAddress: ${dto.shipperAddress || ''}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateShipper:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete shipper
   * Matches: gvShipper_RowDeleting() -> XoaShipper() in Shipper_LietKe.cs
   */
  async deleteShipper(id: number, username?: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_Xoa_Shipper @ID = :id`,
        {
          replacements: { id },
          type: 'SELECT' as const,
        },
      );

      // Log the action
      if (username) {
        await this.sequelize.query(
          `EXEC SP_Them_SystemLogs
            @NguoiTao = :username,
            @Nguon = :chucNang,
            @HanhDong = :hanhDong,
            @DoiTuong = :ma,
            @NoiDung = :ghiChu`,
          {
            replacements: {
              username,
              chucNang: 'Shipper_LietKe:XoaShipper',
              hanhDong: 'Xoa',
              ma: '',
              ghiChu: `ID: ${id}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteShipper:', error.message);
      return { success: false, message: error.message };
    }
  }
}
