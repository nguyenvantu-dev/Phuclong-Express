import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { formatSqlDate, formatSqlEndOfDay, parseVietnameseDate } from '../helpers/sql-date.helper';

/**
 * Dashboard Service
 *
 * Tổng hợp số liệu thống kê admin qua các stored procedure (SQL Server).
 * Mọi GROUP BY/SUM/COUNT làm ở SP — service chỉ EXEC + map key sang camelCase.
 * Tham số ngày: dd/MM/yyyy; mặc định = đầu→cuối tháng hiện tại.
 */
@Injectable()
export class DashboardService {
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  /** Resolve khoảng ngày: parse dd/MM/yyyy, fallback = tháng hiện tại. */
  private resolveRange(fromDate?: string, toDate?: string): { tuNgay: string; denNgay: string } {
    const now = new Date();
    const from = parseVietnameseDate(fromDate || '') || new Date(now.getFullYear(), now.getMonth(), 1);
    const to = parseVietnameseDate(toDate || '') || new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { tuNgay: formatSqlDate(from), denNgay: formatSqlEndOfDay(new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59)) };
  }

  /** EXEC 1 SP nhận @TuNgay/@DenNgay, trả mảng rows (chuẩn hoá nested array của MSSQL). */
  private async execRange(sp: string, fromDate?: string, toDate?: string): Promise<any[]> {
    const { tuNgay, denNgay } = this.resolveRange(fromDate, toDate);
    const results = await this.sequelize.query(`EXEC ${sp} @TuNgay = :tuNgay, @DenNgay = :denNgay`, {
      replacements: { tuNgay, denNgay },
      type: 'SELECT' as const,
    });
    if (Array.isArray(results)) {
      return Array.isArray(results[0]) ? (results[0] as any[]) : (results as any[]);
    }
    return [];
  }

  /** KH mới theo ngày. */
  async getNewCustomersByDay(fromDate?: string, toDate?: string): Promise<{ ngay: string; soKHMoi: number }[]> {
    try {
      const rows = await this.execRange('SP_Dashboard_KhachHangMoiTheoNgay', fromDate, toDate);
      return rows.map((r) => ({ ngay: r.Ngay, soKHMoi: Number(r.SoKHMoi) || 0 }));
    } catch (error) {
      console.error('Error in getNewCustomersByDay:', error.message);
      return [];
    }
  }

  /** Doanh thu theo ngày (đơn đã hoàn tất). */
  async getRevenueByDay(
    fromDate?: string,
    toDate?: string,
  ): Promise<{ ngay: string; doanhThu: number; soDon: number }[]> {
    try {
      const rows = await this.execRange('SP_Dashboard_DoanhThuTheoNgay', fromDate, toDate);
      return rows.map((r) => ({
        ngay: r.Ngay,
        doanhThu: Number(r.DoanhThu) || 0,
        soDon: Number(r.SoDon) || 0,
      }));
    } catch (error) {
      console.error('Error in getRevenueByDay:', error.message);
      return [];
    }
  }

  /** Sản lượng (kg) theo ngày. */
  async getOutputByDay(fromDate?: string, toDate?: string): Promise<{ ngay: string; sanLuongKg: number }[]> {
    try {
      const rows = await this.execRange('SP_Dashboard_SanLuongTheoNgay', fromDate, toDate);
      return rows.map((r) => ({ ngay: r.Ngay, sanLuongKg: Number(r.SanLuongKg) || 0 }));
    } catch (error) {
      console.error('Error in getOutputByDay:', error.message);
      return [];
    }
  }

  /** Sản lượng mỗi nhân viên theo tháng (số đơn + số kg). */
  async getOutputByStaff(
    fromDate?: string,
    toDate?: string,
  ): Promise<{ nhanVien: string; thang: string; soDon: number; sanLuongKg: number }[]> {
    try {
      const rows = await this.execRange('SP_Dashboard_SanLuongNhanVienTheoThang', fromDate, toDate);
      return rows.map((r) => ({
        nhanVien: r.NhanVien || '',
        thang: r.Thang || '',
        soDon: Number(r.SoDon) || 0,
        sanLuongKg: Number(r.SanLuongKg) || 0,
      }));
    } catch (error) {
      console.error('Error in getOutputByStaff:', error.message);
      return [];
    }
  }

  /** Chi tiết sản lượng từng bản ghi CONGNO của 1 nhân viên trong 1 tháng. */
  async getOutputDetailByStaff(
    nhanVien: string,
    thang: string,
  ): Promise<{ ngayGhiNo: string; khachHang: string; noiDung: string; sanLuongKg: number; ghiChu: string }[]> {
    try {
      const results = await this.sequelize.query(
        `EXEC SP_Dashboard_SanLuongChiTiet @NhanVien = :nhanVien, @Thang = :thang`,
        { replacements: { nhanVien, thang }, type: 'SELECT' as const },
      );
      const rows: any[] = Array.isArray(results)
        ? Array.isArray(results[0]) ? (results[0] as any[]) : (results as any[])
        : [];
      return rows.map((r) => ({
        ngayGhiNo: r.NgayGhiNo ? String(r.NgayGhiNo).slice(0, 10) : '',
        khachHang: r.KhachHang || '',
        noiDung: r.NoiDung || '',
        sanLuongKg: Number(r.SanLuongKg) || 0,
        ghiChu: r.GhiChu || '',
      }));
    } catch (error) {
      console.error('Error in getOutputDetailByStaff:', error.message);
      return [];
    }
  }
}
