import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sequelize, QueryTypes } from 'sequelize';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import { QueryBatchDto } from './dto/query-batch.dto';

/**
 * Batches Service
 *
 * Handles batch (LoHang) CRUD operations and business logic.
 */
@Injectable()
export class BatchesService {
  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {}

  /**
   * Find all batches with filters and pagination
   *
   * Replicates SP_Lay_LoHang logic using two separate parameterized queries.
   * Sequelize with MSSQL/tedious only returns the first result set from a SP,
   * so we avoid the SP and query directly.
   *
   * Columns match SP_Lay_LoHang output:
   *   LoHangID, UserName, NgayLoHang (= NgayDatHang), TenLoHang,
   *   LoaiTien, TyGia, NgayDenDuKien, NgayDenThucTe, NguoiTao, NgayTao,
   *   TienLoHangA (sum PhiShipVeVN), TienPhiHaiQuanB (sum ThueHaiQuan), TongTienLoHang (A+B)
   */
  async findAll(query: QueryBatchDto): Promise<{ data: any[]; total: number; page: number; pageSize: number }> {
    const { username = '', tuNgay, denNgay, page = 1, pageSize = 200 } = query;
    const offset = (page - 1) * pageSize;

    // Build parameterized WHERE clause matching SP_Lay_LoHang filter logic
    const replacements: Record<string, any> = { offset, pageSize };
    const conditions: string[] = [];

    if (username) {
      conditions.push(`lh.UserName = :username`);
      replacements.username = username;
    }
    if (tuNgay) {
      conditions.push(`lh.NgayLoHang >= :tuNgay`);
      replacements.tuNgay = tuNgay;
    }
    if (denNgay) {
      // Include full end day (23:59:59) — mirrors C# DenNgay with time 23:59:59
      conditions.push(`lh.NgayLoHang <= DATEADD(second, 86399, CAST(:denNgay AS datetime))`);
      replacements.denNgay = denNgay;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    try {
      // 1. Total count
      const [countResult] = await this.sequelize.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM dbo.tbLoHang lh ${whereClause}`,
        { replacements, type: QueryTypes.SELECT }
      );
      const total = Number((countResult as any)?.total) || 0;

      // 2. Paginated data — mirrors LoHang entity from RtnRowLoHang:
      //    aliases ID→LoHangID, NgayDatHang→NgayLoHang
      //    computes TienLoHangA, TienPhiHaiQuanB, TongTienLoHang via subqueries
      const data = await this.sequelize.query(
        `SELECT paged.*
        FROM (
          SELECT
            ROW_NUMBER() OVER (ORDER BY lh.LoHangID DESC) AS RowNum,
            lh.LoHangID AS LoHangID,
            lh.UserName,
            lh.NgayLoHang,
            lh.TenLoHang,
            lh.LoaiTien,
            lh.TyGia,
            lh.NgayDenDuKien,
            lh.NgayDenThucTe,
            lh.NguoiTao,
            lh.NgayTao,
            ISNULL((SELECT SUM(sv.TongTienShipVeVN_VND) FROM dbo.tbLoHang_PhiShipVeVN sv WHERE sv.LoHangID = lh.LoHangID), 0) AS TienLoHangA,
            ISNULL((SELECT SUM(hq.TongTienThueHaiQuan_VND) FROM dbo.tbLoHang_ThueHaiQuan hq WHERE hq.LoHangID = lh.LoHangID), 0) AS TienPhiHaiQuanB,
            ISNULL((SELECT SUM(sv.TongTienShipVeVN_VND) FROM dbo.tbLoHang_PhiShipVeVN sv WHERE sv.LoHangID = lh.LoHangID), 0)
              + ISNULL((SELECT SUM(hq.TongTienThueHaiQuan_VND) FROM dbo.tbLoHang_ThueHaiQuan hq WHERE hq.LoHangID = lh.LoHangID), 0) AS TongTienLoHang
          FROM dbo.tbLoHang lh
          ${whereClause}
        ) paged
        WHERE paged.RowNum BETWEEN :offset + 1 AND :offset + :pageSize`,
        { replacements, type: QueryTypes.SELECT }
      );

      return { data: data || [], total, page, pageSize };
    } catch (error) {
      console.error('Error in findAll batches:', error.message);
      return { data: [], total: 0, page, pageSize };
    }
  }

  /**
   * Find batch by ID
   */
  async findOne(id: number): Promise<any> {
    try {
      const [result]: any[] = await this.sequelize.query(
        `SELECT * FROM dbo.tbLoHang WHERE ID = ${id}`
      );

      if (!result || result.length === 0) {
        throw new NotFoundException(`Batch with ID ${id} not found`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in findOne batch:', error.message);
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
  }

  /**
   * Find batch by TenLoHang
   * Used by public thong-tin-lo-hang page
   * Uses: SP_Lay_LoHangByID, SP_Lay_DanhSachLoHang_PhiShipVeVNByID, SP_Lay_DanhSachLoHang_ThueHaiQuanByID, SP_Lay_Tracking
   */
  async findByTenLoHang(tenLoHang: string): Promise<any> {
    try {
      // First get LoHang ID by TenLoHang
      const [loHangResult]: any[] = await this.sequelize.query(
        `SELECT ID FROM dbo.tbLoHang WHERE TenLoHang = N'${tenLoHang.replace(/'/g, "''")}' AND DaXoa = 0`
      );

