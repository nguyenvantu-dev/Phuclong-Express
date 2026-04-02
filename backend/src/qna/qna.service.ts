import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

/**
 * Q&A Service
 *
 * Handles Q&A management operations for admin
 */
@Injectable()
export class QnaService {
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  /**
   * Get Q&A list with filters and pagination
   * Matches: LoadDanhSachThacMac() in HoiDapAdmin.cs
   */
  async getQnaList(
    username?: string,
    daTraLoi?: number,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      const [results] = await this.sequelize.query(
        `EXEC SP_Lay_DanhSach_ThacMac
          @UserName = :username,
          @DaTraLoi = :daTraLoi,
          @PageSize = :limit,
          @PageNum = :page`,
        {
          replacements: {
            username: username || '',
            daTraLoi: daTraLoi ?? -1,
            limit,
            page,
          },
        },
      );

      const data = Array.isArray(results) ? results : [];
      const firstItem = data.length > 0 ? data[0] as any : null;
      const total = firstItem?.TotalCount ? firstItem.TotalCount : data.length;

      return { data, total: Number(total), page, limit };
    } catch (error) {
      console.error('Error in getQnaList:', error.message);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Answer Q&A question
   * Matches: gvThacMac_RowUpdating() -> CapNhatTraLoiThacMac() in HoiDapAdmin.cs
   */
  async answerQna(
    id: number,
    traLoi: string,
    username?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_CapNhat_TraLoi_ThacMac @ID = :id, @TraLoi = :traLoi`,
        {
          replacements: {
            id,
            traLoi: traLoi.trim(),
          },
          type: 'SELECT' as const,
        },
      );

      // Log the action
      if (username) {
        await this.sequelize.query(
          `EXEC SP_Them_SystemLogs
            @UserName = :username,
            @ChucNang = :chucNang,
            @HanhDong = :hanhDong,
            @Ma = :ma,
            @GhiChu = :ghiChu`,
          {
            replacements: {
              username,
              chucNang: 'HoiDapAdmin:CapNhatTraLoiThacMac',
              hanhDong: 'ChinhSua',
              ma: id.toString(),
              ghiChu: `ID: ${id}; TraLoi: ${traLoi}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in answerQna:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete Q&A question
   * Matches: gvThacMac_RowDeleting() -> XoaThacMac() in HoiDapAdmin.cs
   */
  async deleteQna(id: number, username?: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_Xoa_ThacMac @ID = :id`,
        {
          replacements: { id },
          type: 'SELECT' as const,
        },
      );

      // Log the action
      if (username) {
        await this.sequelize.query(
          `EXEC SP_Them_SystemLogs
            @UserName = :username,
            @ChucNang = :chucNang,
            @HanhDong = :hanhDong,
            @Ma = :ma,
            @GhiChu = :ghiChu`,
          {
            replacements: {
              username,
              chucNang: 'HoiDapAdmin:XoaThacMac',
              hanhDong: 'Xoa',
              ma: id.toString(),
              ghiChu: `ID: ${id}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in deleteQna:', error.message);
      return { success: false, message: error.message };
    }
  }
}
