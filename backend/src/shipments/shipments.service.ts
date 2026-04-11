import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Shipment, ShipmentModel } from './entities/shipment.entity';
import { Order, OrderModel } from '../orders/entities/order.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { QueryShipmentDto } from './dto/query-shipment.dto';

/**
 * Shipments Service
 *
 * Handles shipment CRUD operations using Sequelize.
 */
@Injectable()
export class ShipmentsService {
  private shipmentModel: typeof Shipment;
  private orderModel: typeof Order;

  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {
    if (!sequelize.models.Shipment) {
      ShipmentModel(sequelize);
    }
    if (!sequelize.models.Order) {
      OrderModel(sequelize);
    }
    this.shipmentModel = sequelize.models.Shipment as typeof Shipment;
    this.orderModel = sequelize.models.Order as typeof Order;
  }

  /**
   * Generate TenDotHang
   * Format: "DD-MM-YYYY_Username"
   */
  private generateTenDotHang(username: string): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}_${username}`;
  }

  /**
   * Calculate shipment totals
   */
  private calculateTotals(shipmentData: Partial<Shipment>): Partial<Shipment> {
    const tyGia = shipmentData.tyGia || 1;

    if (shipmentData.phiShipVeVnUsd && tyGia) {
      shipmentData.phiShipVeVnVnd = Number(shipmentData.phiShipVeVnUsd) * Number(tyGia);
    }

    if (shipmentData.tienHangUsd && tyGia) {
      shipmentData.tienHangVnd = Number(shipmentData.tienHangUsd) * Number(tyGia);
    }

    return shipmentData;
  }

  /**
   * Create a new shipment
   */
  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    if (!createShipmentDto.tenDotHang) {
      createShipmentDto.tenDotHang = this.generateTenDotHang(createShipmentDto.username);
    }

    createShipmentDto.yeuCauGuiHang = createShipmentDto.yeuCauGuiHang || 0;
    createShipmentDto.isCompleted = createShipmentDto.isCompleted || false;
    createShipmentDto.ngayTao = createShipmentDto.ngayTao || new Date().toISOString();

    const shipmentData = this.calculateTotals(createShipmentDto as Partial<Shipment>);
    return this.shipmentModel.create(shipmentData as any);
  }

  /**
   * Find all shipments with filters and pagination
   */
  async findAll(
    query: QueryShipmentDto,
  ): Promise<{ data: Shipment[]; total: number; page: number; limit: number }> {
    const {
      tenDotHang,
      username,
      maDatHang,
      includeCompleted = false,
      page = 1,
      limit = 20,
    } = query;

    const where: any = {};
    if (tenDotHang) where.tenDotHang = { [Op.like]: `%${tenDotHang}%` };
    if (username) where.username = { [Op.like]: `%${username}%` };
    if (maDatHang) where.maDatHang = { [Op.like]: `%${maDatHang}%` };
    if (!includeCompleted) where.isCompleted = false;

    const offset = (page - 1) * limit;
    const { rows: data, count: total } = await this.shipmentModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [['ID', 'DESC']],
    });

    return { data, total, page, limit };
  }

  /**
   * Find shipment by ID
   */
  async findOne(id: number): Promise<Shipment> {
    const shipment = await this.shipmentModel.findByPk(id);

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    return shipment;
  }

  /**
   * Update shipment
   */
  async update(id: number, updateShipmentDto: UpdateShipmentDto): Promise<Shipment> {
    const shipment = await this.findOne(id);

    const convertedData: Partial<Shipment> = {
      ...updateShipmentDto,
      ngayGuiHang: updateShipmentDto.ngayGuiHang
        ? new Date(updateShipmentDto.ngayGuiHang)
        : undefined,
      ngayTao: updateShipmentDto.ngayTao ? new Date(updateShipmentDto.ngayTao) : undefined,
    };

    const shipmentData = this.calculateTotals({ ...shipment.toJSON(), ...convertedData });

    return shipment.update(shipmentData);
  }

  /**
   * Delete shipment (hard delete)
   */
  async remove(id: number): Promise<void> {
    const shipment = await this.findOne(id);
    await shipment.destroy();
  }

  /**
   * Get orders in this shipment
   */
  async getOrders(shipmentId: number): Promise<Order[]> {
    const shipment = await this.findOne(shipmentId);

    return this.orderModel.findAll({
      where: { tenDotHang: shipment.tenDotHang },
      order: [['ID', 'ASC']],
    });
  }

  /**
   * Mark shipment as completed
   */
  async complete(id: number): Promise<Shipment> {
    const shipment = await this.findOne(id);
    return shipment.update({ isCompleted: true });
  }

  /**
   * Get shipment batches for shipping request list (YeuCauShipHang_LietKe.aspx)
   * Matches: YeuCauShipHang_LietKe.cs -> Page_Load -> bLL.LayDotHangYeuCauShip(username, yeuCauGuiHang)
   * Uses: SP_Lay_DotHangShip @username, @YeuCauGuiHang
   * Called twice: YeuCauGuiHang=0 (chờ ship) and YeuCauGuiHang=1 (đang yêu cầu)
   */
  async getDotHangShip(username: string, yeuCauGuiHang: number): Promise<any[]> {
    try {
      const [results] = await this.sequelize.query(
        `EXEC SP_Lay_DotHangShip
          @username = :username,
          @YeuCauGuiHang = :yeuCauGuiHang`,
        { replacements: { username, yeuCauGuiHang }, type: 'SELECT' as const },
      );
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error('Error in getDotHangShip:', (error as any).message);
      return [];
    }
  }

  /**
   * Update shipping request for a batch (YeuCauShipHang_LietKe.aspx - btShip_Click)
   * Matches: YeuCauShipHang_LietKe.cs -> btShip_Click -> bLL.CapNhatYeuCauShipHang(tenDotHang, username, ghiChu)
   * Uses: SP_CapNhat_YeuCauShipHang @TenDotHang, @UserName, @YeuCauGui_GhiChu
   */
  async capNhatYeuCauShipHang(tenDotHang: string, username: string, yeuCauGuiGhiChu: string = ''): Promise<{ success: boolean }> {
    try {
      await this.sequelize.query(
        `EXEC SP_CapNhat_YeuCauShipHang
          @TenDotHang = :tenDotHang,
          @UserName = :username,
          @YeuCauGui_GhiChu = :yeuCauGuiGhiChu`,
        { replacements: { tenDotHang, username, yeuCauGuiGhiChu } },
      );
      return { success: true };
    } catch (error) {
      console.error('Error in capNhatYeuCauShipHang:', (error as any).message);
      return { success: false };
    }
  }

  /**
   * Get shipping info by ID (ThongTinShipHang.aspx)
   * Matches: ThongTinShipHang.cs -> Page_Load -> dBConnect.LayThongTinShipByID(id)
   * Uses: SP_Lay_ThongTinShipByID @ID
   */
  async getThongTinShipByID(id: number): Promise<any> {
    try {
      const [results] = await this.sequelize.query(
        `EXEC SP_Lay_ThongTinShipByID @ID = :id`,
        { replacements: { id }, type: 'SELECT' as const },
      );
      const data = Array.isArray(results) ? results : [];
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('Error in getThongTinShipByID:', (error as any).message);
      return null;
    }
  }
}

// Import Op for Sequelize operators
import { Op } from 'sequelize';
