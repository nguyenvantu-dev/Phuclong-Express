import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
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
   */
  async findAll(query: QueryBatchDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { username, startDate, endDate, page = 1, limit = 20 } = query;

    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';

      if (username) {
        whereClause += ` AND UserName LIKE '%${username}%'`;
      }
      if (startDate) {
        whereClause += ` AND NgayDatHang >= '${startDate}'`;
      }
      if (endDate) {
        whereClause += ` AND NgayDatHang <= '${endDate}'`;
      }

      // Get total count
      const [countResult]: any[] = await this.sequelize.query(
        `SELECT COUNT(*) as total FROM dbo.LoHang ${whereClause}`
      );
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data
      const [data] = await this.sequelize.query(`
        SELECT * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY ID DESC) as RowNum, * FROM dbo.LoHang ${whereClause}
        ) AS Paginated
        WHERE RowNum BETWEEN ${offset + 1} AND ${offset + limit}
      `);

      return {
        data: data || [],
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findAll batches:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Find batch by ID
   */
  async findOne(id: number): Promise<any> {
    try {
      const [result]: any[] = await this.sequelize.query(
        `SELECT * FROM dbo.LoHang WHERE ID = ${id}`
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
   * Create new batch
   */
  async create(createBatchDto: CreateBatchDto): Promise<any> {
    const { username, trackingNumber, orderNumber, ngayDatHang, nhaVanChuyenId, tenLoHang, tinhTrang, ghiChu, loaiTien, tyGia, ngayDenDuKien, ngayDenThucTe, nguoiTao } = createBatchDto;

    // Generate tenLoHang if not provided (format: yyyyMMdd)
    const loHangDate = ngayDatHang ? new Date(ngayDatHang) : new Date();
    const generatedTenLoHang = tenLoHang || loHangDate.toISOString().slice(0, 10).replace(/-/g, '');

    try {
      const [result]: any[] = await this.sequelize.query(`
        INSERT INTO dbo.LoHang (UserName, TrackingNumber, OrderNumber, NgayDatHang, NhaVanChuyenID, TenLoHang, TinhTrang, GhiChu, LoaiTien, TyGia, NgayDenDuKien, NgayDenThucTe, NguoiTao, DaXoa, NgayTao)
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
      updates.push(`NgayDatHang = '${updateBatchDto.ngayDatHang}'`);
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
        UPDATE dbo.LoHang SET ${updates.join(', ')} WHERE ID = ${id}
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
      UPDATE dbo.LoHang SET DaXoa = 1 WHERE ID = ${id}
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
        FROM dbo.LoHang_ChiPhiLoHang lhcl
        LEFT JOIN dbo.LoaiChiPhiLoHang lcl ON lhcl.LoaiChiPhiLoHangID = lcl.ID
        WHERE lhcl.LoHangID = (SELECT ID FROM dbo.LoHang WHERE TenLoHang = '${batchId}')
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
      INSERT INTO dbo.LoHang_ChiPhiLoHang (LoHangID, LoaiChiPhiLoHangID, TienVND, NgayTao)
      VALUES (${batchId}, ${loaiChiPhiLoHangId}, ${tienVnd}, GETDATE())
    `);

    return this.findOne(batchId);
  }

  /**
   * Update batch cost
   */
  async updateCost(costId: number, loaiChiPhiLoHangId: number, tienVnd: number): Promise<any> {
    await this.sequelize.query(`
      UPDATE dbo.LoHang_ChiPhiLoHang
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
      DELETE FROM dbo.LoHang_ChiPhiLoHang WHERE ID = ${costId}
    `);
  }

  /**
   * Find batch ship costs (PhiShipVeVN)
   */
  async findShipCosts(batchId: number): Promise<any[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT lhsv.*, lhs.TenLoaiHangShip
        FROM dbo.LoHang_PhiShipVeVN lhsv
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
      INSERT INTO dbo.LoHang_PhiShipVeVN (LoHangID, LoaiHangShipID, CanNang, DonGia, TongTienShipVeVN_VND, NgayTao)
      VALUES (${batchId}, ${loaiHangShipId}, ${canNang}, ${donGia}, ${tongTienShipVnd}, GETDATE())
    `);

    return this.findOne(batchId);
  }

  /**
   * Update batch ship cost
   */
  async updateShipCost(shipCostId: number, loaiHangShipId: number, canNang: number, donGia: number, tongTienShipVnd: number): Promise<any> {
    await this.sequelize.query(`
      UPDATE dbo.LoHang_PhiShipVeVN
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
      DELETE FROM dbo.LoHang_PhiShipVeVN WHERE ID = ${shipCostId}
    `);
  }

  /**
   * Find batch customs (ThueHaiQuan)
   */
  async findCustoms(batchId: number): Promise<any[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT lhthq.*, lhthq.TenLoaiHangThueHaiQuan
        FROM dbo.LoHang_ThueHaiQuan lhthq
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
      INSERT INTO dbo.LoHang_ThueHaiQuan (LoHangID, LoaiHangThueHaiQuanID, CanNangSoLuongGiaTri, DonGia, TongTienThueHaiQuan_VND, NgayTao)
      VALUES (${batchId}, ${loaiHangThueHaiQuanId}, ${canNangSoLuongGiaTri}, ${donGia}, ${tongTienThueHaiQuanVnd}, GETDATE())
    `);

    return this.findOne(batchId);
  }

  /**
   * Update batch customs
   */
  async updateCustoms(customsId: number, loaiHangThueHaiQuanId: number, canNangSoLuongGiaTri: number, donGia: number, tongTienThueHaiQuanVnd: number): Promise<any> {
    await this.sequelize.query(`
      UPDATE dbo.LoHang_ThueHaiQuan
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
      DELETE FROM dbo.LoHang_ThueHaiQuan WHERE ID = ${customsId}
    `);
  }
}
