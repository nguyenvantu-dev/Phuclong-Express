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
  async create(createShipmentGroupDto: CreateShipmentGroupDto): Promise<any> {
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
  async update(id: number, updateShipmentGroupDto: UpdateShipmentGroupDto): Promise<any> {
    await this.findOne(id);

    const updates: string[] = [];

    if (updateShipmentGroupDto.canNang !== undefined) {
      updates.push(`CanNang = ${updateShipmentGroupDto.canNang}`);
    }
    if (updateShipmentGroupDto.phiShipVeVnUsd !== undefined) {
      updates.push(`PhiShipVeVN_USD = ${updateShipmentGroupDto.phiShipVeVnUsd}`);
    }
    if (updateShipmentGroupDto.phiShipVeVnVnd !== undefined) {
      updates.push(`PhiShipVeVN_VND = ${updateShipmentGroupDto.phiShipVeVnVnd}`);
    }
    if (updateShipmentGroupDto.tyGia !== undefined) {
      updates.push(`TyGia = ${updateShipmentGroupDto.tyGia}`);
    }
    if (updateShipmentGroupDto.ngayGuiHang !== undefined) {
      updates.push(`NgayGuiHang = ${updateShipmentGroupDto.ngayGuiHang ? `'${updateShipmentGroupDto.ngayGuiHang}'` : 'NULL'}`);
    }
    if (updateShipmentGroupDto.soVanDon !== undefined) {
      updates.push(`SoVanDon = N'${updateShipmentGroupDto.soVanDon}'`);
    }
    if (updateShipmentGroupDto.shipperId !== undefined) {
      updates.push(`ShipperID = ${updateShipmentGroupDto.shipperId}`);
    }
    if (updateShipmentGroupDto.daYeuCauGuiHang !== undefined) {
      updates.push(`DaYeuCauGuiHang = ${updateShipmentGroupDto.daYeuCauGuiHang ? 1 : 0}`);
    }

    if (updates.length > 0) {
      await this.sequelize.query(`
        UPDATE dbo.DotHang SET ${updates.join(', ')} WHERE ID = ${id}
      `);
    }

    return this.findOne(id);
  }

  /**
   * Soft delete shipment group
   */
  async remove(id: number): Promise<void> {
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
  ): Promise<any> {
    const group = await this.findByUsernameAndTenDotHang(username, tenDotHang);

    await this.sequelize.query(`
      UPDATE dbo.DotHang
      SET ShipperID = ${shipperId}, NgayGuiHang = '${ngayGuiHang}', SoVanDon = N'${soVanDon}', PhiShipTrongNuoc = ${phiShipTrongNuoc}
      WHERE UserName = '${username}' AND TenDotHang = N'${tenDotHang}'
    `);

    return this.findByUsernameAndTenDotHang(username, tenDotHang);
  }

  /**
   * Mark as complete
   */
  async complete(username: string, tenDotHang: string): Promise<any> {
    await this.findByUsernameAndTenDotHang(username, tenDotHang);

    await this.sequelize.query(`
      UPDATE dbo.DotHang
      SET DaYeuCauGuiHang = 1
      WHERE UserName = '${username}' AND TenDotHang = N'${tenDotHang}'
    `);

    return this.findByUsernameAndTenDotHang(username, tenDotHang);
  }
}
