import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { InStockItem, InStockItemModel } from './entities/in-stock-item.entity';
import { CreateInStockItemDto } from './dto/create-in-stock-item.dto';
import { UpdateInStockItemDto } from './dto/update-in-stock-item.dto';
import { QueryInStockItemDto } from './dto/query-in-stock-item.dto';

/**
 * In-Stock Items Service
 *
 * Handles in-stock item CRUD operations.
 * Converted from HangCoSan_LietKe.cs and HangCoSan_Them.cs
 */
@Injectable()
export class InStockItemsService {
  private inStockItemModel: typeof InStockItem;

  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {
    if (!sequelize.models.InStockItem) {
      InStockItemModel(sequelize);
    }
    this.inStockItemModel = sequelize.models.InStockItem as typeof InStockItem;
  }

  /**
   * Find all in-stock items with filters and pagination
   *
   * Converted from HangCoSan_LietKe.cs - LoadDanhSachHangCoSan()
   */
  async findAll(
    query: QueryInStockItemDto,
  ): Promise<{ data: any; total: number; page: number; limit: number }> {
    const { search, page = 1, limit = 20 } = query;

    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';

      if (search) {
        whereClause += ` AND (TenHang LIKE '%${search}%' OR MaSoHang LIKE '%${search}%' OR NoiDungTimKiem LIKE '%${search}%')`;
      }

      // Get total count
      const [countResult]: any[] = await this.sequelize.query(
        `SELECT COUNT(*) as total FROM dbo.HangCoSan ${whereClause}`
      );
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data
      const [data] = await this.sequelize.query(`
        SELECT * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY ID DESC) as RowNum, * FROM dbo.HangCoSan ${whereClause}
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
   * Find in-stock item by ID
   *
   * Converted from HangCoSan_Them.cs - LoadDataHangCoSan()
   */
  async findOne(id: number): Promise<InStockItem> {
    const inStockItem = await this.inStockItemModel.findByPk(id);

    if (!inStockItem) {
      throw new NotFoundException(`In-stock item with ID ${id} not found`);
    }

    return inStockItem;
  }

  /**
   * Create new in-stock item
   *
   * Converted from HangCoSan_Them.cs - btCapNhat_Click()
   */
  async create(createInStockItemDto: CreateInStockItemDto, nguoiTao = 'system'): Promise<InStockItem> {
    const item = await this.inStockItemModel.create({
      ...createInStockItemDto,
      giaTien: createInStockItemDto.giaTien || 0,
      soSao: createInStockItemDto.soSao || 0,
      thuTu: createInStockItemDto.thuTu || 0,
    } as any);

    await this.logAction(
      nguoiTao,
      'HangCoSan_Them:ThemHangCoSan',
      'Them moi',
      '',
      `TenHinh: ${createInStockItemDto.tenHinh || ''}; TenHang: ${createInStockItemDto.tenHang}; GiaTien: ${createInStockItemDto.giaTien || 0}; MoTa: ${createInStockItemDto.moTa || ''}; SoSao: ${createInStockItemDto.soSao || 0}; ThuTu: ${createInStockItemDto.thuTu || 0}`,
    );

    return item;
  }

  /**
   * Update in-stock item
   *
   * Converted from HangCoSan_Them.cs - btCapNhat_Click()
   */
  async update(
    id: number,
    updateInStockItemDto: UpdateInStockItemDto,
    nguoiTao = 'system',
  ): Promise<InStockItem> {
    const inStockItem = await this.findOne(id);
    const updatedItem = await inStockItem.update(updateInStockItemDto as any);

    await this.logAction(
      nguoiTao,
      'HangCoSan_Them:CapNhatHangCoSan',
      'Chinh sua',
      String(id),
      `ID: ${id}; TenHinh: ${updateInStockItemDto.tenHinh || ''}; TenHang: ${updateInStockItemDto.tenHang || ''}; GiaTien: ${updateInStockItemDto.giaTien || 0}; MoTa: ${updateInStockItemDto.moTa || ''}; SoSao: ${updateInStockItemDto.soSao || 0}; ThuTu: ${updateInStockItemDto.thuTu || 0}`,
    );

    return updatedItem;
  }

  /**
   * Delete in-stock item
   *
   * Converted from HangCoSan_LietKe.cs - gvHangCoSan_RowDeleting()
   */
  async remove(id: number, nguoiTao = 'system'): Promise<void> {
    const inStockItem = await this.findOne(id);
    await inStockItem.destroy();

    await this.logAction(nguoiTao, 'HangCoSan_LietKe:XoaHangCoSan', 'Xoa', String(id), `ID: ${id}`);
  }

  /**
   * Update image filename
   *
   * Converted from HangCoSan_Them.cs - btThayDoiHinhAnh_Click()
   */
  async updateImage(id: number, tenHinh: string): Promise<InStockItem> {
    const inStockItem = await this.findOne(id);
    return inStockItem.update({ tenHinh });
  }

  private async logAction(nguoiTao: string, nguon: string, hanhDong: string, doiTuong: string, noiDung: string): Promise<void> {
    try {
      await this.sequelize.query(
        `EXEC SP_Them_SystemLogs @NguoiTao = :nguoiTao, @Nguon = :nguon, @HanhDong = :hanhDong, @DoiTuong = :doiTuong, @NoiDung = :noiDung`,
        { replacements: { nguoiTao, nguon, hanhDong, doiTuong, noiDung } },
      );
    } catch (error) {
      console.error('Error logging in-stock item action:', error.message);
    }
  }
}
