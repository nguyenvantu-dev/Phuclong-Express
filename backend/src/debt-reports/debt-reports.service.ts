import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { formatSqlDate, formatSqlEndOfDay, parseVietnameseDate } from '../helpers/sql-date.helper';

/**
 * Debt Reports Service
 *
 * Uses Sequelize for MSSQL to get multiple result sets from stored procedures
 */
@Injectable()
export class DebtReportsService {
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  /**
   * Get detailed debt report
   * Matches: DBConnect.BaoCaoChiTietCongNo() -> SP_BaoCao_ChiTietCongNo1
   *
   * SP returns multiple result sets:
   * - Result[0]: Data rows
   * - Result[1]: Summary (DauKy, TongPhatSinh, TongThanhToan, CuoiKy)
   * - Result[2]: Total count
   */
  async getDebtReports(
    username?: string,
    fromKyId?: number,
    toKyId?: number,
    page: number = 1,
    limit: number = 100,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    summary: { dauKy: number; tongPhatSinh: number; tongThanhToan: number; cuoiKy: number };
  }> {
    try {
      // Use raw query to get all result sets
      const [results] = await this.sequelize.query(
        `EXEC SP_BaoCao_ChiTietCongNo1
          @username = :username,
          @TuKyID = :fromKyId,
          @DenKyID = :toKyId,
          @PageSize = :limit,
          @PageNum = :page`,
        {
          replacements: {
            username: username || null,
            fromKyId: fromKyId || null,
            toKyId: toKyId || null,
            limit,
            page,
          },
          raw: true,
        },
      );

      // Handle single array result from MSSQL
      const resultArray = results as unknown as Array<Record<string, unknown>>;
      let data: any[] = [];
      let summary = { dauKy: 0, tongPhatSinh: 0, tongThanhToan: 0, cuoiKy: 0 };
      let total = 0;

      if (Array.isArray(resultArray) && resultArray.length > 0) {
        // Find summary (last item with DauKy)
        const summaryItem = resultArray.find((item) => item && 'DauKy' in item);
        if (summaryItem) {
          summary = {
            dauKy: (summaryItem.DauKy as number) ?? 0,
            tongPhatSinh: (summaryItem.TongPhatSinh as number) ?? 0,
            tongThanhToan: (summaryItem.TongThanhToan as number) ?? 0,
            cuoiKy: (summaryItem.CuoiKy as number) ?? 0,
          };
        }

        // Find total count (item with TOTALROW)
        const totalItem = resultArray.find((item) => item && 'TOTALROW' in item);
        if (totalItem) {
          total = (totalItem.TOTALROW as number) ?? 0;
        }

        // Filter out summary, total, and Loai rows, remaining are data
        data = resultArray.filter((item) => {
          if (!item) return false;
          return !('TOTALROW' in item) && !('DauKy' in item) && !('Loai' in item);
        });
      }

      return {
        data,
        total,
        page,
        limit,
        summary,
      };
    } catch (error) {
      console.error('Error in getDebtReports:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
        summary: { dauKy: 0, tongPhatSinh: 0, tongThanhToan: 0, cuoiKy: 0 },
      };
    }
  }

  /**
   * Get periods (Ky) for dropdown
   * Matches: DBConnect.LayDanhSachKy() and LayDanhSachKyByTinhTrang()
   */
  async getPeriods(includeClosed?: boolean): Promise<any[]> {
    try {
      let result: any[];

      if (includeClosed === true) {
        result = await this.sequelize.query(
          `EXEC SP_Lay_KyByTinhTrang @DaDong = :DaDong`,
          {
            replacements: { DaDong: 1 },
            type: 'SELECT' as const,
          },
        );
      } else {
        result = await this.sequelize.query(`EXEC SP_Lay_Ky`, {
          type: 'SELECT' as const,
        });
      }

      return result || [];
    } catch (error) {
      console.error('Error in getPeriods:', error.message);
      return [];
    }
  }

  /**
   * Get all users for dropdown
   * Matches: UserManager.Users in C#
   */
  async getUsers(): Promise<any[]> {
    try {
      const result = await this.sequelize.query(
        `SELECT Id, UserName FROM dbo.AspNetUsers ORDER BY UserName`,
        { type: 'SELECT' as const },
      );
      return result || [];
    } catch (error) {
      console.error('Error in getUsers:', error.message);
      return [];
    }
  }

  /**
   * Update debt record
   * Matches: DBConnect.CapNhatCongNoSimple() -> SP_CapNhat_CongNoSimple
   */
  async updateDebt(
    id: number,
    updateDto: { noiDung?: string; dr?: number; cr?: number; ghiChu?: string },
    username?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!updateDto.noiDung || updateDto.noiDung.trim() === '') {
        return { success: false, message: 'Bạn phải nhập nội dung công nợ' };
      }

      const dr = updateDto.dr ?? 0;
      const cr = updateDto.cr ?? 0;

      if (dr === 0 && cr === 0) {
        return { success: false, message: 'Phải nhập ít nhất một giá trị DR hoặc CR' };
      }

