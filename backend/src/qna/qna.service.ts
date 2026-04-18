import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Q&A Service
 *
 * Handles Q&A management operations for admin
 */
@Injectable()
export class QnaService {
  constructor(
    @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
    private readonly notificationsService: NotificationsService,
  ) {}

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
        `EXEC SP_Lay_ThacMac
          @username = :username,
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
      const total = firstItem?.TOTALROW ? firstItem.TOTALROW : data.length;

      return { data: data.slice(1), total: Number(total), page, limit };
    } catch (error) {
      const err = error as Error;
      console.error('Error in getQnaList:', err.message);
      return { data: [], total: 0, page, limit };
    }
  }

  /** Get question owner's username by ID — table name may need adjusting per DB schema */
  private async getQnaOwner(id: number): Promise<string | null> {
    try {
      const results = await this.sequelize.query(
        `SELECT TOP 1 username FROM ThacMac WHERE ID = :id`,
        { replacements: { id }, type: 'SELECT' as const },
      );
      const row = Array.isArray(results) && results.length > 0 ? (results[0] as any) : null;
      return row?.username ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Answer Q&A question — notifies the question owner
   * Matches: gvThacMac_RowUpdating() -> CapNhatTraLoiThacMac() in HoiDapAdmin.cs
   */
  async answerQna(
    id: number,
    traLoi: string,
    username?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_CapNhat_TraLoiThacMac @ID = :id, @TraLoi = :traLoi`,
        {
          replacements: { id, traLoi: traLoi.trim() },
          type: 'SELECT' as const,
        },
      );

      // Notify the question owner
      const owner = await this.getQnaOwner(id);
      if (owner) {
        await this.notificationsService.create({
          username: owner,
          title: 'Câu hỏi của bạn đã được trả lời',
          message: traLoi.trim(),
          type: 'info',
          createdBy: username ?? 'system',
          refType: 'qna',
          refId: id.toString(),
        });
      }

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
              chucNang: 'HoiDapAdmin:CapNhatTraLoiThacMac',
              hanhDong: 'Chinh sua',
              ma: id.toString(),
              ghiChu: `ID: ${id}; TraLoi: ${traLoi}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error('Error in answerQna:', err.message);
      return { success: false, message: err.message };
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
            @NguoiTao = :username,
            @Nguon = :chucNang,
            @HanhDong = :hanhDong,
            @DoiTuong = :ma,
            @NoiDung = :ghiChu`,
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
      const err = error as Error;
      console.error('Error in deleteQna:', err.message);
      return { success: false, message: err.message };
    }
  }

  /**
   * Create new Q&A question
   * Matches: HoiDap.cs -> btTaoCauHoi_Click() -> ThemThacMac()
   */
  async createQna(cauHoi: string, username?: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_Them_ThacMac @username = :username, @CauHoi = :cauHoi`,
        {
          replacements: {
            username: username || '',
            cauHoi: cauHoi.trim(),
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
              chucNang: 'HoiDap:ThemThacMac',
              hanhDong: 'Them moi',
              ma: '',
              ghiChu: `CauHoi: ${cauHoi.trim()}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      const err = error as Error;
      console.error('Error in createQna:', err.message);
      return { success: false, message: err.message };
    }
  }
}
