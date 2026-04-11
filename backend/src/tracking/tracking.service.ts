import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes } from 'sequelize';
import Excel from 'exceljs';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { QueryTrackingDto } from './dto/query-tracking.dto';
import { MassUpdateTrackingDto } from './dto/mass-update-tracking.dto';
import { SystemLogsService } from '../system-logs/system-logs.service';

/**
 * Tracking Service
 *
 * Handles tracking CRUD operations.
 */
@Injectable()
export class TrackingService {
  constructor(
    @Inject('SEQUELIZE') private sequelize: Sequelize,
    private readonly systemLogsService: SystemLogsService,
  ) {}

  /**
   * Find all tracking with filters and pagination
   * Uses: SP_Lay_Tracking
   */
  async findAll(query: QueryTrackingDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { username, statuses, search, trackingNumber, tenLoHang, quocGiaId, startDate, endDate, page = 1, limit = 20 } = query;

    try {
      // Build comma-separated status list for SP
      const tinhTrang = statuses ?  `N'${statuses.split(',').map(x => `''${x.trim()}''`).join(',')}'` : `''`;
      // Use SP_Lay_Tracking
      const results = await this.sequelize.query(
        `EXEC dbo.SP_Lay_Tracking
          @UserName = :username,
          @TinhTrang = ${tinhTrang},
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
            // tinhTrang,
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
      console.error('Error in findAll tracking:', error);
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
   * Uses: SP_Lay_SoLuongTracking (same as C# dBConnect.LaySoLuongTracking(""))
   */
  async getCounts(): Promise<any> {
    try {
      // SP returns rows: { TinhTrang, SL }
      const data = await this.sequelize.query(
        `EXEC dbo.SP_Lay_SoLuongTracking @UserName = :username`,
        { replacements: { username: '' }, type: QueryTypes.SELECT }
      );

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
   * Uses: SP_Lay_TrackingByID (same as C# BLL.LayTrackingByID)
   */
  async findOne(id: number): Promise<any> {
    try {
      const results = await this.sequelize.query(
        `EXEC dbo.SP_Lay_TrackingByID @TrackingID = :id`,
        { replacements: { id }, type: QueryTypes.SELECT }
      );

      if (!results || results.length === 0) {
        throw new NotFoundException(`Tracking with ID ${id} not found`);
      }

      return results[0];
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
   * Uses: SP_Them_Tracking (same as C# DBConnect.ThemTracking)
   * Logs: ThemSystemLogs with nguon='Tracking_ThemSua:ThemTracking', hanhDong='ThemMoi'
   */
  async create(createTrackingDto: CreateTrackingDto): Promise<any> {
    const { username, trackingNumber, orderNumber, ngayDatHang, nhaVanChuyenId, quocGiaId, tinhTrang, ghiChu, kien, mawb, hawb, nguoiTao } = createTrackingDto;

    try {
      // SP_Them_Tracking returns: { ID: newTrackingId }
      const [result]: any[] = await this.sequelize.query(`
        EXEC dbo.SP_Them_Tracking
          @UserName = :username,
          @TrackingNumber = :trackingNumber,
          @OrderNumber = :orderNumber,
          @NgayDatHang = :ngayDatHang,
          @NhaVanChuyenID = :nhaVanChuyenId,
          @QuocGiaID = :quocGiaId,
          @TinhTrang = :tinhTrang,
          @GhiChu = :ghiChu,
          @NguoiTao = :nguoiTao,
          @Kien = :kien,
          @Mawb = :mawb,
          @Hawb = :hawb,
          @CoTaoLoHang = 0,
          @GhiChuLoHang = ''
      `,
      {
        replacements: {
          username: username || '',
          trackingNumber: trackingNumber || '',
          orderNumber: orderNumber || '',
          ngayDatHang: ngayDatHang || new Date().toISOString().split('T')[0],
          nhaVanChuyenId: nhaVanChuyenId || null,
          quocGiaId: quocGiaId || null,
          tinhTrang: tinhTrang || 'Received',
          ghiChu: ghiChu || '',
          nguoiTao: nguoiTao || '',
          kien: kien || '',
          mawb: mawb || '',
          hawb: hawb || '',
        },
        type: QueryTypes.SELECT,
      });

      const insertedTracking = result && result.length > 0 ? result[0] : null;
      const insertId = insertedTracking?.ID || insertedTracking?.TrackingID;

      // Log system operation
      await this.systemLogsService.create({
        nguoiTao: nguoiTao || '',
        nguon: 'Tracking_ThemSua:ThemTracking',
        hanhDong: 'ThemMoi',
        doiTuong: insertId?.toString() || '',
        noiDung: `TrackingNumber: ${trackingNumber}; OrderNumber: ${orderNumber}; TinhTrang: ${tinhTrang}`,
      });

      return;
    } catch (error) {
      console.error('Error in create tracking:', error.message);
      throw error;
    }
  }

  /**
   * Update tracking
   * Uses: SP_CapNhat_Tracking (same as C# DBConnect.CapNhatTracking)
   * Logs: ThemSystemLogs with nguon='Tracking_ThemSua:CapNhatTracking', hanhDong='ChinhSua'
   */
  async update(id: number, updateTrackingDto: UpdateTrackingDto, actorUsername?: string): Promise<any> {
    await this.findOne(id);

    try {
      // Get current tracking to provide all fields for SP (even unchanged ones)
      const currentTracking = await this.findOne(id);
      const allValues: Record<string, any> = {
        id,
        username: updateTrackingDto.username ?? currentTracking.UserName ?? '',
        trackingNumber: updateTrackingDto.trackingNumber ?? currentTracking.TrackingNumber ?? '',
        orderNumber: updateTrackingDto.orderNumber ?? currentTracking.OrderNumber ?? '',
        ngayDatHang: updateTrackingDto.ngayDatHang ?? currentTracking.NgayDatHang ?? new Date().toISOString().split('T')[0],
        nhaVanChuyenId: updateTrackingDto.nhaVanChuyenId ?? currentTracking.NhaVanChuyenID ?? null,
        quocGiaId: updateTrackingDto.quocGiaId ?? currentTracking.QuocGiaID ?? null,
        tinhTrang: updateTrackingDto.tinhTrang ?? currentTracking.TinhTrang ?? 'Received',
        ghiChu: updateTrackingDto.ghiChu ?? currentTracking.GhiChu ?? '',
        nguoiTao: actorUsername ?? updateTrackingDto.nguoiTao ?? currentTracking.NguoiTao ?? '',
        kien: updateTrackingDto.kien ?? currentTracking.Kien ?? '',
        mawb: updateTrackingDto.mawb ?? currentTracking.Mawb ?? '',
        hawb: updateTrackingDto.hawb ?? currentTracking.Hawb ?? '',
        coTaoLoHang: 0,
        ghiChuLoHang: '',
        udUserName: 1,
        udTrackingNumber: 1,
        udOrderNumber: 1,
        udNgayDatHang: 1,
        udNhaVanChuyenID: 1,
        udQuocGiaID: 1,
        udTinhTrang: 1,
        udGhiChu: 1,
        udKien: 1,
        udMawb: 1,
        udHawb: 1,
        udGhiChuLoHang: 0,
      };

      const paramMap: Array<{ spParam: string; replacementKey: string }> = [
        { spParam: 'TrackingID', replacementKey: 'id' },
        { spParam: 'UserName', replacementKey: 'username' },
        { spParam: 'TrackingNumber', replacementKey: 'trackingNumber' },
        { spParam: 'OrderNumber', replacementKey: 'orderNumber' },
        { spParam: 'NgayDatHang', replacementKey: 'ngayDatHang' },
        { spParam: 'NhaVanChuyenID', replacementKey: 'nhaVanChuyenId' },
        { spParam: 'QuocGiaID', replacementKey: 'quocGiaId' },
        { spParam: 'TinhTrang', replacementKey: 'tinhTrang' },
        { spParam: 'GhiChu', replacementKey: 'ghiChu' },
        { spParam: 'NguoiTao', replacementKey: 'nguoiTao' },
        { spParam: 'Kien', replacementKey: 'kien' },
        { spParam: 'Mawb', replacementKey: 'mawb' },
        { spParam: 'Hawb', replacementKey: 'hawb' },
        { spParam: 'CoTaoLoHang', replacementKey: 'coTaoLoHang' },
        { spParam: 'GhiChuLoHang', replacementKey: 'ghiChuLoHang' },
        { spParam: 'udUserName', replacementKey: 'udUserName' },
        { spParam: 'udTrackingNumber', replacementKey: 'udTrackingNumber' },
        { spParam: 'udOrderNumber', replacementKey: 'udOrderNumber' },
        { spParam: 'udNgayDatHang', replacementKey: 'udNgayDatHang' },
        { spParam: 'udNhaVanChuyenID', replacementKey: 'udNhaVanChuyenID' },
        { spParam: 'udQuocGiaID', replacementKey: 'udQuocGiaID' },
        { spParam: 'udTinhTrang', replacementKey: 'udTinhTrang' },
        { spParam: 'udGhiChu', replacementKey: 'udGhiChu' },
        { spParam: 'udKien', replacementKey: 'udKien' },
        { spParam: 'udMawb', replacementKey: 'udMawb' },
        { spParam: 'udHawb', replacementKey: 'udHawb' },
        { spParam: 'udGhiChuLoHang', replacementKey: 'udGhiChuLoHang' },
      ];

      const spParams = await this.getProcedureParams('dbo.SP_CapNhat_Tracking');
      const selectedParams = paramMap.filter((p) => spParams.has(p.spParam.toLowerCase()));

      const execSql = `EXEC dbo.SP_CapNhat_Tracking\n${selectedParams
        .map((p) => `  @${p.spParam} = :${p.replacementKey}`)
        .join(',\n')}`;
      const replacements = selectedParams.reduce((acc, p) => {
        acc[p.replacementKey] = allValues[p.replacementKey];
        return acc;
      }, {} as Record<string, any>);

      await this.sequelize.query(execSql, {
        replacements,
        type: QueryTypes.RAW,
      });

      // Log system operation
      const updatedFields = Object.keys(updateTrackingDto).filter(k => updateTrackingDto[k] !== undefined);
      await this.systemLogsService.create({
        nguoiTao: currentTracking.NguoiTao || '',
        nguon: 'Tracking_ThemSua:CapNhatTracking',
        hanhDong: 'ChinhSua',
        doiTuong: id.toString(),
        noiDung: `Fields: ${updatedFields.join(', ')}`,
      });

      return this.findOne(id);
    } catch (error) {
      console.error('Error in update tracking:', (error as any).message);
      throw error;
    }
  }

  private async getProcedureParams(procedureName: string): Promise<Set<string>> {
    const rows = await this.sequelize.query(
      `
        SELECT p.name AS parameterName
        FROM sys.parameters p
        WHERE p.object_id = OBJECT_ID(:procedureName)
      `,
      {
        replacements: { procedureName },
        type: QueryTypes.SELECT,
      },
    );

    return new Set(
      (rows as Array<{ parameterName: string }>)
        .map((x) => (x.parameterName || '').replace(/^@/, '').toLowerCase())
        .filter(Boolean),
    );
  }

  /**
   * Soft delete tracking
   * Uses: SP_Xoa_Tracking (same as C# DBConnect.XoaTracking)
   */
  async remove(id: number): Promise<void> {
    // Verify tracking exists first
    await this.findOne(id);

    try {
      await this.sequelize.query(
        `EXEC dbo.SP_Xoa_Tracking @TrackingID = :id`,
        { replacements: { id }, type: QueryTypes.RAW }
      );
    } catch (error) {
      console.error('Error in remove tracking:', (error as any).message);
      throw error;
    }
  }

  /**
   * Mass delete tracking
   * Uses: SP_Xoa_MassDeleteTracking (same as C# dBConnect.MassDeleteTracking(idList))
   * Logs: ThemSystemLogs(nguoiTao, "Tracking_LietKe:MassDelete", "Xoa", "", "ID: ...")
   */
  async massDelete(ids: number[], nguoiTao = ''): Promise<{ deleted: number }> {
    const idList = ids.join(',');

    await this.sequelize.query(
      `EXEC dbo.SP_Xoa_MassDeleteTracking @id = :id`,
      { replacements: { id: idList }, type: QueryTypes.RAW }
    );

    await this.systemLogsService.create({
      nguoiTao,
      nguon: 'Tracking_LietKe:MassDelete',
      hanhDong: 'Xoa',
      doiTuong: '',
      noiDung: `ID: ${idList}`,
    });

    return { deleted: ids.length };
  }

  /**
   * Mass update status
   * Uses: SP_CapNhat_MassStatusTracking (same as C# dBConnect.MassStatusTracking(idList, tinhTrang, null, nguoiTao))
   * Logs: ThemSystemLogs(nguoiTao, "Tracking_LietKe:MassXxx", "Chinh sua", "", "ID: ...")
   */
  async massStatus(massUpdateDto: MassUpdateTrackingDto): Promise<{ updated: number }> {
    const { ids, tinhTrang, nguoiTao = '' } = massUpdateDto;
    const idList = ids.join(',');

    await this.sequelize.query(
      `EXEC dbo.SP_CapNhat_MassStatusTracking
        @id = :id,
        @TinhTrang = :tinhTrang,
        @NgayChuyenTinhTrang = NULL,
        @NguoiTao = :nguoiTao`,
      { replacements: { id: idList, tinhTrang, nguoiTao }, type: QueryTypes.RAW }
    );

    await this.systemLogsService.create({
      nguoiTao,
      nguon: `Tracking_LietKe:Mass${tinhTrang}`,
      hanhDong: 'Chinh sua',
      doiTuong: '',
      noiDung: `ID: ${idList}`,
    });

    return { updated: ids.length };
  }

  /**
   * Mass complete tracking
   * Uses: SP_CapNhat_MassStatusTracking with TinhTrang='Completed'
   */
  async massComplete(ids: number[], nguoiTao = ''): Promise<{ updated: number }> {
    const idList = ids.join(',');

    await this.sequelize.query(
      `EXEC dbo.SP_CapNhat_MassStatusTracking
        @id = :id,
        @TinhTrang = 'Completed',
        @NgayChuyenTinhTrang = NULL,
        @NguoiTao = :nguoiTao`,
      { replacements: { id: idList, nguoiTao }, type: QueryTypes.RAW }
    );

    await this.systemLogsService.create({
      nguoiTao,
      nguon: 'Tracking_LietKe:MassComplete',
      hanhDong: 'Chinh sua',
      doiTuong: '',
      noiDung: `ID: ${idList}`,
    });

    return { updated: ids.length };
  }

  /**
   * Mass complete tracking with filters
   * Uses: SP_CapNhat_MassStatusAllTrackingWithFilter (same as C# dBConnect.MassStatusAllTrackingWithFilter(...))
   * Logs: ThemSystemLogs with full filter details
   */
  async massCompleteAll(query: QueryTrackingDto, nguoiTao = ''): Promise<{ updated: number }> {
    const { username = '', statuses = '', search = '', trackingNumber = '', tenLoHang = '', quocGiaId, startDate = '', endDate = '' } = query;

    // Build comma-separated status filter same as C# (e.g. "'Received','InTransit'")
    const tinhTrangFilter = statuses ? statuses.replace(/,/g, "','") : '';

    await this.sequelize.query(
      `EXEC dbo.SP_CapNhat_MassStatusAllTrackingWithFilter
        @UserName = :username,
        @TinhTrangFilter = :tinhTrangFilter,
        @NoiDungTim = :search,
        @TimTheo = -1,
        @TrackingNumber = :trackingNumber,
        @TenLoHang = :tenLoHang,
        @QuocGiaID = :quocGiaId,
        @DaXoa = 0,
        @TuNgay = :startDate,
        @DenNgay = :endDate,
        @TinhTrang = 'Completed',
        @NgayChuyenTinhTrang = NULL,
        @NguoiTao = :nguoiTao`,
      {
        replacements: {
          username,
          tinhTrangFilter,
          search,
          trackingNumber,
          tenLoHang,
          quocGiaId: quocGiaId && quocGiaId > 0 ? quocGiaId : -1,
          startDate,
          endDate,
          nguoiTao,
        },
        type: QueryTypes.RAW,
      }
    );

    await this.systemLogsService.create({
      nguoiTao,
      nguon: 'Tracking_LietKe:MassCompleteAllWithFilter',
      hanhDong: 'Chinh sua',
      doiTuong: '',
      noiDung: `UserName: ${username}; TinhTrangFilter: ${tinhTrangFilter}; NoiDungTim: ${search}; Tracking number: ${trackingNumber}; QuocGiaID: ${quocGiaId ?? -1}; Từ ngày: ${startDate}; Đến ngày: ${endDate}`,
    });

    return { updated: 0 };
  }

  /**
   * Find tracking details
   * Matches: SuaTracking.cs -> LoadDataChiTietTracking -> SP_Lay_DanhSachChiTietTrackingByID(@TrackingID)
   */
  async findDetails(id: number): Promise<any> {
    const tracking = await this.findOne(id);

    // Get chi tiet tracking via SP (SuaTracking.cs -> SP_Lay_DanhSachChiTietTrackingByID)
    const chiTiet = await this.sequelize.query(
      `EXEC dbo.SP_Lay_DanhSachChiTietTrackingByID @TrackingID = :id`,
      { replacements: { id }, type: QueryTypes.SELECT },
    );

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
      const data = await this.sequelize.query(
        `EXEC dbo.SP_Lay_DanhSachTinhTrangTrackingByID @TrackingID = :id`,
        { replacements: { id }, type: QueryTypes.SELECT },
      );
      return (Array.isArray(data) ? data : []) as any[];
    } catch (error) {
      console.error('Error in findHistory:', (error as any).message);
      return [];
    }
  }

  /**
   * Add tracking status
   * Note: No dedicated SP in C#, uses direct INSERT
   */
  async addHistory(id: number, ghiChu: string): Promise<any> {
    await this.findOne(id);

    try {
      await this.sequelize.query(`
        INSERT INTO dbo.tbTinhTrangTracking (TrackingID, GhiChu, NgayTao)
        VALUES (:id, :ghiChu, GETDATE())
      `,
      { replacements: { id, ghiChu }, type: QueryTypes.RAW });

      return this.findOne(id);
    } catch (error) {
      console.error('Error in addHistory:', (error as any).message);
      throw error;
    }
  }

  /**
   * Update tracking status
   * Uses: SP_CapNhat_TinhTrangTracking
   * Logs: ThemSystemLogs with nguon='Tracking_ThemSua:CapNhatTinhTrangTracking', hanhDong='ChinhSua'
   */
  async updateHistory(historyId: number, ghiChu: string, nguoiTao = ''): Promise<any> {
    try {
      await this.sequelize.query(`
        EXEC dbo.SP_CapNhat_TinhTrangTracking
          @TinhTrangTrackingID = :historyId,
          @GhiChu = :ghiChu
      `,
      { replacements: { historyId, ghiChu }, type: QueryTypes.RAW });

      await this.systemLogsService.create({
        nguoiTao,
        nguon: 'Tracking_ThemSua:CapNhatTinhTrangTracking',
        hanhDong: 'ChinhSua',
        doiTuong: historyId.toString(),
        noiDung: `GhiChu: ${ghiChu}`,
      });

      return { id: historyId };
    } catch (error) {
      console.error('Error in updateHistory:', (error as any).message);
      throw error;
    }
  }

  /**
   * Delete tracking status
   * Uses: SP_Xoa_TinhTrangTracking
   * Logs: ThemSystemLogs with nguon='Tracking_ThemSua:XoaTinhTrangTracking', hanhDong='Xoa'
   */
  async deleteHistory(historyId: number, nguoiTao = ''): Promise<void> {
    try {
      await this.sequelize.query(`
        EXEC dbo.SP_Xoa_TinhTrangTracking @TinhTrangTrackingID = :historyId
      `,
      { replacements: { historyId }, type: QueryTypes.RAW });

      await this.systemLogsService.create({
        nguoiTao,
        nguon: 'Tracking_ThemSua:XoaTinhTrangTracking',
        hanhDong: 'Xoa',
        doiTuong: historyId.toString(),
        noiDung: `TinhTrangTrackingID: ${historyId}`,
      });
    } catch (error) {
      console.error('Error in deleteHistory:', (error as any).message);
      throw error;
    }
  }

  /**
   * Add chi tiet tracking
   * Uses: SP_Them_ChiTietTracking
   * Logs: ThemSystemLogs with nguon='Tracking_ThemSua:ThemChiTietTracking', hanhDong='ThemMoi'
   */
  async addChiTiet(trackingId: number, linkHinh: string, soLuong: number, gia: number, ghiChu: string, nguoiTao: string = ''): Promise<any> {
    try {
      await this.sequelize.query(`
        EXEC dbo.SP_Them_ChiTietTracking
          @TrackingID = :trackingId,
          @LinkHinh = :linkHinh,
          @SoLuong = :soLuong,
          @Gia = :gia,
          @GhiChu = :ghiChu
      `,
      {
        replacements: { trackingId, linkHinh, soLuong, gia, ghiChu },
        type: QueryTypes.RAW,
      });

      await this.systemLogsService.create({
        nguoiTao,
        nguon: 'Tracking_ThemSua:ThemChiTietTracking',
        hanhDong: 'ThemMoi',
        doiTuong: trackingId.toString(),
        noiDung: `TrackingID: ${trackingId}; LinkHinh: ${linkHinh}; SoLuong: ${soLuong}; Gia: ${gia}; GhiChu: ${ghiChu}`,
      });

      return this.findDetails(trackingId);
    } catch (error) {
      console.error('Error in addChiTiet:', (error as any).message);
      throw error;
    }
  }

  /**
   * Update chi tiet tracking
   * Uses: SP_CapNhat_ChiTietTracking
   * Logs: ThemSystemLogs with nguon='Tracking_ThemSua:CapNhatChiTietTracking', hanhDong='ChinhSua'
   */
  async updateChiTiet(chiTietTrackingId: number, linkHinh: string, soLuong: number, gia: number, ghiChu: string, trackingId: number, nguoiTao: string = ''): Promise<any> {
    try {
      await this.sequelize.query(`
        EXEC dbo.SP_CapNhat_ChiTietTracking
          @ChiTietTrackingID = :chiTietTrackingId,
          @LinkHinh = :linkHinh,
          @SoLuong = :soLuong,
          @Gia = :gia,
          @GhiChu = :ghiChu
      `,
      {
        replacements: { chiTietTrackingId, linkHinh, soLuong, gia, ghiChu },
        type: QueryTypes.RAW,
      });

      await this.systemLogsService.create({
        nguoiTao,
        nguon: 'Tracking_ThemSua:CapNhatChiTietTracking',
        hanhDong: 'ChinhSua',
        doiTuong: chiTietTrackingId.toString(),
        noiDung: `LinkHinh: ${linkHinh}; SoLuong: ${soLuong}; Gia: ${gia}; GhiChu: ${ghiChu}`,
      });

      return this.findDetails(trackingId);
    } catch (error) {
      console.error('Error in updateChiTiet:', (error as any).message);
      throw error;
    }
  }

  /**
   * Delete chi tiet tracking
   * Uses: SP_Xoa_ChiTietTracking
   * Logs: ThemSystemLogs with nguon='Tracking_ThemSua:XoaChiTietTracking', hanhDong='Xoa'
   */
  async deleteChiTiet(chiTietTrackingId: number, trackingId: number, nguoiTao: string = ''): Promise<any> {
    try {
      await this.sequelize.query(`
        EXEC dbo.SP_Xoa_ChiTietTracking @ChiTietTrackingID = :chiTietTrackingId
      `,
      { replacements: { chiTietTrackingId }, type: QueryTypes.RAW });

      await this.systemLogsService.create({
        nguoiTao,
        nguon: 'Tracking_ThemSua:XoaChiTietTracking',
        hanhDong: 'Xoa',
        doiTuong: chiTietTrackingId.toString(),
        noiDung: `ChiTietTrackingID: ${chiTietTrackingId}`,
      });

      return this.findDetails(trackingId);
    } catch (error) {
      console.error('Error in deleteChiTiet:', (error as any).message);
      throw error;
    }
  }

  /**
   * Get users for dropdown (Tracking_ThemSua form)
   * Mirrors C# code: userManager.Users.OrderBy(u => u.UserName)
   */
  async getUsers(): Promise<any[]> {
    try {
      const users = await this.sequelize.query(
        `SELECT UserName FROM AspNetUsers ORDER BY UserName`,
        { type: QueryTypes.SELECT }
      );
      return (Array.isArray(users) ? users : []) as any[];
    } catch (error) {
      console.error('Error in getUsers:', (error as any).message);
      return [];
    }
  }

  /**
   * Get shipping providers for dropdown (Tracking_ThemSua form)
   * Uses: SP_Lay_NhaVanChuyen (same as C# DBConnect.LayDanhSachNhaVanChuyen)
   */
  async getNhaVanChuyen(): Promise<any[]> {
    try {
      const providers = await this.sequelize.query(
        `EXEC dbo.SP_Lay_NhaVanChuyen`,
        { type: QueryTypes.SELECT }
      );
      return (Array.isArray(providers) ? providers : []) as any[];
    } catch (error) {
      console.error('Error in getNhaVanChuyen:', (error as any).message);
      return [];
    }
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
      console.error('Error reading Excel sheets:', (error as any).message);
      return { sheets: [] };
    }
  }
}
