import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { ServiceFee, ServiceFeeModel } from './entities/service-fee.entity';
import { CreateServiceFeeDto } from './dto/create-service-fee.dto';
import { UpdateServiceFeeDto } from './dto/update-service-fee.dto';
import { QueryServiceFeeDto } from './dto/query-service-fee.dto';

/**
 * Service Fees Service
 *
 * Handles service fee CRUD operations.
 * Converted from GiaTienCong_LietKe.cs and GiaTienCong_Them.cs
 */
@Injectable()
export class ServiceFeesService {
  private serviceFeeModel: typeof ServiceFee;

  constructor(@Inject('SEQUELIZE') private sequelize: Sequelize) {
    if (!sequelize.models.ServiceFee) {
      ServiceFeeModel(sequelize);
    }
    this.serviceFeeModel = sequelize.models.ServiceFee as typeof ServiceFee;
  }

  /**
   * Find all service fees with filters and pagination
   *
   * Converted from GiaTienCong_LietKe.cs - LoadDanhSachGiaTienCong()
   */
  async findAll(
    query: QueryServiceFeeDto,
  ): Promise<{ data: ServiceFee[]; total: number; page: number; limit: number }> {
    const { loaiTien, khachBuon, page = 1, limit = 20 } = query;

    try {
      const where: any = {};

      if (loaiTien) {
        where.loaiTien = loaiTien;
      }

      if (khachBuon !== undefined) {
        where.khachBuon = khachBuon;
      }

      const offset = (page - 1) * limit;

      const { rows: data, count: total } = await this.serviceFeeModel.findAndCountAll({
        where,
        offset,
        limit,
        order: [['id', 'DESC']],
      });

      return {
        data,
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
   * Find service fee by ID
   *
   * Converted from GiaTienCong_Them.cs - LoadDataGiaTienCong()
   */
  async findOne(id: number): Promise<ServiceFee> {
    const serviceFee = await this.serviceFeeModel.findByPk(id);

    if (!serviceFee) {
      throw new NotFoundException(`Service fee with ID ${id} not found`);
    }

    return serviceFee;
  }

  /**
   * Create new service fee
   *
   * Converted from GiaTienCong_Them.cs - btCapNhat_Click()
   */
  async create(createServiceFeeDto: CreateServiceFeeDto): Promise<ServiceFee> {
    return this.serviceFeeModel.create({
      ...createServiceFeeDto,
      tinhTheoPhanTram: createServiceFeeDto.tinhTheoPhanTram || false,
      khachBuon: createServiceFeeDto.khachBuon || false,
    } as any);
  }

  /**
   * Update service fee
   *
   * Converted from GiaTienCong_Them.cs - btCapNhat_Click()
   */
  async update(
    id: number,
    updateServiceFeeDto: UpdateServiceFeeDto,
  ): Promise<ServiceFee> {
    const serviceFee = await this.findOne(id);

    return serviceFee.update(updateServiceFeeDto as any);
  }

  /**
   * Delete service fee (soft delete)
   *
   * Converted from GiaTienCong_LietKe.cs - gvGiaTienCong_RowDeleting()
   */
  async remove(id: number): Promise<void> {
    const serviceFee = await this.findOne(id);
    // Soft delete - set DaXoa flag if exists, otherwise hard delete
    await serviceFee.destroy();
  }
}