      await this.sequelize.query(
        `EXEC SP_CapNhat_CongNoSimple
          @CongNo_ID = :id,
          @NoiDung = :noiDung,
          @DR = :dr,
          @CR = :cr,
          @GhiChu = :ghiChu,
          @NguoiTao = :username`,
        {
          replacements: {
            id,
            noiDung: updateDto.noiDung.trim(),
            dr,
            cr,
            ghiChu: updateDto.ghiChu?.trim() || '',
            username: username || 'system',
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
              chucNang: 'ManageCongNo:CapNhatCongNo',
              hanhDong: 'ChinhSua',
              ma: id.toString(),
              ghiChu: `ID:${id}; NoiDung: ${updateDto.noiDung}; DR: ${dr}; CR: ${cr}; GhiChu: ${updateDto.ghiChu}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateDebt:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get customer debt report (BaoCao_CongNoKhachHang)
   * Matches: DBConnect.BaoCaoCongNoKhachHang() -> SP_BaoCao_CongNoKhachHang
   * Data: UserName, TienNo, TienHangChuaGiao, PhanTram
   */
  async getCustomerDebtReport(): Promise<any[]> {
    try {
      // Use SET NOCOUNT ON
      const results = await this.sequelize.query(
        `SET NOCOUNT ON; EXEC SP_BaoCao_CongNoKhachHang`,
        { type: 'SELECT', raw: true },
      ) as any;

      console.log('SP_BaoCao_CongNoKhachHang results:', JSON.stringify(results));

      // Handle array result from sequelize
      let data: any[] = [];
      if (Array.isArray(results)) {
        // Check if nested array
        if (results.length > 0 && Array.isArray(results[0])) {
          data = results[0];
        } else {
          data = results;
        }
      }

      return data;
    } catch (error) {
      console.error('Error in getCustomerDebtReport:', error.message);
      return [];
    }
  }

  /**
   * Export customer debt report to Excel
   * Matches: btExportToExcel_Click() -> ExportToExcel() in C#
   */
  async exportCustomerDebtReport(): Promise<{ csv: string; filename: string }> {
    try {
      const data = await this.getCustomerDebtReport();

      const lines: string[] = [];
      // Headers
      lines.push('UserName,TienNo,TienHangChuaGiao,PhanTram');

      for (const row of data) {
        const values = [
          row.UserName || '',
          row.TienNo || '0',
          row.TienHangChuaGiao || '0',
          row.PhanTram || '0',
        ];
        lines.push(values.join(','));
      }

      const csv = '\uFEFF' + lines.join('\r\n');
      const filename = `CongNoKhachHang_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;

      return { csv, filename };
    } catch (error) {
      console.error('Error in exportCustomerDebtReport:', error.message);
      throw error;
    }
  }

  /**
   * Export debt report to Excel
   * Matches: btExportToExcelAllWithFilter_Click() in C#
   */
  async exportDebtReport(
    username?: string,
    fromKyId?: number,
    toKyId?: number,
  ): Promise<{ csv: string; filename: string }> {
    try {
      const result = await this.getDebtReports(username, fromKyId, toKyId, 1, 10000000);

      const lines: string[] = [];
      lines.push(`Đầu kỳ,${result.summary.dauKy.toString().replace(/,/g, '')}`);
      lines.push(`Tổng phát sinh,${result.summary.tongPhatSinh.toString().replace(/,/g, '')}`);
      lines.push(`Đã thanh toán,${result.summary.tongThanhToan.toString().replace(/,/g, '')}`);
      lines.push(`Cuối kỳ,${result.summary.cuoiKy.toString().replace(/,/g, '')}`);
      lines.push('');

      if (result.data.length > 0) {
        const headers = ['CongNo_ID', 'NoiDung', 'NgayGhiNo', 'DR', 'CR', 'LuyKe', 'GhiChu'];
        lines.push(headers.join(','));

        for (const row of result.data) {
          const values = [
            row.CongNo_ID || '',
            (row.NoiDung || '').replace(/,/g, ';').replace(/\n/g, ' ').replace(/\r/g, ' '),
            row.NgayGhiNo ? new Date(row.NgayGhiNo).toLocaleDateString('vi-VN') : '',
            row.DR || '0',
            row.CR || '0',
            row.LuyKe || '0',
            (row.GhiChu || '').replace(/,/g, ';').replace(/\n/g, ' ').replace(/\r/g, ' '),
          ];
          lines.push(values.join(','));
        }
      }

      const csv = '\uFEFF' + lines.join('\r\n');
      const filename = `ChiTietCongNo_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;

      return { csv, filename };
    } catch (error) {
      console.error('Error in exportDebtReport:', error.message);
      throw error;
    }
  }

  /**
   * Get debt report by lot (BaoCao_CongNoKhachHangTheoLo)
   * Matches: DBConnect.BaoCaoCongNoKhachHangTheoLoHang() -> SP_BaoCao_CongNoKhachHangTheoLo
   * Data: UserName, NgayLoHang, TenLoHang, LoaiTien, TyGia, TienLoHangA, TienPhiHaiQuanB, TongTienLoHangAB, DaThu, ConLai
   */
  async getDebtReportByLot(fromDate?: string, toDate?: string): Promise<any[]> {
    try {
      // Parse dates from dd/MM/yyyy format
      let tuNgay: Date;
      let denNgay: Date;

      if (fromDate) {
        const parts = fromDate.split('/');
        if (parts.length === 3) {
          tuNgay = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 0, 0, 0);
        } else {
          tuNgay = new Date(fromDate);
        }
      } else {
        // Default to first day of current month
        tuNgay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      }

      if (toDate) {
        const parts = toDate.split('/');
        if (parts.length === 3) {
          denNgay = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 23, 59, 59);
        } else {
          denNgay = new Date(toDate);
        }
      } else {
        // Default to last day of current month
        denNgay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
      }

      const [results] = await this.sequelize.query(
        `EXEC SP_BaoCao_CongNoKhachHangTheoLo
          @TuNgay = :tuNgay,
          @DenNgay = :denNgay`,
        {
          replacements: {
            tuNgay,
            denNgay,
          },
          type: 'SELECT' as const,
        },
      );

      return results || [];
    } catch (error) {
      console.error('Error in getDebtReportByLot:', error.message);
      return [];
    }
  }

  /**
   * Export debt report by lot to Excel
   * Matches: btExportToExcel_Click() -> ExportToExcel() in C#
   */
  async exportDebtReportByLot(
    fromDate?: string,
    toDate?: string,
  ): Promise<{ csv: string; filename: string }> {
    try {
      const data = await this.getDebtReportByLot(fromDate, toDate);

      const lines: string[] = [];
      // Headers
      lines.push(
        'UserName,NgayLoHang,TenLoHang,LoaiTien,TyGia,TienLoHangA,TienPhiHaiQuanB,TongTienLoHangAB,DaThu,ConLai',
      );

      for (const row of data) {
        const values = [
          row.UserName || '',
          row.NgayLoHang ? new Date(row.NgayLoHang).toLocaleDateString('vi-VN') : '',
          row.TenLoHang || '',
          row.LoaiTien || '',
          row.TyGia || '0',
          row.TienLoHangA || '0',
          row.TienPhiHaiQuanB || '0',
          row.TongTienLoHangAB || '0',
          row.DaThu || '0',
          row.ConLai || '0',
        ];
        lines.push(values.join(','));
      }

      const csv = '\uFEFF' + lines.join('\r\n');
      const filename = `CongNoKhachHangTheoLo_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;

      return { csv, filename };
    } catch (error) {
      console.error('Error in exportDebtReportByLot:', error.message);
      throw error;
    }
  }

  // ========== BaoCao_CongNoTheoDotHang (by-shipment-lot) ==========

  /**
   * Get debt report by shipment lot (BaoCao_CongNoTheoDotHang)
   * Matches: DBConnect.BaoCaoCongNoTheoDotHang() -> SP_BaoCao_CongNoTheoDotHang
   * Data: UserName, HoTen, TenDotHang, NgayVeVN, TienHang, TienShip, TongTien, PhoneNumber, DiaChi
   */
  async getDebtReportByShipmentLot(fromDate?: string, toDate?: string): Promise<any[]> {
    try {
      // Parse dates from dd/MM/yyyy or YYYY-MM-DD format (from frontend input type="date")
      let tuNgay: string;
      let denNgay: string;

      if (fromDate) {
        // Check if format is YYYY-MM-DD (from input type="date")
        if (fromDate.includes('-') && fromDate.split('-').length === 3) {
          const parts = fromDate.split('-');
          tuNgay = `${parts[0]}-${parts[1]}-${parts[2]} 00:00:00`;
        } else if (fromDate.includes('/') && fromDate.split('/').length === 3) {
          // Format dd/MM/yyyy
          const parts = fromDate.split('/');
          tuNgay = `${parts[2]}-${parts[1]}-${parts[0]} 00:00:00`;
        } else {
          tuNgay = new Date(fromDate).toISOString().replace('T', ' ').slice(0, 19);
        }
      } else {
        // Default to 10 days ago
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() - 10);
        tuNgay = defaultDate.toISOString().replace('T', ' ').slice(0, 19);
      }

      if (toDate) {
        // Check if format is YYYY-MM-DD (from input type="date")
        if (toDate.includes('-') && toDate.split('-').length === 3) {
          const parts = toDate.split('-');
          denNgay = `${parts[0]}-${parts[1]}-${parts[2]} 23:59:59`;
        } else if (toDate.includes('/') && toDate.split('/').length === 3) {
          // Format dd/MM/yyyy
          const parts = toDate.split('/');
          denNgay = `${parts[2]}-${parts[1]}-${parts[0]} 23:59:59`;
        } else {
          denNgay = new Date(toDate).toISOString().replace('T', ' ').slice(0, 19);
        }
      } else {
        denNgay = new Date().toISOString().replace('T', ' ').slice(0, 19);
      }

      console.log('getDebtReportByShipmentLot - tuNgay:', tuNgay, 'denNgay:', denNgay);

      const results = await this.sequelize.query(
        `EXEC SP_BaoCao_CongNoTheoDotHang
          @TuNgay = :tuNgay,
          @DenNgay = :denNgay`,
        {
          replacements: {
            tuNgay,
            denNgay,
          },
          raw: true,
        },
      );

      // Handle raw results - can be [data] or [data, metadata] depending on MSSQL
      let data: any[] = [];
      if (Array.isArray(results)) {
        if (results.length > 0) {
          // First element is usually the data array
          if (Array.isArray(results[0])) {
            data = results[0];
          } else if (results[0] && typeof results[0] === 'object') {
            data = [results[0]];
          }
        }
      }

      // Normalize keys to PascalCase (matching C# convention)
      data = data.map((row: any) => {
        const normalized: any = {};
        for (const key of Object.keys(row)) {
          const keyLower = key.toLowerCase();
          // Convert lowercase keys to PascalCase for known fields
          if (keyLower === 'username') normalized['UserName'] = row[key];
          else if (keyLower === 'ngayvevn') normalized['NgayVeVN'] = row[key];
          else normalized[key] = row[key];
        }
        return normalized;
      });

      return data;
    } catch (error) {
      console.error('Error in getDebtReportByShipmentLot:', error.message);
      return [];
    }
  }