      if (!loHangResult || loHangResult.length === 0) {
        throw new NotFoundException(`Batch with TenLoHang ${tenLoHang} not found`);
      }

      const loHangId = loHangResult[0].ID;

      // Get batch details using SP_Lay_LoHangByID
      const [batchResult] = await this.sequelize.query(
        `EXEC dbo.SP_Lay_LoHangByID @ID = ${loHangId}`
      );
      const batch = batchResult?.[0];

      if (!batch) {
        throw new NotFoundException(`Batch with TenLoHang ${tenLoHang} not found`);
      }

      // Get ship costs using SP_Lay_DanhSachLoHang_PhiShipVeVNByID
      const [shipCostsResult] = await this.sequelize.query(
        `EXEC dbo.SP_Lay_DanhSachLoHang_PhiShipVeVNByID @LoHangID = ${loHangId}`
      );

      // Get customs using SP_Lay_DanhSachLoHang_ThueHaiQuanByID
      const [customsResult] = await this.sequelize.query(
        `EXEC dbo.SP_Lay_DanhSachLoHang_ThueHaiQuanByID @LoHangID = ${loHangId}`
      );

      // Get tracking list using SP_Lay_Tracking (filter by TenLoHang)
      const [trackingResult] = await this.sequelize.query(
        `EXEC dbo.SP_Lay_Tracking
          @UserName = '',
          @TinhTrang = '',
          @NoiDungTim = '',
          @TimTheo = -1,
          @TrackingNumber = '',
          @TenLoHang = N'${tenLoHang.replace(/'/g, "''")}',
          @PageSize = 1000,
          @PageNum = 1,
          @QuocGiaID = -1,
          @DaXoa = 0,
          @TuNgay = '',
          @DenNgay = ''`
      );

      // SP_Lay_Tracking returns: [ { TOTALROW: 50 }, {row1}, {row2}, ... ]
      const trackingData = trackingResult as any[];
      const trackings = trackingData.slice(1) || [];

