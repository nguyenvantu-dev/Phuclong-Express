import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import Excel from 'exceljs';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { QueryTrackingDto } from './dto/query-tracking.dto';
import { MassUpdateTrackingDto } from './dto/mass-update-tracking.dto';

/**
 * Tracking Service
 *
 * Handles tracking CRUD operations.
 */
@Injectable()
export class TrackingService {
  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {}

  /**
   * Find all tracking with filters and pagination
   * Uses: SP_Lay_Tracking
   */
  async findAll(query: QueryTrackingDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { username, statuses, search, trackingNumber, tenLoHang, quocGiaId, startDate, endDate, page = 1, limit = 20 } = query;

    try {
      // Build comma-separated status list for SP
      const tinhTrang = statuses ? statuses.replace(/,/g, "','") : '';

      // Use SP_Lay_Tracking
      const results = await this.sequelize.query(
        `EXEC dbo.SP_Lay_Tracking
          @UserName = :username,
          @TinhTrang = :tinhTrang,
          @NoiDungTim = :search,
          @TimTheo = -1,
          @TrackingNumber = :trackingNumber,
          @TenLoHang = :tenLoHang,
          @PageSize = :limit,
          @PageNum = :page,
          @QuocGiaID = :quocGiaId,
          @DaXoa = 0,
          @TuNgay = :startDate,
          @DenNgay = :endDate`,
        {
          replacements: {
            username: username || '',
            tinhTrang,
            search: search || '',
            trackingNumber: trackingNumber || '',
            tenLoHang: tenLoHang || '',
            quocGiaId: quocGiaId && quocGiaId > 0 ? quocGiaId : -1,
            startDate: startDate || '',
            endDate: endDate || '',
            limit,
            page,
          },
          type: QueryTypes.SELECT,
        }
      );

      // SP_Lay_Tracking returns: [ { TOTALROW: 50 }, {row1}, {row2}, ... ]
      const resultsAny = results as any;
      const totalItem = resultsAny[0]?.TOTALROW || 0;
      const data = resultsAny.slice(1) || [];

      return {
        data,
        total: totalItem,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findAll tracking:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Search tracking by code (public lookup)
   * Revert to original logic: only return history from tbTinhTrangTracking
   * With Vietnamese status descriptions
   */
  async searchByCode(code: string): Promise<any> {
    try {
      const safeCode = code.replace(/'/g, "''");

      // Find tracking by code first to get TrackingID
      const [trackingData] = await this.sequelize.query(`
        SELECT TOP 1 TrackingID
        FROM dbo.tbTracking
        WHERE DaXoa = 0
          AND (TrackingNumber = N'${safeCode}' OR OrderNumber = N'${safeCode}')
      `);

      if (!trackingData || !Array.isArray(trackingData) || trackingData.length === 0) {
        return { found: false, message: 'Không tìm thấy dữ liệu' };
      }

      const trackingInfo = trackingData[0] as any;
      const trackingId = trackingInfo.TrackingID;

      // Get history from tbTinhTrangTracking with Vietnamese descriptions
      const [history] = await this.sequelize.query(`
        SELECT
          NgayTao as ngay,
          TinhTrang as tinhTrang,
          CASE TinhTrang
            WHEN 'Received' THEN N'Nhận thông tin tại kho'
            WHEN 'InTransit' THEN N'Đã chuyển lên máy bay về VN'
            WHEN 'InVN' THEN N'Đã đến VN, đang soạn hàng'
            WHEN 'VNTransit' THEN N'Đang ship nội địa'
            WHEN 'Completed' THEN N'Đã giao hàng cho khách'
            WHEN 'Cancelled' THEN N'Đã hủy'
            ELSE TinhTrang
          END as moTa,
          GhiChu as ghiChu
        FROM dbo.tbTinhTrangTracking
        WHERE TrackingID = ${trackingId}
        ORDER BY NgayTao DESC
      `);

      if (!history || !Array.isArray(history) || history.length === 0) {
        return { found: false, message: 'Không tìm thấy dữ liệu' };
      }

      return {
        found: true,
        history: history
      };
    } catch (error) {
      console.error('Error in searchByCode:', error.message);
      console.error('Errors array:', (error as any).errors);
      return { found: false, message: 'Có lỗi xảy ra khi tra cứu' };
    }
  }

  /**
   * Get tracking counts by status
   */
  async getCounts(): Promise<any> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT TinhTrang, COUNT(*) as SL
        FROM dbo.tbTracking
        WHERE DaXoa = 0
        GROUP BY TinhTrang
      `);

      const counts: Record<string, number> = {
        Received: 0,
        InTransit: 0,
        InVN: 0,
        VNTransit: 0,
        Completed: 0,
        Cancelled: 0,
      };

      if (data) {
        for (const row of data as any[]) {
          counts[row.TinhTrang] = Number(row.SL);
        }
      }

      return counts;
    } catch (error) {
      console.error('Error in getCounts:', error.message);
      return {
        Received: 0,
        InTransit: 0,
        InVN: 0,
        VNTransit: 0,
        Completed: 0,
        Cancelled: 0,
      };
    }
  }

  /**
   * Find tracking by ID
   */
  async findOne(id: number): Promise<any> {
    try {
      const [result]: any[] = await this.sequelize.query(
        `SELECT * FROM dbo.tbTracking WHERE ID = ${id}`
      );

      if (!result || result.length === 0) {
        throw new NotFoundException(`Tracking with ID ${id} not found`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in findOne tracking:', error.message);
      throw new NotFoundException(`Tracking with ID ${id} not found`);
    }
  }

  /**
   * Create new tracking
   */
  async create(createTrackingDto: CreateTrackingDto): Promise<any> {
    const { username, trackingNumber, orderNumber, ngayDatHang, nhaVanChuyenId, quocGiaId, tinhTrang, ghiChu, kien, mawb, hawb, nguoiTao } = createTrackingDto;

    try {
      const [result]: any[] = await this.sequelize.query(`
        INSERT INTO dbo.Tracking (UserName, TrackingNumber, OrderNumber, NgayDatHang, NhaVanChuyenID, QuocGiaID, TinhTrang, GhiChu, Kien, Mawb, Hawb, NguoiTao, DaXoa, NgayTao)
        VALUES (N'${username || ''}', N'${trackingNumber || ''}', N'${orderNumber || ''}', ${ngayDatHang ? `'${ngayDatHang}'` : 'GETDATE()'}, ${nhaVanChuyenId || 'NULL'}, ${quocGiaId || 'NULL'}, N'${tinhTrang || 'Received'}', N'${ghiChu || ''}', N'${kien || ''}', N'${mawb || ''}', N'${hawb || ''}', N'${nguoiTao || ''}', 0, GETDATE());
        SELECT SCOPE_IDENTITY() as ID;
      `);

      const insertId = result[0]?.ID;
      return this.findOne(insertId);
    } catch (error) {
      console.error('Error in create tracking:', error.message);
      throw error;
    }
  }

  /**
   * Update tracking
   */
  async update(id: number, updateTrackingDto: UpdateTrackingDto): Promise<any> {
    await this.findOne(id);

    const updates: string[] = [];

    if (updateTrackingDto.username !== undefined) {
      updates.push(`UserName = N'${updateTrackingDto.username}'`);
    }
    if (updateTrackingDto.trackingNumber !== undefined) {
      updates.push(`TrackingNumber = N'${updateTrackingDto.trackingNumber}'`);
    }
    if (updateTrackingDto.orderNumber !== undefined) {
      updates.push(`OrderNumber = N'${updateTrackingDto.orderNumber}'`);
    }
    if (updateTrackingDto.ngayDatHang !== undefined) {
      updates.push(`NgayDatHang = '${updateTrackingDto.ngayDatHang}'`);
    }
    if (updateTrackingDto.nhaVanChuyenId !== undefined) {
      updates.push(`NhaVanChuyenID = ${updateTrackingDto.nhaVanChuyenId}`);
    }
    if (updateTrackingDto.quocGiaId !== undefined) {
      updates.push(`QuocGiaID = ${updateTrackingDto.quocGiaId}`);
    }
    if (updateTrackingDto.tinhTrang !== undefined) {
      updates.push(`TinhTrang = N'${updateTrackingDto.tinhTrang}'`);
    }
    if (updateTrackingDto.ghiChu !== undefined) {
      updates.push(`GhiChu = N'${updateTrackingDto.ghiChu}'`);
    }
    if (updateTrackingDto.kien !== undefined) {
      updates.push(`Kien = N'${updateTrackingDto.kien}'`);
    }
    if (updateTrackingDto.mawb !== undefined) {
      updates.push(`Mawb = N'${updateTrackingDto.mawb}'`);
    }
    if (updateTrackingDto.hawb !== undefined) {
      updates.push(`Hawb = N'${updateTrackingDto.hawb}'`);
    }

    if (updates.length > 0) {
      await this.sequelize.query(`
        UPDATE dbo.Tracking SET ${updates.join(', ')} WHERE ID = ${id}
      `);
    }

    return this.findOne(id);
  }

  /**
   * Soft delete tracking
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.sequelize.query(`
      UPDATE dbo.Tracking SET DaXoa = 1 WHERE ID = ${id}
    `);
  }

  /**
   * Mass delete tracking
   */
  async massDelete(ids: number[]): Promise<{ deleted: number }> {
    const idList = ids.join(',');

    await this.sequelize.query(`
      UPDATE dbo.Tracking SET DaXoa = 1 WHERE ID IN (${idList})
    `);

    return { deleted: ids.length };
  }

  /**
   * Mass update status
   */
  async massStatus(massUpdateDto: MassUpdateTrackingDto): Promise<{ updated: number }> {
    const { ids, tinhTrang } = massUpdateDto;
    const idList = ids.join(',');

    await this.sequelize.query(`
      UPDATE dbo.Tracking SET TinhTrang = N'${tinhTrang}' WHERE ID IN (${idList})
    `);

    return { updated: ids.length };
  }

  /**
   * Mass complete tracking
   */
  async massComplete(ids: number[]): Promise<{ updated: number }> {
    const idList = ids.join(',');

    await this.sequelize.query(`
      UPDATE dbo.Tracking SET TinhTrang = 'Completed' WHERE ID IN (${idList})
    `);

    return { updated: ids.length };
  }

  /**
   * Mass complete tracking with filters
   */
  async massCompleteAll(query: QueryTrackingDto): Promise<{ updated: number }> {
    const { username, statuses, search, trackingNumber, tenLoHang, quocGiaId, startDate, endDate } = query;

    let whereClause = 'WHERE DaXoa = 0';

    if (username) {
      whereClause += ` AND UserName LIKE '%${username}%'`;
    }
    if (statuses) {
      const statusList = statuses.split(',').map(s => `'${s.trim()}'`).join(',');
      whereClause += ` AND TinhTrang IN (${statusList})`;
    }
    if (search) {
      whereClause += ` AND (TrackingNumber LIKE '%${search}%' OR OrderNumber LIKE '%${search}%')`;
    }
    if (trackingNumber) {
      whereClause += ` AND TrackingNumber LIKE '%${trackingNumber}%'`;
    }
    if (tenLoHang) {
      whereClause += ` AND TenLoHang LIKE '%${tenLoHang}%'`;
    }
    if (quocGiaId && quocGiaId > 0) {
      whereClause += ` AND QuocGiaID = ${quocGiaId}`;
    }
    if (startDate) {
      whereClause += ` AND NgayDatHang >= '${startDate}'`;
    }
    if (endDate) {
      whereClause += ` AND NgayDatHang <= '${endDate}'`;
    }

    const [result]: any[] = await this.sequelize.query(`
      UPDATE dbo.Tracking SET TinhTrang = 'Completed' ${whereClause};
      SELECT @@ROWCOUNT as updated;
    `);

    return { updated: result[0]?.updated || 0 };
  }

  /**
   * Find tracking details
   */
  async findDetails(id: number): Promise<any> {
    const tracking = await this.findOne(id);

    // Get chi tiet tracking
    const [chiTiet] = await this.sequelize.query(`
      SELECT * FROM dbo.ChiTietTracking WHERE TrackingID = ${id} ORDER BY ID DESC
    `);

    // Get lich su tracking
    const history = await this.findHistory(id);

    return {
      ...tracking,
      chiTietTracking: chiTiet || [],
      lichSuTracking: history,
    };
  }

  /**
   * Find tracking status history
   */
  async findHistory(id: number): Promise<any[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT * FROM dbo.tbTinhTrangTracking WHERE TrackingID = ${id} ORDER BY ID DESC
      `);
      return data || [];
    } catch (error) {
      console.error('Error in findHistory:', error.message);
      return [];
    }
  }

  /**
   * Add tracking status
   */
  async addHistory(id: number, ghiChu: string): Promise<any> {
    await this.findOne(id);

    await this.sequelize.query(`
      INSERT INTO dbo.TinhTrangTracking (TrackingID, GhiChu, NgayTao)
      VALUES (${id}, N'${ghiChu}', GETDATE())
    `);

    return this.findOne(id);
  }

  /**
   * Update tracking status
   */
  async updateHistory(historyId: number, ghiChu: string): Promise<any> {
    await this.sequelize.query(`
      UPDATE dbo.TinhTrangTracking SET GhiChu = N'${ghiChu}' WHERE ID = ${historyId}
    `);

    return { id: historyId };
  }

  /**
   * Delete tracking status
   */
  async deleteHistory(historyId: number): Promise<void> {
    await this.sequelize.query(`
      DELETE FROM dbo.tbTinhTrangTracking WHERE ID = ${historyId}
    `);
  }

  /**
   * Get sheets from Excel file for import pages
   * Converted from: Tracking_Import.aspx - Step 1: Upload file to get sheets
   */
  async getExcelSheets(file: any): Promise<{ sheets: string[] }> {
    try {
      const workbook = new Excel.Workbook();
      await workbook.xlsx.load(file.buffer as any);
      const sheets = workbook.worksheets.map(ws => ws.name);
      return { sheets };
    } catch (error) {
      console.error('Error reading Excel sheets:', error.message);
      return { sheets: [] };
    }
  }
}
