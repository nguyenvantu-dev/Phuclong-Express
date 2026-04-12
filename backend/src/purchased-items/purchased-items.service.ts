import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { PurchasedItem, PurchasedItemModel } from './entities/purchased-item.entity';
import { CreatePurchasedItemDto } from './dto/create-purchased-item.dto';
import { UpdatePurchasedItemDto } from './dto/update-purchased-item.dto';
import { QueryPurchasedItemDto, MassUpdatePurchasedItemDto, ShareOrdersDto } from './dto/query-purchased-item.dto';

/**
 * Purchased Items Service
 *
 * Handles purchased items (HangKhoan) CRUD operations.
 * Converted from HangKhoan_LietKe.cs, HangKhoan_Them.cs, HangKhoan_MassUpdate.cs
 */
@Injectable()
export class PurchasedItemsService {
  private purchasedItemModel: typeof PurchasedItem;

  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {
    if (!sequelize.models.PurchasedItem) {
      PurchasedItemModel(sequelize);
    }
    this.purchasedItemModel = sequelize.models.PurchasedItem as typeof PurchasedItem;
  }

  /**
   * Find all purchased items with filters and pagination
   *
   * Converted from HangKhoan_LietKe.cs - LoadDanhSachDonHang()
   */
  async findAll(
    query: QueryPurchasedItemDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { website, username, status, search, maDatHang, page = 1, limit = 200 } = query;

    try {
      const offset = (page - 1) * limit;
      let whereClause = "WHERE HangKhoan = 1 AND DaXoa = 0";

      if (website) {
        whereClause += ` AND WebsiteName LIKE '%${website}%'`;
      }
      if (username) {
        whereClause += ` AND username LIKE '%${username}%'`;
      }
      if (status) {
        whereClause += ` AND trangThaiOrder IN (${status})`;
      }
      if (search) {
        whereClause += ` AND (ordernumber LIKE '%${search}%' OR username LIKE '%${search}%' OR MaSoHang LIKE '%${search}%')`;
      }
      if (maDatHang) {
        whereClause += ` AND ordernumber LIKE '%${maDatHang}%'`;
      }

      // Get total count
      const [countResult]: any[] = await this.sequelize.query(
        `SELECT COUNT(*) as total FROM dbo.DonHang ${whereClause}`
      );
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data
      const [data] = await this.sequelize.query(`
        SELECT * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY ID DESC) as RowNum, * FROM dbo.DonHang ${whereClause}
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
      console.error('Error in findAll:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Find purchased item by ID
   */
  async findOne(id: number): Promise<any> {
    const [result]: any[] = await this.sequelize.query(
      `EXEC SP_Lay_DonHangByID @ID=${id}`
    );

    if (!result || result.length === 0) {
      throw new NotFoundException(`Purchased item with ID ${id} not found`);
    }

    const item = result[0];
    if (!item.HangKhoan) {
      throw new NotFoundException(`Purchased item with ID ${id} not found`);
    }

    return item;
  }

  /**
   * Create new purchased item
   *
   * Converted from HangKhoan_LietKe.cs / HangKhoan_Them.cs - Insert logic
   */
  async create(createPurchasedItemDto: CreatePurchasedItemDto, nguoiTao = 'system'): Promise<any> {
    return this.createWithLogSource(createPurchasedItemDto, nguoiTao, 'HangKhoan_LietKe:ThemDatHangSimple');
  }

  async createFromList(createPurchasedItemDto: CreatePurchasedItemDto, nguoiTao = 'system'): Promise<any> {
    return this.createWithLogSource(createPurchasedItemDto, nguoiTao, 'HangKhoan_LietKe:ThemDatHangSimple');
  }

  async createFromCreatePage(createPurchasedItemDto: CreatePurchasedItemDto, nguoiTao = 'system'): Promise<any> {
    return this.createWithLogSource(createPurchasedItemDto, nguoiTao, 'HangKhoan_Them');
  }

  private async createWithLogSource(createPurchasedItemDto: CreatePurchasedItemDto, nguoiTao: string, nguon: string): Promise<any> {
    const [tyGiaResult]: any = await this.sequelize.query(`SELECT TOP 1 CAST(TyGia AS float) as tyGia FROM TY_GIA WHERE DaDong = 0`, { type: 'SELECT' as const });
    const tyGiaValue = tyGiaResult?.[0]?.tyGia || 23000;

    const [result] = await this.sequelize.query(
      `EXEC SP_Them_DonHang_Simple
        @WebsiteName = :websiteName,
        @username = :username,
        @usernamesave = :usernamesave,
        @linkweb = :linkweb,
        @linkhinh = :linkhinh,
        @corlor = :corlor,
        @size = :size,
        @soluong = :soluong,
        @dongiaweb = :dongiaweb,
        @loaitien = :loaitien,
        @ghichu = :ghichu,
        @tygia = :tygia,
        @saleoff = :saleoff,
        @HangKhoan = :hangKhoan,
        @LoaiHangID = :loaiHangID,
        @MaSoHang = :maSoHang,
        @QuocGiaID = :quocGiaID`,
      {
        replacements: {
          websiteName: createPurchasedItemDto.websiteName,
          username: createPurchasedItemDto.username,
          usernamesave: createPurchasedItemDto.username,
          linkweb: createPurchasedItemDto.linkWeb || '',
          linkhinh: createPurchasedItemDto.linkHinh || '',
          corlor: createPurchasedItemDto.color || '',
          size: createPurchasedItemDto.size || '',
          soluong: createPurchasedItemDto.soLuong || 1,
          dongiaweb: createPurchasedItemDto.donGiaWeb || 0,
          loaitien: createPurchasedItemDto.loaiTien || 'VND',
          ghichu: createPurchasedItemDto.ghiChu || '',
          tygia: tyGiaValue,
          saleoff: 0,
          hangKhoan: 1,
          loaiHangID: null,
          maSoHang: null,
          quocGiaID: null,
        },
        type: 'SELECT' as const,
      },
    );

    const noiDung = this.buildOrderLogContent({
      username: createPurchasedItemDto.username,
      linkWeb: createPurchasedItemDto.linkWeb || '',
      linkHinh: createPurchasedItemDto.linkHinh || '',
      color: createPurchasedItemDto.color || '',
      size: createPurchasedItemDto.size || '',
      soLuong: createPurchasedItemDto.soLuong || 1,
      donGiaWeb: createPurchasedItemDto.donGiaWeb || 0,
      loaiTien: createPurchasedItemDto.loaiTien || 'VND',
      ghiChu: createPurchasedItemDto.ghiChu || '',
      tyGia: tyGiaValue,
    });
    await this.logAction(
      nguoiTao,
      nguon,
      'Them moi',
      '',
      noiDung,
    );

    return result;
  }

  /**
   * Update purchased item
   *
   * Converted from HangKhoan_LietKe.cs - RowUpdating
   */
  async update(
    id: number,
    updatePurchasedItemDto: UpdatePurchasedItemDto,
    nguoiTao = 'system',
  ): Promise<any> {
    const item = await this.findOne(id);

    const [result] = await this.sequelize.query(`
      EXEC SP_CapNhatDonHangSimple
        @ID = ${id},
        @WebsiteName = '${updatePurchasedItemDto.websiteName || item.WebsiteName}',
        @Username = '${updatePurchasedItemDto.username || item.username}',
        @linkweb = '${updatePurchasedItemDto.linkWeb || item.linkWeb || ''}',
        @linkhinh = '${updatePurchasedItemDto.linkHinh || item.linkHinh || ''}',
        @color = '${updatePurchasedItemDto.color || item.color || ''}',
        @size = '${updatePurchasedItemDto.size || item.size || ''}',
        @soluong = ${updatePurchasedItemDto.soLuong || item.soLuong || 1},
        @dongiaweb = ${updatePurchasedItemDto.donGiaWeb || item.donGiaWeb || 0},
        @loaitien = '${updatePurchasedItemDto.loaiTien || item.loaiTien || 'VND'}',
        @ghichu = '${updatePurchasedItemDto.ghiChu || item.ghiChu || ''}'
    `);

    const noiDung = this.buildOrderLogContent({
      username: updatePurchasedItemDto.username || item.username,
      linkWeb: updatePurchasedItemDto.linkWeb || item.linkWeb || '',
      linkHinh: updatePurchasedItemDto.linkHinh || item.linkHinh || '',
      color: updatePurchasedItemDto.color || item.color || '',
      size: updatePurchasedItemDto.size || item.size || '',
      soLuong: updatePurchasedItemDto.soLuong || item.soLuong || 1,
      donGiaWeb: updatePurchasedItemDto.donGiaWeb || item.donGiaWeb || 0,
      loaiTien: updatePurchasedItemDto.loaiTien || item.loaiTien || 'VND',
      ghiChu: updatePurchasedItemDto.ghiChu || item.ghiChu || '',
      tyGia: 1,
    });
    await this.logAction(nguoiTao, 'HangKhoan_LietKe', 'Chinh sua', '', `ID: ${id}; ${noiDung}`);

    return result;
  }

  /**
   * Delete purchased item (soft delete)
   *
   * Converted from HangKhoan_LietKe.cs - lbtMassDelete_Click()
   */
  async remove(id: number): Promise<void> {
    await this.sequelize.query(
      `UPDATE dbo.DonHang SET DaXoa = 1 WHERE ID = ${id} AND HangKhoan = 1`
    );
  }

  /**
   * Mass delete purchased items
   */
  async massDelete(ids: number[]): Promise<{ deleted: number }> {
    const idList = ids.join(',');
    await this.sequelize.query(
      `UPDATE dbo.DonHang SET DaXoa = 1 WHERE ID IN (${idList}) AND HangKhoan = 1`
    );
    return { deleted: ids.length };
  }

  /**
   * Mass update purchased items
   *
   * Converted from HangKhoan_MassUpdate.cs - btShare_Click()
   */
  async massUpdate(massUpdateDto: MassUpdatePurchasedItemDto, nguoiTao = 'system'): Promise<{ updated: number }> {
    let updated = 0;

    for (const item of massUpdateDto.items) {
      try {
        const updateData: UpdatePurchasedItemDto = {
          websiteName: item.websiteName,
          username: item.username,
          linkWeb: item.linkWeb,
          linkHinh: item.linkHinh,
          color: item.color,
          size: item.size,
          soLuong: item.soLuong,
          donGiaWeb: item.donGiaWeb,
          ghiChu: item.ghiChu,
        };
        await this.update(item.id, updateData, nguoiTao);
        updated++;
      } catch (error) {
        console.error(`Failed to update purchased item ${item.id}:`, error);
      }
    }

    return { updated };
  }

  /**
   * Share orders (update with order number and totals)
   *
   * Converted from HangKhoan_MassUpdate.cs - btShare_Click()
   */
  async shareOrders(shareOrdersDto: ShareOrdersDto, nguoiTao = 'system'): Promise<{ success: boolean }> {
    const { ids, orderNumber, totalCharged, totalItem } = shareOrdersDto;

    try {
      // This would call the stored procedure ShareOrdersHangKhoan
      await this.sequelize.query(`
        EXEC SP_ShareOrdersHangKhoan
          @ID = '${ids}',
          @OrderNumber = '${orderNumber || ''}',
          @TotalCharged = ${totalCharged},
          @TotalItem = ${totalItem}
      `);

      await this.logAction(
        nguoiTao,
        'HangKhoan_MassUpdate:ShareOrdersHangKhoan',
        'Chinh sua',
        ids,
        `ID: ${ids}; OrderNumber: ${orderNumber || ''}; TotalCharged: ${totalCharged}; TotalItem: ${totalItem}`,
      );

      return { success: true };
    } catch (error) {
      console.error('Error in shareOrders:', error.message);
      return { success: false };
    }
  }

  /**
   * Generate order number
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dateStr}-${random}`;
  }

  private buildOrderLogContent(data: {
    username: string;
    linkWeb: string;
    linkHinh: string;
    color: string;
    size: string;
    soLuong: number;
    donGiaWeb: number;
    loaiTien: string;
    ghiChu: string;
    tyGia: number;
  }): string {
    return `username: ${data.username}; linkweb: ${data.linkWeb}; linkhinh: ${data.linkHinh}; corlor: ${data.color}; size: ${data.size}; soluong: ${data.soLuong}; dongiaweb: ${data.donGiaWeb}; saleoff: 0; phuthu: 0; shipUSA: 0; tax: 0; cong: 0; loaitien: ${data.loaiTien}; ghichu: ${data.ghiChu}; tygia: ${data.tyGia}`;
  }

  private async logAction(nguoiTao: string, nguon: string, hanhDong: string, doiTuong: string, noiDung: string): Promise<void> {
    try {
      await this.sequelize.query(
        `EXEC SP_Them_SystemLogs @NguoiTao = :nguoiTao, @Nguon = :nguon, @HanhDong = :hanhDong, @DoiTuong = :doiTuong, @NoiDung = :noiDung`,
        { replacements: { nguoiTao, nguon, hanhDong, doiTuong, noiDung } },
      );
    } catch (error) {
      console.error('Error logging purchased item action:', error.message);
    }
  }
}