      return {
        ...batch,
        shipCosts: shipCostsResult || [],
        customs: customsResult || [],
        trackings: trackings,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in findByTenLoHang:', error.message);
      throw new NotFoundException(`Batch with TenLoHang ${tenLoHang} not found`);
    }
  }

  /**
   * Create new batch
   */
  async create(createBatchDto: CreateBatchDto): Promise<any> {
    const { username, trackingNumber, orderNumber, ngayDatHang, nhaVanChuyenId, tenLoHang, tinhTrang, ghiChu, loaiTien, tyGia, ngayDenDuKien, ngayDenThucTe, nguoiTao } = createBatchDto;

    // Generate tenLoHang if not provided (format: yyyyMMdd)
    const loHangDate = ngayDatHang ? new Date(ngayDatHang) : new Date();
    const generatedTenLoHang = tenLoHang || loHangDate.toISOString().slice(0, 10).replace(/-/g, '');

    try {
      const [result]: any[] = await this.sequelize.query(`
        INSERT INTO dbo.tbLoHang (UserName, TrackingNumber, OrderNumber, NgayLoHang, NhaVanChuyenID, TenLoHang, TinhTrang, GhiChu, LoaiTien, TyGia, NgayDenDuKien, NgayDenThucTe, NguoiTao, DaXoa, NgayTao)
        VALUES (N'${username || ''}', N'${trackingNumber || ''}', N'${orderNumber || ''}', ${ngayDatHang ? `'${ngayDatHang}'` : 'GETDATE()'}, ${nhaVanChuyenId || 'NULL'}, N'${generatedTenLoHang}', N'${tinhTrang || 'Mới tạo'}', N'${ghiChu || ''}', N'${loaiTien || 'USD'}', ${tyGia || 1}, ${ngayDenDuKien ? `'${ngayDenDuKien}'` : 'NULL'}, ${ngayDenThucTe ? `'${ngayDenThucTe}'` : 'NULL'}, N'${nguoiTao || ''}', 0, GETDATE());
        SELECT SCOPE_IDENTITY() as ID;
      `);

      const insertId = result[0]?.ID;
      return this.findOne(insertId);
    } catch (error) {
      console.error('Error in create batch:', error.message);
      throw error;
    }
  }

  /**
   * Update batch
   */
  async update(id: number, updateBatchDto: UpdateBatchDto): Promise<any> {
    await this.findOne(id); // Verify exists

    const updates: string[] = [];

    if (updateBatchDto.username !== undefined) {
      updates.push(`UserName = N'${updateBatchDto.username}'`);
    }
    if (updateBatchDto.trackingNumber !== undefined) {
      updates.push(`TrackingNumber = N'${updateBatchDto.trackingNumber}'`);
    }
    if (updateBatchDto.orderNumber !== undefined) {
      updates.push(`OrderNumber = N'${updateBatchDto.orderNumber}'`);
    }
    if (updateBatchDto.ngayDatHang !== undefined) {
      updates.push(`NgayLoHang = '${updateBatchDto.ngayDatHang}'`);
    }
    if (updateBatchDto.nhaVanChuyenId !== undefined) {
      updates.push(`NhaVanChuyenID = ${updateBatchDto.nhaVanChuyenId}`);
    }
    if (updateBatchDto.tenLoHang !== undefined) {
      updates.push(`TenLoHang = N'${updateBatchDto.tenLoHang}'`);
    }
    if (updateBatchDto.tinhTrang !== undefined) {
      updates.push(`TinhTrang = N'${updateBatchDto.tinhTrang}'`);
    }
    if (updateBatchDto.ghiChu !== undefined) {
      updates.push(`GhiChu = N'${updateBatchDto.ghiChu}'`);
    }
    if (updateBatchDto.loaiTien !== undefined) {
      updates.push(`LoaiTien = N'${updateBatchDto.loaiTien}'`);
    }
    if (updateBatchDto.tyGia !== undefined) {
      updates.push(`TyGia = ${updateBatchDto.tyGia}`);
    }
    if (updateBatchDto.ngayDenDuKien !== undefined) {
      updates.push(`NgayDenDuKien = ${updateBatchDto.ngayDenDuKien ? `'${updateBatchDto.ngayDenDuKien}'` : 'NULL'}`);
    }
    if (updateBatchDto.ngayDenThucTe !== undefined) {
      updates.push(`NgayDenThucTe = ${updateBatchDto.ngayDenThucTe ? `'${updateBatchDto.ngayDenThucTe}'` : 'NULL'}`);
    }

    if (updates.length > 0) {
      await this.sequelize.query(`
        UPDATE dbo.tbLoHang SET ${updates.join(', ')} WHERE ID = ${id}
      `);
    }

    return this.findOne(id);
  }

  /**
   * Soft delete batch
   */
  async remove(id: number): Promise<void> {
    await this.findOne(id); // Verify exists

    await this.sequelize.query(`
      UPDATE dbo.tbLoHang SET DaXoa = 1 WHERE ID = ${id}
    `);
  }

  /**
   * Find batch details (ship costs, customs, tracking)
   */
  async findDetails(id: number): Promise<any> {
    const batch = await this.findOne(id);
    const shipCosts = await this.findShipCosts(id);
    const customs = await this.findCustoms(id);

    return {
      ...batch,
      shipCosts,
      customs,
    };
  }

  /**
   * Find batch costs (ChiPhiLoHang)
   */
  async findCosts(batchId: number): Promise<any[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT lhcl.*, lcl.TenLoaiChiPhiLoHang
        FROM dbo.tbLoHang_ChiPhiLoHang lhcl
        LEFT JOIN dbo.LoaiChiPhiLoHang lcl ON lhcl.LoaiChiPhiLoHangID = lcl.ID
        WHERE lhcl.LoHangID = ${batchId}
        ORDER BY lhcl.ID DESC
      `);
      return data || [];
    } catch (error) {
      console.error('Error in findCosts:', error.message);
      return [];
    }
  }

  /**
   * Add batch cost
   */
  async addCost(batchId: number, loaiChiPhiLoHangId: number, tienVnd: number): Promise<any> {
    const batch = await this.findOne(batchId);

    await this.sequelize.query(`
      INSERT INTO dbo.tbLoHang_ChiPhiLoHang (LoHangID, LoaiChiPhiLoHangID, TienVND, NgayTao)
      VALUES (${batchId}, ${loaiChiPhiLoHangId}, ${tienVnd}, GETDATE())
    `);

    return this.findOne(batchId);
  }

  /**
   * Update batch cost
   */
  async updateCost(costId: number, loaiChiPhiLoHangId: number, tienVnd: number): Promise<any> {
    await this.sequelize.query(`
      UPDATE dbo.tbLoHang_ChiPhiLoHang
      SET LoaiChiPhiLoHangID = ${loaiChiPhiLoHangId}, TienVND = ${tienVnd}
      WHERE ID = ${costId}
    `);

    return { id: costId };
  }

  /**
   * Delete batch cost
   */
  async deleteCost(costId: number): Promise<void> {
    await this.sequelize.query(`
      DELETE FROM dbo.tbLoHang_ChiPhiLoHang WHERE ID = ${costId}
    `);
  }

  /**
   * Find batch ship costs (PhiShipVeVN)
   */
  async findShipCosts(batchId: number): Promise<any[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT lhsv.*, lhs.TenLoaiHangShip
        FROM dbo.tbLoHang_PhiShipVeVN lhsv
        LEFT JOIN dbo.LoaiHangShip lhs ON lhsv.LoaiHangShipID = lhs.ID
        WHERE lhsv.LoHangID = ${batchId}
        ORDER BY lhsv.ID DESC
      `);
      return data || [];
    } catch (error) {
      console.error('Error in findShipCosts:', error.message);
      return [];
    }
  }

  /**
   * Add batch ship cost
   */
  async addShipCost(batchId: number, loaiHangShipId: number, canNang: number, donGia: number, tongTienShipVnd: number): Promise<any> {
    await this.sequelize.query(`
      INSERT INTO dbo.tbLoHang_PhiShipVeVN (LoHangID, LoaiHangShipID, CanNang, DonGia, TongTienShipVeVN_VND, NgayTao)
      VALUES (${batchId}, ${loaiHangShipId}, ${canNang}, ${donGia}, ${tongTienShipVnd}, GETDATE())
    `);

    return this.findOne(batchId);
  }

  /**
   * Update batch ship cost
   */
  async updateShipCost(shipCostId: number, loaiHangShipId: number, canNang: number, donGia: number, tongTienShipVnd: number): Promise<any> {
    await this.sequelize.query(`
      UPDATE dbo.tbLoHang_PhiShipVeVN
      SET LoaiHangShipID = ${loaiHangShipId}, CanNang = ${canNang}, DonGia = ${donGia}, TongTienShipVeVN_VND = ${tongTienShipVnd}
      WHERE ID = ${shipCostId}
    `);

    return { id: shipCostId };
  }

  /**
   * Delete batch ship cost
   */
  async deleteShipCost(shipCostId: number): Promise<void> {
    await this.sequelize.query(`
      DELETE FROM dbo.tbLoHang_PhiShipVeVN WHERE ID = ${shipCostId}
    `);
  }

  /**
   * Find batch customs (ThueHaiQuan)
   */
  async findCustoms(batchId: number): Promise<any[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT lhthq.*, lhthq2.TenLoaiHangThueHaiQuan
        FROM dbo.tbLoHang_ThueHaiQuan lhthq
        LEFT JOIN dbo.LoaiHangThueHaiQuan lhthq2 ON lhthq.LoaiHangThueHaiQuanID = lhthq2.ID
        WHERE lhthq.LoHangID = ${batchId}
        ORDER BY lhthq.ID DESC
      `);
      return data || [];
    } catch (error) {
      console.error('Error in findCustoms:', error.message);
      return [];
    }
  }

  /**
   * Add batch customs
   */
  async addCustoms(batchId: number, loaiHangThueHaiQuanId: number, canNangSoLuongGiaTri: number, donGia: number, tongTienThueHaiQuanVnd: number): Promise<any> {
    await this.sequelize.query(`
      INSERT INTO dbo.tbLoHang_ThueHaiQuan (LoHangID, LoaiHangThueHaiQuanID, CanNangSoLuongGiaTri, DonGia, TongTienThueHaiQuan_VND, NgayTao)
      VALUES (${batchId}, ${loaiHangThueHaiQuanId}, ${canNangSoLuongGiaTri}, ${donGia}, ${tongTienThueHaiQuanVnd}, GETDATE())
    `);

    return this.findOne(batchId);
  }

  /**
   * Update batch customs
   */
  async updateCustoms(customsId: number, loaiHangThueHaiQuanId: number, canNangSoLuongGiaTri: number, donGia: number, tongTienThueHaiQuanVnd: number): Promise<any> {
    await this.sequelize.query(`
      UPDATE dbo.tbLoHang_ThueHaiQuan
      SET LoaiHangThueHaiQuanID = ${loaiHangThueHaiQuanId}, CanNangSoLuongGiaTri = ${canNangSoLuongGiaTri}, DonGia = ${donGia}, TongTienThueHaiQuan_VND = ${tongTienThueHaiQuanVnd}
      WHERE ID = ${customsId}
    `);

    return { id: customsId };
  }

  /**
   * Delete batch customs
   */
  async deleteCustoms(customsId: number): Promise<void> {
    await this.sequelize.query(`
      DELETE FROM dbo.tbLoHang_ThueHaiQuan WHERE ID = ${customsId}
    `);
  }
}