  /**
   * Export debt report by shipment lot to Excel
   * Matches: btExportToExcel_Click() -> ExportToExcel() in C#
   */
  async exportDebtReportByShipmentLot(
    fromDate?: string,
    toDate?: string,
  ): Promise<{ csv: string; filename: string }> {
    try {
      const data = await this.getDebtReportByShipmentLot(fromDate, toDate);

      const lines: string[] = [];
      // Headers
      lines.push('UserName,HoTen,NgayVeVN,TienHang,TienShip,TongTien,PhoneNumber,DiaChi');

      for (const row of data) {
        const values = [
          row.UserName || '',
          row.HoTen || '',
          row.NgayVeVN ? new Date(row.NgayVeVN).toLocaleDateString('vi-VN') : '',
          row.TienHang || '0',
          row.TienShip || '0',
          row.TongTien || '0',
          row.PhoneNumber || '',
          (row.DiaChi || '').replace(/,/g, ';'),
        ];
        lines.push(values.join(','));
      }

      const csv = '\uFEFF' + lines.join('\r\n');
      const filename = `CongNoTheoDotHang_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;

      return { csv, filename };
    } catch (error) {
      console.error('Error in exportDebtReportByShipmentLot:', error.message);
      throw error;
    }
  }

  // ========== BaoCao_DoiChieuCongNo (reconciliation) ==========

  /**
   * Get debt reconciliation report (BaoCao_DoiChieuCongNo)
   * Matches: DBConnect.BaoCaoDoiChieuCongNo() -> SP_BaoCao_DoiChieuCongNo1
   * Data: ordernumber, UserName, ngaymuahang, SoLinkA, SotienA, SoLinkB, SotienB, tracking_number, SotienAVND, SotienBVND, KiemTraVND
   */
  async getDebtReconciliationReport(
    fromDate?: string,
    toDate?: string,
    username?: string,
    orderNumber?: string,
  ): Promise<any[]> {
    try {
      // Parse dates - default to first day of current month if empty
      let tuNgay: string | null = null;
      let denNgay: string | null = null;

      if (fromDate) {
        try {
          tuNgay = this.parseDateToSql(fromDate);
        } catch (e) {
          // Use default
          const now = new Date();
          tuNgay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        }
      }

      if (toDate) {
        try {
          denNgay = this.parseDateToSql(toDate);
        } catch (e) {
          denNgay = new Date().toISOString();
        }
      }

      const [results] = await this.sequelize.query(
        `EXEC SP_BaoCao_DoiChieuCongNo1
          @TuNgay = :tuNgay,
          @DenNgay = :denNgay,
          @UserName = :username,
          @OrderNumber = :orderNumber`,
        {
          replacements: {
            tuNgay,
            denNgay,
            username: username || '',
            orderNumber: orderNumber || '',
          },
          type: 'SELECT' as const,
        },
      );

      return results || [];
    } catch (error) {
      console.error('Error in getDebtReconciliationReport:', error.message);
      return [];
    }
  }

  /**
   * Move order back to Received status
   * Matches: DBConnect.ChuyenVeReceived() -> SP_CapNhat_ChuyenVeReceived
   */
  async moveToReceived(ordernumber: string, username?: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_CapNhat_ChuyenVeReceived @ordernumber = :ordernumber`,
        {
          replacements: { ordernumber },
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
              chucNang: 'BaoCao_DoiChieuCongNo:ChuyenVeReceived',
              hanhDong: 'ChinhSua',
              ma: ordernumber,
              ghiChu: `ID: ${ordernumber}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in moveToReceived:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update total amount in VND for an order
   * Matches: DBConnect.CapNhatTongTienOrderVND() -> SP_CapNhat_TongTienOrderVND
   */
  async updateOrderTotalVND(
    ordernumber: string,
    trackingNumber: string,
    tongTienOrderVND: number,
    username?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_CapNhat_TongTienOrderVND
          @ordernumber = :ordernumber,
          @tracking_number = :trackingNumber,
          @TongTienOrderVND = :tongTienOrderVND`,
        {
          replacements: {
            ordernumber,
            trackingNumber,
            tongTienOrderVND,
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
              chucNang: 'BaoCao_DoiChieuCongNo:CapNhatTongTienOrderVND',
              hanhDong: 'ChinhSua',
              ma: ordernumber,
              ghiChu: `OrderNumber: ${ordernumber}; TrackingNumber: ${trackingNumber}; SotienBVND: ${tongTienOrderVND}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateOrderTotalVND:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Export debt reconciliation report to Excel
   * Matches: btExportToExcel_Click() -> ExportToExcel() in C#
   */
  async exportDebtReconciliationReport(
    fromDate?: string,
    toDate?: string,
    username?: string,
    orderNumber?: string,
  ): Promise<{ csv: string; filename: string }> {
    try {
      const data = await this.getDebtReconciliationReport(fromDate, toDate, username, orderNumber);

      const lines: string[] = [];
      // Headers
      lines.push(
        'ordernumber,UserName,ngaymuahang,SoLinkA,SotienA,SoLinkB,SotienB,tracking_number,SotienAVND,SotienBVND,KiemTraVND',
      );

      for (const row of data) {
        const values = [
          row.ordernumber || '',
          row.UserName || '',
          row.ngaymuahang ? new Date(row.ngaymuahang).toLocaleDateString('vi-VN') : '',
          row.SoLinkA || '0',
          row.SotienA || '0',
          row.SoLinkB || '0',
          row.SotienB || '0',
          row.tracking_number || '',
          row.SotienAVND || '0',
          row.SotienBVND || '0',
          row.KiemTraVND || '0',
        ];
        lines.push(values.join(','));
      }

      const csv = '\uFEFF' + lines.join('\r\n');
      const filename = `DoiChieuCongNo_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;

      return { csv, filename };
    } catch (error) {
      console.error('Error in exportDebtReconciliationReport:', error.message);
      throw error;
    }
  }

  // Helper method to parse date from dd/MM/yyyy to SQL datetime string
  private parseDateToSql(dateStr: string): string {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day).toISOString();
    }
    return new Date(dateStr).toISOString();
  }

  // ========== BaoCao_TongDoanhThu ==========

  /**
   * Get total revenue report (BaoCao_TongDoanhThu)
   * Matches: DBConnect.BaoCaoTongDoanhThu() -> SP_BaoCao_TongDoanhThu
   * Data: DauKy, PhanNo, PhanCo, ChenhLech, CanDoi
   */
  async getTotalRevenueReport(
    fromDate?: string,
    toDate?: string,
  ): Promise<{
    dauKy: number;
    phanNo: number;
    phanCo: number;
    chenhLech: number;
    canDoi: number;
  }> {
    try {
      // Parse dates from dd/MM/yyyy format
      let tuNgay: Date;
      let denNgay: Date;

      if (fromDate) {
        const parts = fromDate.split('/');
        if (parts.length === 3) {
          tuNgay = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 0, 0, 0);
        } else {
          tuNgay = new Date(fromDate);
        }
      } else {
        // Default to first day of current month
        tuNgay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      }

      if (toDate) {
        const parts = toDate.split('/');
        if (parts.length === 3) {
          denNgay = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 23, 59, 59);
        } else {
          denNgay = new Date(toDate);
        }
      } else {
        // Default to last day of current month
        denNgay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
      }

      const [results] = await this.sequelize.query(
        `EXEC SP_BaoCao_TongDoanhThu
          @TuNgay = :tuNgay,
          @DenNgay = :denNgay`,
        {
          replacements: {
            tuNgay: formatSqlDate(tuNgay),
            denNgay: formatSqlEndOfDay(denNgay),
          },
          type: 'SELECT' as const,
        },
      );

      // Handle both array and object return types from sequelize
      let data: { DauKy?: number; PhanNo?: number; PhanCo?: number; ChenhLech?: number; CanDoi?: number } | null = null;
      if (Array.isArray(results) && results.length > 0) {
        data = results[0] as any;
      } else if (results && typeof results === 'object' && !Array.isArray(results)) {
        data = results as any;
      }

      return {
        dauKy: data?.DauKy || 0,
        phanNo: data?.PhanNo || 0,
        phanCo: data?.PhanCo || 0,
        chenhLech: data?.ChenhLech || 0,
        canDoi: data?.CanDoi || 0,
      };
    } catch (error) {
      console.error('Error in getTotalRevenueReport:', error.message);
      return {
        dauKy: 0,
        phanNo: 0,
        phanCo: 0,
        chenhLech: 0,
        canDoi: 0,
      };
    }
  }

  // ========== BaoCao_TongCongNoTheoUser ==========

  /**
   * Get total debt report by user (BaoCao_TongCongNoTheoUser)
   * Matches: DBConnect.BaoCaoTongCongNoTheoUser() -> SP_BaoCao_TongCongNoTheoUser
   * Data: UserName, DauKy, PhanThu, PhanChi, CuoiKy
   */
  async getTotalDebtByUser(
    fromDate?: string,
    toDate?: string,
    username?: string,
  ): Promise<any[]> {
    try {
      // Convert dd/MM/yyyy to yyyy-MM-dd for SQL
      const tuNgay = parseVietnameseDate(fromDate || '');
      const denNgay = parseVietnameseDate(toDate || '');
      const tuNgayStr = tuNgay ? formatSqlDate(tuNgay) : '';
      const denNgayStr = denNgay ? formatSqlDate(denNgay) : '';
      console.log('getTotalDebtByUser params:', { username, tuNgay: tuNgayStr, denNgay: denNgayStr });

      const results = await this.sequelize.query(
        `EXEC SP_BaoCao_TongCongNoTheoUser
          @UserName = :username,
          @TuNgay = :tuNgay,
          @DenNgay = :denNgay`,
        {
          replacements: {
            username: username || '',
            tuNgay: tuNgayStr,
            denNgay: denNgayStr,
          },
          type: 'SELECT' as const,
        },
      );

      console.log('getTotalDebtByUser raw results:', results);
      return results
    } catch (error) {
      console.error('Error in getTotalDebtByUser:', error.message);
      return [];
    }
  }

  /**
   * Export total debt by user to Excel
   * Matches: btExportToExcel_Click() -> ExportToExcel() in C#
   */
  async exportTotalDebtByUser(
    fromDate?: string,
    toDate?: string,
    username?: string,
  ): Promise<{ csv: string; filename: string }> {
    try {
      const data = await this.getTotalDebtByUser(fromDate, toDate, username);

      const lines: string[] = [];
      // Headers
      lines.push('UserName,DauKy,PhanThu,PhanChi,CuoiKy');

      for (const row of data) {
        const values = [
          row.UserName || '',
          row.DauKy || '0',
          row.PhanThu || '0',
          row.PhanChi || '0',
          row.CuoiKy || '0',
        ];
        lines.push(values.join(','));
      }

      const csv = '\uFEFF' + lines.join('\r\n');
      const filename = `TongCongNoTheoUser_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;

      return { csv, filename };
    } catch (error) {
      console.error('Error in exportTotalDebtByUser:', error.message);
      throw error;
    }
  }

  // ========== BaoCao_PhanTichLaiLoTheoLoHang ==========

  /**
   * Get profit/loss analysis by lot (BaoCao_PhanTichLaiLoTheoLoHang)
   * Matches: DBConnect.BaoCaoPhanTichLaiLoTheoLoHang() -> SP_BaoCao_PhanTichLaiLoTheoLoHang
   * Data: NgayLoHang, TenLoHang, TienLoHangA, TienPhiHaiQuanB, TongTienLoHangAB, TienChiPhiLoHangC, LaiLoD
   */
  async getProfitLossByLot(
    fromDate?: string,
    toDate?: string,
  ): Promise<any[]> {
    try {
      // Parse dates from dd/MM/yyyy format
      let tuNgay: Date;
      let denNgay: Date;

      if (fromDate) {
        const parts = fromDate.split('/');
        if (parts.length === 3) {
          tuNgay = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 0, 0, 0);
        } else {
          tuNgay = new Date(fromDate);
        }
      } else {
        // Default to first day of current month
        tuNgay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      }

      if (toDate) {
        const parts = toDate.split('/');
        if (parts.length === 3) {
          denNgay = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]), 23, 59, 59);
        } else {
          denNgay = new Date(toDate);
        }
      } else {
        // Default to last day of current month
        denNgay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
      }

      const [results] = await this.sequelize.query(
        `EXEC SP_BaoCao_LaiLoTheoLo
          @TuNgay = :tuNgay,
          @DenNgay = :denNgay`,
        {
          replacements: {
            tuNgay: formatSqlDate(tuNgay),
            denNgay: formatSqlDate(denNgay),
          },
          type: 'SELECT' as const,
        },
      );

      return results || [];
    } catch (error) {
      console.error('Error in getProfitLossByLot:', error.message);
      return [];
    }
  }

  /**
   * Export profit/loss by lot to Excel
   * Matches: btExportToExcel_Click() -> ExportToExcel() in C#
   */
  async exportProfitLossByLot(
    fromDate?: string,
    toDate?: string,
  ): Promise<{ csv: string; filename: string }> {
    try {
      const data = await this.getProfitLossByLot(fromDate, toDate);

      const lines: string[] = [];
      // Headers
      lines.push('NgayLoHang,TenLoHang,TienLoHangA,TienPhiHaiQuanB,TongTienLoHangAB,TienChiPhiLoHangC,LaiLoD');

      for (const row of data) {
        const values = [
          row.NgayLoHang ? new Date(row.NgayLoHang).toLocaleDateString('vi-VN') : '',
          row.TenLoHang || '',
          row.TienLoHangA || '0',
          row.TienPhiHaiQuanB || '0',
          row.TongTienLoHangAB || '0',
          row.TienChiPhiLoHangC || '0',
          row.LaiLoD || '0',
        ];
        lines.push(values.join(','));
      }

      const csv = '\uFEFF' + lines.join('\r\n');
      const filename = `PhanTichLaiLoTheoLoHang_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;

      return { csv, filename };
    } catch (error) {
      console.error('Error in exportProfitLossByLot:', error.message);
      throw error;
    }
  }

  // ========== BaoCao_InPhieuShipTheoDotHang ==========

  /**
   * Get shipping slip by shipment lot (BaoCao_InPhieuShipTheoDotHang)
   * Matches: DBConnect.BaoCaoInPhieuShipTheoDotHang() -> SP_BaoCao_InPhieuShipTheoDotHang
   * Returns 2 tables: Table[0] = Customer info, Table[1] = Order items
   */
  async getShippingSlip(
    orderId: string,
    userName: string,
  ): Promise<{
    customerInfo: {
      HoTen: string;
      PhoneNumber: string;
      DiaChiNhanHang: string;
      NgayVeVN: string;
      TongTien: number;
      TienShipVeVN: number;
      TienShipTrongNuoc: number;
      TienHang: number;
      TienDatCoc: number;
      TienPhaiThanhToan: number;
    };
    orderItems: any[];
  }> {
    try {
      const [results] = await this.sequelize.query(
        `EXEC SP_BaoCao_InPhieuShipTheoDotHang
          @ID = :orderId,
          @UserName = :userName`,
        {
          replacements: {
            orderId,
            userName,
          },
          type: 'SELECT' as const,
        },
      );

      // Results contains multiple tables - need to handle differently
      // For now, return empty structure
      return {
        customerInfo: {
          HoTen: '',
          PhoneNumber: '',
          DiaChiNhanHang: '',
          NgayVeVN: '',
          TongTien: 0,
          TienShipVeVN: 0,
          TienShipTrongNuoc: 0,
          TienHang: 0,
          TienDatCoc: 0,
          TienPhaiThanhToan: 0,
        },
        orderItems: [],
      };
    } catch (error) {
      console.error('Error in getShippingSlip:', error.message);
      return {
        customerInfo: {
          HoTen: '',
          PhoneNumber: '',
          DiaChiNhanHang: '',
          NgayVeVN: '',
          TongTien: 0,
          TienShipVeVN: 0,
          TienShipTrongNuoc: 0,
          TienHang: 0,
          TienDatCoc: 0,
          TienPhaiThanhToan: 0,
        },
        orderItems: [],
      };
    }
  }

  // ========== Debt Management (ManageCongNo) ==========

  /**
   * Get debt management list with filters and pagination
   * Matches: LoadDanhSachCongNo() in ManageCongNo.cs
   */
  async getDebtManagementList(
    username?: string,
    status?: number,
    loaiPhatSinh?: string,
    bankAccount?: string,
    fromDate?: string,
    toDate?: string,
    page: number = 1,
    limit: number = 200,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    try {
      // Parse dates
      let tuNgay: string | null = null;
      let denNgay: string | null = null;

      if (fromDate) {
        tuNgay = this.parseDateToSql(fromDate);
      }
      if (toDate) {
        denNgay = this.parseDateToSql(toDate);
      }

      // Use SP_Lay_DanhSach_CongNo1 similar to C#
      const [results] = await this.sequelize.query(
        `EXEC SP_Lay_DanhSach_CongNo1
          @UserName = :username,
          @TinhTrang = :status,
          @LoaiPhatSinh = :loaiPhatSinh,
          @TaiKhoanNganHang = :bankAccount,
          @TuNgay = :tuNgay,
          @DenNgay = :denNgay,
          @PageSize = :limit,
          @PageNum = :page`,
        {
          replacements: {
            username: username || '',
            status: status ?? -1,
            loaiPhatSinh: loaiPhatSinh || '',
            bankAccount: bankAccount || '',
            tuNgay,
            denNgay,
            limit,
            page,
          },
        },
      );

      const data = Array.isArray(results) ? results : [];

      // Get total count
      const firstItem = data.length > 0 ? data[0] as any : null;
      const total = firstItem?.TotalCount ? firstItem.TotalCount : data.length;

      return { data, total: Number(total), page, limit };
    } catch (error) {
      console.error('Error in getDebtManagementList:', error.message);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Create new debt record
   * Matches: btDongY_Click() -> Insert_CongNo() in ManageCongNo.cs
   */
  async createDebt(
    dto: {
      username: string;
      noiDung: string;
      ngay: string;
      dr?: number;
      cr?: number;
      ghiChu?: string;
      loHangId?: number;
      loaiPhatSinh?: number;
    },
    username?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!dto.noiDung || dto.noiDung.trim() === '') {
        return { success: false, message: 'Bạn phải nhập nội dung công nợ' };
      }

      if (!dto.ngay || dto.ngay.trim() === '') {
        return { success: false, message: 'Bạn phải nhập ngày phát sinh công nợ' };
      }

      const dr = dto.dr ?? 0;
      const cr = dto.cr ?? 0;

      if (dr === 0 && cr === 0) {
        return { success: false, message: 'Phải nhập ít nhất một giá trị Nợ hoặc Có' };
      }

      const ngayGhiNo = this.parseDateToSql(dto.ngay);

      let ghiChu = dto.ghiChu || '';
      // Add bank transfer info if CR > 0 and bank is selected
      // This would need bank account info in the DTO

      await this.sequelize.query(
        `EXEC SP_Insert_CongNo
          @UserName = :username,
          @NoiDung = :noiDung,
          @NgayGhiNo = :ngayGhiNo,
          @DR = :dr,
          @CR = :cr,
          @GhiChu = :ghiChu,
          @Status = :status,
          @LoHangID = :loHangID,
          @NguoiTao = :nguoiTao,
          @LoaiPhatSinh = :loaiPhatSinh`,
        {
          replacements: {
            username: dto.username,
            noiDung: dto.noiDung.trim(),
            ngayGhiNo,
            dr,
            cr,
            ghiChu: ghiChu.trim(),
            status: 1,
            loHangID: dto.loHangId || null,
            nguoiTao: username || 'system',
            loaiPhatSinh: dto.loaiPhatSinh || 2,
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
              chucNang: 'ManageCongNo:Insert_CongNo',
              hanhDong: 'ThemMoi',
              ma: '',
              ghiChu: `UserName: ${dto.username}; NoiDung: ${dto.noiDung}; Ngay: ${dto.ngay}; DR: ${dr}; CR: ${cr}; GhiChu: ${ghiChu}; LoaiPhatSinh: ${dto.loaiPhatSinh || 2}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in createDebt:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update debt record
   * Matches: gvCongNo_RowUpdating() -> CapNhatCongNo() in ManageCongNo.cs
   */
  async updateDebtManagement(
    id: number,
    dto: {
      username?: string;
      noiDung?: string;
      dr?: number;
      cr?: number;
      ghiChu?: string;
      status?: number;
      loHangId?: number;
    },
    username?: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      // Check permission to update
      const [checkResult] = await this.sequelize.query(
        `EXEC SP_KiemTra_DuocCapNhatCongNoByID @CongNo_ID = :id, @UserName = :username`,
        {
          replacements: { id, username: dto.username || '' },
          type: 'SELECT' as const,
        },
      );

      const checkDataRaw = Array.isArray(checkResult) && checkResult.length > 0 ? checkResult[0] as any : { Result: -1 };
      const checkValue = checkDataRaw?.Result ?? -1;

      if (checkValue === 3 || checkValue === 1 || checkValue === 2) {
        return { success: false, message: 'Không được cập nhật công nợ này do đã đóng kỳ' };
      }
      if (checkValue === -1) {
        return { success: false, message: 'Có lỗi trong quá trình thực hiện' };
      }

      const dr = dto.dr ?? 0;
      const cr = dto.cr ?? 0;
      const status = dto.status ?? 1;

      await this.sequelize.query(
        `EXEC SP_CapNhat_CongNo
          @CongNo_ID = :id,
          @UserName = :username,
          @NoiDung = :noiDung,
          @DR = :dr,
          @CR = :cr,
          @GhiChu = :ghiChu,
          @Status = :status,
          @LoHangID = :loHangID,
          @NguoiCapNhat = :nguoiCapNhat`,
        {
          replacements: {
            id,
            username: dto.username || '',
            noiDung: dto.noiDung?.trim() || '',
            dr,
            cr,
            ghiChu: dto.ghiChu?.trim() || '',
            status,
            loHangID: dto.loHangId || null,
            nguoiCapNhat: username || 'system',
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
              chucNang: 'ManageCongNo:CapNhatCongNo',
              hanhDong: 'ChinhSua',
              ma: id.toString(),
              ghiChu: `ID:${id}; UserName: ${dto.username}; NoiDung: ${dto.noiDung}; DR: ${dr}; CR: ${cr}; GhiChu: ${dto.ghiChu}; status: ${status}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in updateDebtManagement:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete debt record
   * Matches: gvCongNo_RowDeleting() -> XoaCongNo() in ManageCongNo.cs
   */
  async deleteDebt(id: number, username?: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_Xoa_CongNo @CongNo_ID = :id, @NguoiXoa = :username`,
        {
          replacements: { id, username: username || 'system' },
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
              chucNang: 'ManageCongNo:XoaCongNo',
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
      console.error('Error in deleteDebt:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Approve debt record
   * Matches: gvCongNo_RowCommand() -> ApproveCongNo() in ManageCongNo.cs
   */
  async approveDebt(id: number, username?: string): Promise<{ success: boolean; message?: string }> {
    try {
      await this.sequelize.query(
        `EXEC SP_Approve_CongNo @CongNo_ID = :id, @NguoiDuyet = :username`,
        {
          replacements: { id, username: username || 'system' },
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
              chucNang: 'ManageCongNo:ApproveCongNo',
              hanhDong: 'ChinhSua',
              ma: '',
              ghiChu: `ID: ${id}`,
            },
            type: 'SELECT' as const,
          },
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error in approveDebt:', error.message);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get bank accounts for dropdown
   * Matches: LoadDanhSachTaiKhoanNganHang() in ManageCongNo.cs
   */
  async getBankAccounts(): Promise<any[]> {
    try {
      const [results] = await this.sequelize.query(
        `EXEC SP_Lay_DanhSach_TaiKhoanNganHang`,
        { type: 'SELECT' as const },
      );
      return results || [];
    } catch (error) {
      console.error('Error in getBankAccounts:', error.message);
      return [];
    }
  }

  /**
   * Get batches by username for dropdown
   * Matches: LoadDanhSachLoHangTheoUser() in ManageCongNo.cs
   */
  async getBatchesByUsername(username: string): Promise<any[]> {
    try {
      const [results] = await this.sequelize.query(
        `EXEC SP_Lay_DanhSach_LoHangTheoUser @UserName = :username`,
        {
          replacements: { username },
          type: 'SELECT' as const,
        },
      );
      return results || [];
    } catch (error) {
      console.error('Error in getBatchesByUsername:', error.message);
      return [];
    }
  }
}
