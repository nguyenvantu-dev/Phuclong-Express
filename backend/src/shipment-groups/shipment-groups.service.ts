import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { CreateShipmentGroupDto } from './dto/create-shipment-group.dto';
import { UpdateShipmentGroupDto } from './dto/update-shipment-group.dto';
import { QueryShipmentGroupDto } from './dto/query-shipment-group.dto';

/**
 * Shipment Groups Service
 *
 * Handles shipment group (DotHang) CRUD operations.
 */
@Injectable()
export class ShipmentGroupsService {
  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {}

  /**
   * Find all shipment groups with filters
   */
  async findAll(query: QueryShipmentGroupDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { username, tenDotHang, page = 1, limit = 20 } = query;

    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';

      if (username) {
        whereClause += ` AND UserName LIKE '%${username}%'`;
      }
      if (tenDotHang) {
        whereClause += ` AND TenDotHang LIKE '%${tenDotHang}%'`;
      }

      // Get total count
      const [countResult]: any[] = await this.sequelize.query(
        `SELECT COUNT(*) as total FROM dbo.DotHang ${whereClause}`
      );
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data
      const [data] = await this.sequelize.query(`
        SELECT * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY ID DESC) as RowNum, * FROM dbo.DotHang ${whereClause}
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
      console.error('Error in findAll shipment groups:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Find delivered shipment groups
   */
  async findDelivered(query: QueryShipmentGroupDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { username, page = 1, limit = 20 } = query;

    try {
      const offset = (page - 1) * limit;
      let whereClause = "WHERE DaYeuCauGuiHang = 1";

      if (username) {
        whereClause += ` AND UserName LIKE '%${username}%'`;
      }

      // Get total count
      const [countResult]: any[] = await this.sequelize.query(
        `SELECT COUNT(*) as total FROM dbo.DotHang ${whereClause}`
      );
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data
      const [data] = await this.sequelize.query(`
        SELECT * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY ID DESC) as RowNum, * FROM dbo.DotHang ${whereClause}
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
      console.error('Error in findDelivered shipment groups:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Find shipment group by ID
   */
  async findOne(id: number): Promise<any> {
    try {
      const [result]: any[] = await this.sequelize.query(
        `SELECT * FROM dbo.DotHang WHERE ID = ${id}`
      );

      if (!result || result.length === 0) {
        throw new NotFoundException(`Shipment group with ID ${id} not found`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in findOne shipment group:', error.message);
      throw new NotFoundException(`Shipment group with ID ${id} not found`);
    }
  }

  /**
   * Find shipment groups by username
   */
  async findByUsername(username: string): Promise<any[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT * FROM dbo.DotHang WHERE UserName = '${username}' ORDER BY ID DESC
      `);
      return data || [];
    } catch (error) {
      console.error('Error in findByUsername shipment groups:', error.message);
      return [];
    }
  }

  /**
   * Find shipment group by username and tenDotHang
   */
  async findByUsernameAndTenDotHang(username: string, tenDotHang: string): Promise<any> {
    try {
      const [result]: any[] = await this.sequelize.query(`
        SELECT * FROM dbo.DotHang WHERE UserName = '${username}' AND TenDotHang = N'${tenDotHang}'
      `);

      if (!result || result.length === 0) {
        throw new NotFoundException(`Shipment group not found`);
      }

      return result[0];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in findByUsernameAndTenDotHang:', error.message);
      throw new NotFoundException(`Shipment group not found`);
    }
  }

  /**
   * Create new shipment group
   */
  async create(createShipmentGroupDto: CreateShipmentGroupDto, nguoiTao = 'system'): Promise<any> {
    const { username, tenDotHang, canNang, phiShipVeVnUsd, phiShipVeVnVnd, tyGia, ngayGuiHang, soVanDon, shipperId } = createShipmentGroupDto;

    try {
      const [result]: any[] = await this.sequelize.query(`
        INSERT INTO dbo.DotHang (UserName, TenDotHang, CanNang, PhiShipVeVN_USD, PhiShipVeVN_VND, TyGia, NgayGuiHang, SoVanDon, ShipperID, DaYeuCauGuiHang, NgayTao)
        VALUES (N'${username}', N'${tenDotHang}', ${canNang || 0}, ${phiShipVeVnUsd || 0}, ${phiShipVeVnVnd || 0}, ${tyGia || 1}, ${ngayGuiHang ? `'${ngayGuiHang}'` : 'NULL'}, N'${soVanDon || ''}', ${shipperId || 'NULL'}, 0, GETDATE());
        SELECT SCOPE_IDENTITY() as ID;
      `);

      const insertId = result[0]?.ID;
      return this.findOne(insertId);
    } catch (error) {
      console.error('Error in create shipment group:', error.message);
      throw error;
    }
  }

  /**
   * Update shipment group
   */
  async update(id: number, updateShipmentGroupDto: UpdateShipmentGroupDto, nguoiTao = 'system'): Promise<any> {
    const group = await this.findOne(id);

    await this.sequelize.query(
      `EXEC SP_CapNhat_CapNhatDotHang
        @TenDotHang = :tenDotHang,
        @UserName = :username,
        @CanNang = :canNang,
        @PhiShipVeVN_USD = :phiShipVeVnUsd,
        @TyGia = :tyGia,
        @PhiShipVeVN_VND = :phiShipVeVnVnd,
        @NguoiTao = :nguoiTao`,
      {
        replacements: {
          tenDotHang: group.TenDotHang,
          username: group.UserName,
          canNang: updateShipmentGroupDto.canNang ?? group.CanNang ?? 0,
          phiShipVeVnUsd: updateShipmentGroupDto.phiShipVeVnUsd ?? group.PhiShipVeVN_USD ?? 0,
          tyGia: updateShipmentGroupDto.tyGia ?? group.TyGia ?? 0,
          phiShipVeVnVnd: updateShipmentGroupDto.phiShipVeVnVnd ?? group.PhiShipVeVN_VND ?? 0,
          nguoiTao,
        },
      },
    );

    const updated = await this.findOne(id);

    await this.logAction(
      nguoiTao,
      'DotHang_LietKe:CapNhatDotHang',
      'Chinh sua',
      group.TenDotHang,
      `TenDotHang: ${group.TenDotHang}; UserName: ${group.UserName}; : ${updateShipmentGroupDto.canNang ?? group.CanNang ?? 0}; PhiShipVeVN_USD: ${updateShipmentGroupDto.phiShipVeVnUsd ?? group.PhiShipVeVN_USD ?? 0}; TyGia: ${updateShipmentGroupDto.tyGia ?? group.TyGia ?? 0}; PhiShipVeVN_VND: ${updateShipmentGroupDto.phiShipVeVnVnd ?? group.PhiShipVeVN_VND ?? 0}`,
    );

    return updated;
  }

  /**
   * Soft delete shipment group
   */
  async remove(id: number, nguoiTao = 'system'): Promise<void> {
    await this.findOne(id);

    await this.sequelize.query(`
      UPDATE dbo.DotHang SET DaXoa = 1 WHERE ID = ${id}
    `);
  }

  /**
   * Update shipping info
   */
  async updateShipping(
    username: string,
    tenDotHang: string,
    shipperId: number,
    ngayGuiHang: string,
    soVanDon: string,
    phiShipTrongNuoc: number,
    nguoiTao = 'system',
  ): Promise<any> {
    await this.findByUsernameAndTenDotHang(username, tenDotHang);

    await this.sequelize.query(
      `EXEC SP_CapNhat_DotHang_Ship
        @TenDotHang = :tenDotHang,
        @UserName = :username,
        @ShipperID = :shipperId,
        @NgayGuiHang = :ngayGuiHang,
        @SoVanDon = :soVanDon,
        @PhiShipTrongNuoc = :phiShipTrongNuoc,
        @NguoiTao = :nguoiTao`,
      { replacements: { tenDotHang, username, shipperId, ngayGuiHang: ngayGuiHang || null, soVanDon: soVanDon || '', phiShipTrongNuoc: phiShipTrongNuoc || 0, nguoiTao } },
    );

    await this.logAction(
      nguoiTao,
      'DotHang_Ship:CapNhatDotHang_Ship',
      'Chinh sua',
      tenDotHang,
      `TenDotHang: ${tenDotHang}; User: ${username}; Shipper: ${shipperId}; NgayGuiHang: ${ngayGuiHang}; SoVanDon: ${soVanDon}; PhiShipTrongNuoc: ${phiShipTrongNuoc}`,
    );

    return this.findByUsernameAndTenDotHang(username, tenDotHang);
  }

  async updateShippingFromDebtReport(
    username: string,
    tenDotHang: string,
    shipperId: number,
    ngayGuiHang: string,
    soVanDon: string,
    phiShipTrongNuoc: number,
    diaChiNhanHang: string,
    datCoc: number,
    nguoiTao = 'system',
  ): Promise<any> {
    await this.findByUsernameAndTenDotHang(username, tenDotHang);

    await this.sequelize.query(
      `EXEC SP_CapNhat_DotHang_Ship1
        @TenDotHang = :tenDotHang,
        @UserName = :username,
        @ShipperID = :shipperId,
        @NgayGuiHang = :ngayGuiHang,
        @SoVanDon = :soVanDon,
        @PhiShipTrongNuoc = :phiShipTrongNuoc,
        @DiaChiNhanHang = :diaChiNhanHang,
        @DatCoc = :datCoc,
        @NguoiTao = :nguoiTao`,
      { replacements: { tenDotHang, username, shipperId, ngayGuiHang: ngayGuiHang || null, soVanDon: soVanDon || '', phiShipTrongNuoc: phiShipTrongNuoc || 0, diaChiNhanHang: diaChiNhanHang || '', datCoc: datCoc || 0, nguoiTao } },
    );

    await this.logAction(
      nguoiTao,
      'DotHang_Ship1:CapNhatDotHang_Ship1',
      'Chinh sua',
      tenDotHang,
      `TenDotHang: ${tenDotHang}; User: ${username}; Shipper: ${shipperId}; NgayGuiHang: ${ngayGuiHang}; SoVanDon: ${soVanDon}; PhiShipTrongNuoc: ${phiShipTrongNuoc}; DiaChiNhanHang: ${diaChiNhanHang}; DatCoc: ${datCoc}`,
    );

    return this.findByUsernameAndTenDotHang(username, tenDotHang);
  }

  /**
   * Mark as complete
   */
  async complete(username: string, tenDotHang: string, nguoiTao = 'system'): Promise<any> {
    await this.findByUsernameAndTenDotHang(username, tenDotHang);

    await this.sequelize.query(
      `EXEC SP_CapNhat_CompleteDotHang @username = :username, @TenDotHang = :tenDotHang`,
      { replacements: { username, tenDotHang } },
    );

    await this.logAction(
      nguoiTao,
      'DotHangGui:CapNhatCompleteDotHang',
      'Chinh sua',
      '',
      `UserName: ${username}; TenDotHang: ${tenDotHang}`,
    );

    return this.findByUsernameAndTenDotHang(username, tenDotHang);
  }

  private async logAction(nguoiTao: string, nguon: string, hanhDong: string, doiTuong: string, noiDung: string): Promise<void> {
    try {
      await this.sequelize.query(
        `EXEC SP_Them_SystemLogs @NguoiTao = :nguoiTao, @Nguon = :nguon, @HanhDong = :hanhDong, @DoiTuong = :doiTuong, @NoiDung = :noiDung`,
        { replacements: { nguoiTao, nguon, hanhDong, doiTuong, noiDung } },
      );
    } catch (error) {
      console.error('Error logging shipment group action:', error.message);
    }
  }
}
