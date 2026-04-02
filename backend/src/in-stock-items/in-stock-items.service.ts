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
  async create(createInStockItemDto: CreateInStockItemDto): Promise<InStockItem> {
    return this.inStockItemModel.create({
      ...createInStockItemDto,
      giaTien: createInStockItemDto.giaTien || 0,
      soSao: createInStockItemDto.soSao || 0,
      thuTu: createInStockItemDto.thuTu || 0,
    } as any);
  }

  /**
   * Update in-stock item
   *
   * Converted from HangCoSan_Them.cs - btCapNhat_Click()
   */
  async update(
    id: number,
    updateInStockItemDto: UpdateInStockItemDto,
  ): Promise<InStockItem> {
    const inStockItem = await this.findOne(id);

    return inStockItem.update(updateInStockItemDto as any);
  }

  /**
   * Delete in-stock item
   *
   * Converted from HangCoSan_LietKe.cs - gvHangCoSan_RowDeleting()
   */
  async remove(id: number): Promise<void> {
    const inStockItem = await this.findOne(id);
    await inStockItem.destroy();
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
}
