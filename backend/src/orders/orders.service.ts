import { Injectable, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Op } from 'sequelize';
import { Order, OrderModel, OrderStatus } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { CreateQuickOrderDto, CreateQuickOrdersDto } from './dto/create-quick-order.dto';
import { MassUpdateDto, MassDeleteDto, MassCompleteDto, MassReceivedDto, MassShippedDto } from './dto/mass-update.dto';
import { UpdateOrderNoteDto } from './dto/update-order-note.dto';
import { UpdateReturnDateDto } from './dto/update-return-date.dto';
import { ImportOrdersDto } from './dto/import-orders.dto';
import { QueryQLDatHangDto, QLDatHangResponseDto } from './dto/query-qldathang.dto';
import { SystemLogsService } from '../system-logs/system-logs.service';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

/**
 * Orders Service
 *
 * Handles order CRUD operations and business logic using Sequelize.
 */
@Injectable()
export class OrdersService {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'imgLink');

  /**
   * Upload and resize image to 640x480 for EditOrderDetail
   * Converted from: EditOrderDetail.cs - fuHinhAnh upload logic
   *
   * Saves to: /imgLink/YYYYMM/ directory
   * Uses UUID for filename like old code
   */
  async uploadImage(orderId: number, file: any): Promise<{ linkHinh: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', ''); // YYYYMM
    const targetDir = path.join(this.uploadDir, yearMonth);

    // Create directory if not exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Use UUID for filename like old code (ASP.NET)
    const ext = path.extname(file.originalname || '.jpg').toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    const filepath = path.join(targetDir, filename);

    // Resize to 640x480 using sharp, then save
    await sharp(file.buffer)
      .resize(640, 480, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .toFile(filepath);

    const linkHinh = `/imgLink/${yearMonth}/${filename}`;
    return { linkHinh };
  }
  private orderModel: typeof Order;

  constructor(
    @Inject('SEQUELIZE') private sequelize: Sequelize,
    private readonly systemLogsService: SystemLogsService,
  ) {
    if (!sequelize.models.Order) {
      OrderModel(sequelize);
    }
    this.orderModel = sequelize.models.Order as typeof Order;
  }

  /**
   * Generate order number
   * Format: ORD-{YYYYMMDD}-{Random4Digits}
   */
  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${dateStr}-${random}`;
  }

  /**
   * Calculate order totals
   */
  private calculateTotals(orderData: Partial<Order>): Partial<Order> {
    const tyGia = orderData.tyGia || 1;

    if (orderData.giaSauOffUsd && tyGia) {
      orderData.giaSauOffVnd = Number(orderData.giaSauOffUsd) * Number(tyGia);
    }

    if (orderData.tienCongUsd && tyGia) {
      orderData.tienCongVnd = Number(orderData.tienCongUsd) * Number(tyGia);
    }

    if (orderData.tongTienUsd && tyGia) {
      orderData.tongTienVnd = Number(orderData.tongTienUsd) * Number(tyGia);
    }

    return orderData;
  }

  /**
   * Create a new order
   */
  async create(createOrderDto: CreateOrderDto, nguoiTao?: string): Promise<Order> {
    if (!createOrderDto.orderNumber) {
      createOrderDto.orderNumber = this.generateOrderNumber();
    }

    createOrderDto.ngaySaveLink = createOrderDto.ngaySaveLink || new Date().toISOString();
    createOrderDto.loaiTien = createOrderDto.loaiTien || 'USD';
    createOrderDto.trangThaiOrder = createOrderDto.trangThaiOrder || OrderStatus.RECEIVED;
    createOrderDto.soLuong = createOrderDto.soLuong || 1;
    createOrderDto.donGiaWeb = createOrderDto.donGiaWeb || 0;
    createOrderDto.tax = createOrderDto.tax || 0;
    createOrderDto.yeuCauGuiHang = createOrderDto.yeuCauGuiHang || 0;
    createOrderDto.daQuaHanMuc = createOrderDto.daQuaHanMuc || false;
    createOrderDto.laKhachVip = createOrderDto.laKhachVip || false;
    createOrderDto.hangKhoan = createOrderDto.hangKhoan || false;

    if (nguoiTao) {
      createOrderDto.nguoiTao = nguoiTao;
    }

    const orderData = this.calculateTotals(createOrderDto as Partial<Order>);
    return this.orderModel.create(orderData as any);
  }

  /**
   * Create quick order WITH auto-calculation (QLDatHang_Them)
   * Converted from: QLDatHang_Them.cs - ThemDatHangSimpleCoTamTinh
   * Uses stored procedure: SP_Them_DonHang_Simple_CoTamTinh
   *
   * Calculates:
   * - giaSauOffUsd = donGiaWeb * soLuong * (1 - saleOff/100)
   * - tienCongVnd = depends on GiaTienCong (percentage or fixed per item)
   * - tongTienUsd = giaSauOffUsd * (1 + tax/100) + (shipUsa + phuThu) * soLuong
   * - tongTienVnd = tongTienUsd * tyGia + tienCongVnd
   */
  async createQuickOrderCoTamTinh(createQuickOrderDto: CreateQuickOrderDto): Promise<{ success: boolean; error?: string; tienCongVnd?: number; tongTienVnd?: number }> {
    try {
      const {
        websiteName = '',
        username = '',
        usernameSave = '',
        linkWeb,
        linkHinh = '',
        color = '',
        size = '',
        soLuong,
        donGiaWeb = 0,
        loaiTien = 'USD',
        ghiChu = '',
        tyGia = 1,
        saleOff = 0,
        hangKhoan = false,
        loaiHangId,
        maSoHang = '',
        quocGiaId,
        nguoiTao = '',
        cong = 0,
        shipUsa = 0,
        tax = 0,
        phuThu = 0,
      } = createQuickOrderDto;

      await this.sequelize.query(
        `EXEC dbo.SP_Them_DonHang_Simple_CoTamTinh
          @WebsiteName = :websiteName,
          @username = :username,
          @usernamesave = :usernameSave,
          @linkweb = :linkweb,
          @linkhinh = :linkhinh,
          @corlor = :corlor,
          @size = :size,
          @soluong = :soLuong,
          @dongiaweb = :donGiaWeb,
          @loaitien = :loaitien,
          @ghichu = :ghiChu,
          @tygia = :tyGia,
          @saleoff = :saleOff,
          @HangKhoan = :hangKhoan,
          @cong = :cong,
          @shipUSA = :shipUsa,
          @tax = :tax,
          @phuthu = :phuThu,
          @QuocGiaID = :quocGiaId`,
        {
          replacements: {
            websiteName: websiteName.replace(/'/g, "''"),
            username: username.replace(/'/g, "''"),
            usernameSave: usernameSave.replace(/'/g, "''"),
            linkweb: linkWeb.replace(/'/g, "''"),
            linkhinh: linkHinh.replace(/'/g, "''"),
            corlor: color.replace(/'/g, "''"),
            size: size.replace(/'/g, "''"),
            soLuong,
            donGiaWeb,
            loaitien: loaiTien,
            ghiChu: ghiChu.replace(/'/g, "''"),
            tyGia,
            saleOff,
            hangKhoan: hangKhoan ? 1 : 0,
            cong,
            shipUsa: shipUsa || null,
            tax,
            phuThu,
            quocGiaId: quocGiaId || null,
          },
          type: QueryTypes.RAW,
        },
      );

      // Log to system logs (giống QLDatHang_Them.cs)
      if (nguoiTao) {
        const noiDung = [
          `username: ${username}`,
          `linkweb: ${linkWeb}`,
          `linkhinh: ${linkHinh}`,
          `corlor: ${color}`,
          `size: ${size}`,
          `soluong: ${soLuong}`,
          `dongiaweb: ${donGiaWeb}`,
          `loaitien: ${loaiTien}`,
          `tygia: ${tyGia}`,
          `saleoff: ${saleOff}`,
          `cong: ${cong}`,
          `shipUSA: ${shipUsa}`,
          `tax: ${tax}`,
          `phuthu: ${phuThu}`,
        ].join('; ');

        await this.systemLogsService.create({
          nguoiTao,
          nguon: 'QLDatHang_Them:ThemDatHangSimpleCoTamTinh',
          hanhDong: 'Them moi',
          doiTuong: '',
          noiDung,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('createQuickOrderCoTamTinh error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upload and resize image for QLDatHang_Them (footer form)
   * Converted from: QLDatHang_Them.cs - fuHinhAnh upload logic
   * Saves to: /imgLink/YYYYMM/ directory, resizes to 640x480
   */
  async uploadQuickOrderImage(file: any): Promise<{ linkHinh: string }> {
    return this.uploadImage(0, file);
  }

  /**
   * Calculate service fee (GiaTienCong) for QLDatHang_Them
   * Converted from: QLDatHang_Them.cs - giaTienCong calculation
   *
   * If percentage-based: tienCongVnd = giaSauOffUsd * cong/100 * tyGia
   * If fixed: tienCongVnd = TienCong1Mon * soLuong
   */
  async calculateTienCong(params: {
    loaiTien: string;
    donGiaWeb: number;
    soLuong: number;
    saleOff: number;
    cong: number;
    tyGia: number;
    username: string;
  }): Promise<{ tienCongVnd: number; giaSauOffUsd: number; tongTienUsd: number; tongTienVnd: number }> {
    const { loaiTien, donGiaWeb, soLuong, saleOff, cong, tyGia, username } = params;

    // Calculate giaSauOffUsd = (100 - saleOff) / 100 * donGiaWeb * soLuong
    const giaSauOffUsd = ((100 - saleOff) / 100) * donGiaWeb * soLuong;

    // Get GiaTienCong
    const giaTienCong = await this.getGiaTienCong(loaiTien, donGiaWeb, username);
    let tienCongVnd: number;

    if (giaTienCong.tinhTheoPhanTram) {
      // tienCongVnd = giaSauOffUsd * cong/100 * tyGia
      tienCongVnd = giaSauOffUsd * cong / 100 * tyGia;
    } else {
      // tienCongVnd = TienCong1Mon * soLuong
      tienCongVnd = giaTienCong.tienCong1Mon * soLuong;
    }

    // Calculate tongTienUsd = giaSauOffUsd * (1 + tax/100)
    // Note: shipUsa and phuThu per item added in backend SP
    const tongTienUsd = giaSauOffUsd; // shipUSA and phuThu added in SP

    // Calculate tongTienVnd = tongTienUsd * tyGia + tienCongVnd
    const tongTienVnd = Math.ceil(giaSauOffUsd * tyGia + tienCongVnd);

    return { tienCongVnd, giaSauOffUsd, tongTienUsd, tongTienVnd };
  }
  async createQuickOrder(createQuickOrderDto: CreateQuickOrderDto): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        websiteName = '',
        username = '',
        usernameSave = '',
        linkWeb,
        linkHinh = '',
        color = '',
        size = '',
        soLuong,
        donGiaWeb = 0,
        loaiTien = 'USD',
        ghiChu = '',
        tyGia = 1,
        saleOff = 0,
        hangKhoan = false,
        loaiHangId,
        maSoHang = '',
        quocGiaId,
        nguoiTao = '',
      } = createQuickOrderDto;

      await this.sequelize.query(
        `EXEC dbo.SP_Them_DonHang_Simple
          @WebsiteName = :websiteName,
          @username = :username,
          @usernamesave = :usernameSave,
          @linkweb = :linkweb,
          @linkhinh = :linkhinh,
          @corlor = :color,
          @size = :size,
          @soluong = :soLuong,
          @dongiaweb = :donGiaWeb,
          @loaitien = :loaiTien,
          @ghichu = :ghiChu,
          @tygia = :tyGia,
          @saleoff = :saleOff,
          @HangKhoan = :hangKhoan,
          @LoaiHangID = :loaiHangId,
          @MaSoHang = :maSoHang,
          @QuocGiaID = :quocGiaId`,
        {
          replacements: {
            websiteName: websiteName.replace(/'/g, "''"),
            username: username.replace(/'/g, "''"),
            usernameSave: usernameSave.replace(/'/g, "''"),
            linkweb: linkWeb.replace(/'/g, "''"),
            linkhinh: linkHinh.replace(/'/g, "''"),
            color: color.replace(/'/g, "''"),
            size: size.replace(/'/g, "''"),
            soLuong,
            donGiaWeb,
            loaiTien,
            ghiChu: ghiChu.replace(/'/g, "''"),
            tyGia,
            saleOff,
            hangKhoan: hangKhoan ? 1 : 0,
            loaiHangId: loaiHangId || null,
            maSoHang: maSoHang,
            quocGiaId: quocGiaId || null,
          },
          type: QueryTypes.RAW,
        },
      );

      // Log to system logs (giống DatHangM.aspx - ThemDatHangSimple)
      if (nguoiTao) {
        const noiDung = [
          `username: ${username}`,
          `linkweb: ${linkWeb}`,
          `linkhinh: ${linkHinh}`,
          `corlor: ${color}`,
          `size: ${size}`,
          `soluong: ${soLuong}`,
          `dongiaweb: ${donGiaWeb}`,
          `loaitien: ${loaiTien}`,
          `tygia: ${tyGia}`,
          `saleoff: ${saleOff}`,
        ].join('; ');

        await this.systemLogsService.create({
          nguoiTao,
          nguon: 'DatHangM:ThemDatHangSimple',
          hanhDong: 'Them moi',
          doiTuong: '',
          noiDung,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('createQuickOrder error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create multiple quick orders at once
   * Converted from: DatHangM.aspx - GuiYeuCau (loop through items)
   */
  async createQuickOrders(createQuickOrdersDto: CreateQuickOrdersDto, nguoiTao?: string): Promise<{ success: number; failed: number; errors: string[] }> {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];
    const actorUsername = nguoiTao || '';

    for (const order of createQuickOrdersDto.orders) {
      const result = await this.createQuickOrder({
        ...order,
        username: order.username || actorUsername,
        usernameSave: actorUsername || order.usernameSave,
        nguoiTao: actorUsername,
      });
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
        errors.push(result.error || 'Unknown error');
      }
    }

    return { success: successCount, failed: failedCount, errors };
  }

  /**
   * Find all orders with filters and pagination
   * Uses SP_Lay_DonHang stored procedure (matching C# DBConnect.LayDanhSachDonHang)
   */
  async findAll(query: QueryOrderDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { website, username, status, statuses, search, startDate, endDate, page = 1, limit = 20, includeDeleted = false, quocGiaId, ids } = query;

    // Cap limit to 500 max to match @Max(500) validation
    const safeLimit = Math.min(limit, 500);

    try {
      // Build status string for SP (e.g., "'Received','Confirmed'")
      let trangthaiOrder = '';
      if (statuses && statuses.length > 0) {
        trangthaiOrder = statuses.map(s => `'${s}'`).join(',');
      } else if (status) {
        trangthaiOrder = `'${status}'`;
      }

      // Execute stored procedure matching C# DBConnect.LayDanhSachDonHang
      const results = await this.sequelize.query(
        `EXEC SP_Lay_DonHang
          @WebsiteName = :website,
          @username = :username,
          @trangthaiOrder = :trangthaiOrder,
          @NoiDungTim = :search,
          @TimTheo = -1,
          @MaDatHang = '',
          @TenDotHang = '',
          @HangKhoan = 0,
          @QuocGiaID = :quocGiaId,
          @PageSize = :limit,
          @PageNum = :page,
          @DaXoa = :includeDeleted,
          @TuNgay = :startDate,
          @DenNgay = :endDate`,
        {
          replacements: {
            website: website || '',
            username: username || '',
            trangthaiOrder,
            search: search || '',
            quocGiaId: quocGiaId || -1,
            limit: safeLimit,
            page,
            includeDeleted: includeDeleted,
            startDate: startDate || '',
            endDate: endDate || '',
          },
          type: 'SELECT' as const,
        },
      );

      // SP returns multiple result sets: [count, data, ...]
      const data = Array.isArray(results) ? results : [];

      // Extract total from first result (SP returns total count in first table)
      const firstItem = data.length > 0 ? data[0] as any : null;
      const total = firstItem?.TotalCount ? Number(firstItem.TotalCount) : (firstItem?.Total ? Number(firstItem.Total) : data.length);

      // Map SQL column names to camelCase for frontend (matching existing mapping)
      const mappedData = (data.slice(1) || []).map((row: any) => ({
        id: row.ID,
        orderNumber: row.ordernumber,
        username: row.username,
        usernameSave: row.usernamesave,
        linkWeb: row.linkweb,
        linkHinh: row.linkhinh,
        color: row.corlor,
        size: row.size,
        soLuong: row.soluong,
        donGiaWeb: row.dongiaweb,
        saleOff: row.saleoff,
        phuThu: row.phuthu,
        shipUsa: row.shipusa,
        tax: row.tax,
        cong: row.cong,
        loaiTien: row.loaitien,
        ghiChu: row.ghichu,
        tyGia: row.tygia,
        giaSauOffUsd: row.giasauoffusd,
        giaSauOffVnd: row.giasauoffvnd,
        tienCongUsd: row.tiencongusd,
        tienCongVnd: row.tiencongvnd,
        tongTienUsd: row.tongtienusd,
        tongTienVnd: row.tongtienvnd,
        trangThaiOrder: row.trangthaiOrder,
        adminNote: row.adminnote,
        ngayVeVn: row.ngayveVN,
        ngaySaveLink: row.ngaySaveLink || row.ngaySave || row.ngaySaveLinkDate || null,
        ngayMuaHang: row.ngaymuahang || row.ngayMuaHang || row.NgayMuaHang || null,
        namTaiChinh: row.namTaiChinh,
        websiteName: row.WebsiteName,
        tenDotHang: row.tenDotHang,
        yeuCauGuiHang: row.yeuCauGuiHang,
        daQuaHanMuc: row.DaQuaHanMuc,
        laKhachVip: row.LaKhachVip,
        ngayYeuCauGuiHang: row.ngayYeuCauGuiHang,
        yeuCauGuiGhiChu: row.yeuCauGuiGhiChu,
        guiHangSoKg: row.guiHangSoKg,
        guiHangTien: row.guiHangTien,
        loaiHangId: row.LoaiHangID,
        tenLoaiHang: row.TenLoaiHang,
        canHangSoKg: row.CanHang_SoKg,
        canHangTienShipVeVn: row.CanHang_TienShipVeVN,
        canHangTienShipTrongNuoc: row.CanHang_TienShipTrongNuoc,
        hangKhoan: row.hangKhoan,
        maSoHang: row.MaSoHang,
        quocGiaId: row.QuocGiaID,
        tenQuocGia: row.TenQuocGia,
        linkTaiKhoanMang: row.linkTaiKhoanMang,
        vungMien: row.vungMien,
        nguoiTao: row.nguoiTao,
        isDeleted: row.DaXoa,
      }));

      return {
        data: mappedData,
        total,
        page,
        limit: safeLimit,
      };
    } catch (error: any) {
      console.error('Error in findAll (SP_Lay_DonHang):', error?.message || error);
      return {
        data: [],
        total: 0,
        page,
        limit: safeLimit,
      };
    }
  }

  /**
   * Find order by ID using stored procedure
   */
  async findOne(id: number, includeDeleted = false): Promise<any> {
    try {
      const [result]: any[] = await this.sequelize.query(
        `EXEC SP_Lay_DonHangByID @ID=${id}`
      );

      if (!result || result.length === 0) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      const order = result[0];

      if (!includeDeleted && order.DaXoa) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      return order;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error in findOne:', error.message);
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
  }

  /**
   * Get orders for QLDatHang_LietKe (Order Management List)
   * Converted from: QLDatHang_LietKe.cs - LoadDanhSachDonHang()
   *
   * Default filters:
   * - status = 'Received' (hardcoded like C#)
   * - DaXoa = 0 (not deleted)
   * - pageSize = 2000
   * - order by ID DESC
   *
   * @param query - Query parameters matching QLDatHang_LietKe filters
   * @returns QLDatHangResponseDto - { totalItem, danhSachDonHang, page, limit }
   */
  async getQLDatHangList(query: QueryQLDatHangDto): Promise<QLDatHangResponseDto> {
    const {
      website,
      username,
      status,
      statuses,
      search,
      ids,
      quocGiaId,
      startDate,
      endDate,
      page = 1,
      limit = 2000,
      daXoa = 0,
    } = query;

    try {
      const allowedStatuses = new Set(Object.values(OrderStatus));
      const buildStatusFilter = (values: string[]) =>
        values.filter((value) => allowedStatuses.has(value as OrderStatus)).map((value) => `'${value}'`).join(',');
      let trangthaiOrder = "'Received'";

      if (Array.isArray(statuses)) {
        trangthaiOrder = buildStatusFilter(statuses);
      } else if (status) {
        trangthaiOrder = buildStatusFilter([status]);
      }

      // Gọi stored procedure SP_Lay_DonHang giống C# DBConnect.LayDanhSachDonHang()
      const results = await this.sequelize.query(
        `EXEC dbo.SP_Lay_DonHang
          @WebsiteName = :website,
          @username = :username,
          @trangthaiOrder = :trangthaiOrder,
          @NoiDungTim = :NoiDungTim,
          @TimTheo = -1,
          @MaDatHang = :MaDatHang,
          @TenDotHang = '',
          @HangKhoan = -1,
          @QuocGiaID = :QuocGiaID,
          @DaXoa = :DaXoa,
          @TuNgay = :TuNgay,
          @DenNgay = :DenNgay,
          @PageSize = :PageSize,
          @PageNum = :PageNum`,
        {
          replacements: {
            website: website || '',
            username: username || '',
            trangthaiOrder,
            NoiDungTim: search || '',
            MaDatHang: ids || '',
            QuocGiaID: quocGiaId && quocGiaId > 0 ? quocGiaId : -1,
            DaXoa: daXoa,
            TuNgay: startDate || '',
            DenNgay: endDate || '',
            PageSize: limit,
            PageNum: page,
          },
          type: QueryTypes.SELECT,
        }
      );

      // SP_Lay_DonHang trả về: [ { TOTALROW: 50 }, [{row1}, {row2}, ...] ]
      const resultsAny = results as any;
      const totalItem = resultsAny[0]?.TOTALROW || 0;
      const rawData = resultsAny.slice(1) || [];

      // Map data to match Order interface
      const danhSachDonHang = rawData.map((row: any) => ({
        id: row.ID,
        orderNumber: row.ordernumber,
        username: row.username,
        usernameSave: row.usernamesave,
        linkWeb: row.linkweb,
        linkHinh: row.linkhinh,
        color: row.corlor,
        size: row.size,
        soLuong: row.soluong,
        donGiaWeb: row.dongiaweb,
        saleOff: row.saleoff,
        phuThu: row.phuthu,
        shipUsa: row.shipUSA,
        tax: row.tax,
        cong: row.cong,
        loaiTien: row.loaitien,
        ghiChu: row.ghichu,
        tyGia: row.tygia,
        giaSauOffUsd: row.giasauoffUSD,
        giaSauOffVnd: row.giasauoffVND,
        tienCongUsd: row.tiencongUSD,
        tienCongVnd: row.tiencongVND,
        tongTienUsd: row.tongtienUSD,
        tongTienVnd: row.tongtienVND,
        trangThaiOrder: row.trangthaiOrder,
        adminNote: row.AdminNote,
        ngayVeVn: row.ngayveVN,
        ngaySaveLink: row.ngaysaveLink,
        ngayMuaHang: row.ngaymuahang,
        namTaiChinh: row.nam_taichinh,
        websiteName: row.WebsiteName,
        tenDotHang: row.TenDotHang,
        yeuCauGuiHang: row.YeuCauGuiHang,
        daQuaHanMuc: row.DaQuaHanMuc,
        laKhachVip: row.LaKhachVip,
        ngayYeuCauGuiHang: row.NgayYeuCauGuiHang,
        yeuCauGuiGhiChu: row.YeuCauGui_GhiChu,
        guiHangSoKg: row.GuiHang_SoKg,
        guiHangTien: row.GuiHang_Tien,
        loaiHangId: row.LoaiHangID,
        tenLoaiHang: row.TenLoaiHang,
        canHangSoKg: row.CanHang_SoKg,
        canHangTienShipVeVn: row.CanHang_TienShipVeVN,
        canHangTienShipTrongNuoc: row.CanHang_TienShipTrongNuoc,
        hangKhoan: row.HangKhoan,
        maSoHang: row.MaSoHang,
        quocGiaId: row.QuocGiaID,
        tenQuocGia: row.TenQuocGia,
        linkTaiKhoanMang: row.LinkTaiKhoanMang,
        vungMien: row.VungMien,
      }));

      return {
        totalItem,
        danhSachDonHang,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in getQLDatHangList:', error);
      throw error;
    }
  }

  /**
   * Update order using SP_CapNhatDonHangSimpleCoTamTinh (inline edit from QLDatHang_LietKe)
   * Converted from: QLDatHang_LietKe.cs - gvDonHang_RowUpdating
   * Uses stored procedure: SP_CapNhatDonHangSimpleCoTamTinh
   *
   * Calculates:
   * - giaSauOffUsd = donGiaWeb * soLuong * (1 - saleOff/100)
   * - tienCongVnd = depends on GiaTienCong (percentage or fixed per item)
   * - tongTienUsd = giaSauOffUsd * (1 + tax/100) + (shipUsa + phuThu) * soLuong
   * - tongTienVnd = tongTienUsd * tyGia + tienCongVnd
   */
  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Build old data for logging
    const oldDataStr = `Website: ${order.websiteName}, Username: ${order.username}, Link: ${order.linkWeb}, SL: ${order.soLuong}, Gia: ${order.donGiaWeb}`;

    const {
      websiteName = order.websiteName || '',
      username = order.username || '',
      linkWeb = '',
      linkHinh = '',
      color = '',
      size = '',
      soLuong = order.soLuong || 1,
      donGiaWeb = order.donGiaWeb || 0,
      loaiTien = order.loaiTien || 'USD',
      ghiChu = (updateOrderDto as any).ghiChu ?? order.ghiChu ?? '',
      tyGia = order.tyGia || 1,
      saleOff = 0,
      cong = 0,
      shipUsa = 0,
      tax = 0,
      phuThu = 0,
      quocGiaId,
      usernameSave = '',
    } = updateOrderDto as any;

    await this.sequelize.query(
      `EXEC dbo.SP_CapNhatDonHangSimpleCoTamTinh
        @ID = :id,
        @WebsiteName = :websiteName,
        @username = :username,
        @linkweb = :linkweb,
        @linkhinh = :linkhinh,
        @corlor = :corlor,
        @size = :size,
        @soluong = :soLuong,
        @dongiaweb = :donGiaWeb,
        @loaitien = :loaiTien,
        @ghichu = :ghiChu,
        @tygia = :tyGia,
        @saleoff = :saleOff,
        @cong = :cong,
        @shipUSA = :shipUsa,
        @tax = :tax,
        @phuthu = :phuThu,
        @QuocGiaID = :quocGiaId,
        @NguoiTao = :usernameSave`,
      {
        replacements: {
          id,
          websiteName: (websiteName || '').toString().replace(/'/g, "''"),
          username: (username || '').toString().replace(/'/g, "''"),
          linkweb: (linkWeb || '').toString().replace(/'/g, "''"),
          linkhinh: (linkHinh || '').toString().replace(/'/g, "''"),
          corlor: (color || '').toString().replace(/'/g, "''"),
          size: (size || '').toString().replace(/'/g, "''"),
          soLuong,
          donGiaWeb,
          loaiTien: (loaiTien || 'USD').toString().replace(/'/g, "''"),
          ghiChu: (ghiChu || '').toString().replace(/'/g, "''"),
          tyGia,
          saleOff,
          cong,
          shipUsa: shipUsa || null,
          tax,
          phuThu,
          quocGiaId: quocGiaId || null,
          usernameSave: (usernameSave || '').toString().replace(/'/g, "''"),
        },
        type: QueryTypes.RAW,
      },
    );

    // Log the update action
    const newDataStr = `Website: ${websiteName}, Username: ${username}, Link: ${linkWeb}, SL: ${soLuong}, Gia: ${donGiaWeb}`;
    await this.systemLogsService.create({
      nguoiTao: usernameSave || 'system',
      nguon: 'QLDatHang_LietKe:CapNhatDonHangSimpleCoTamTinh',
      hanhDong: 'Chinh sua',
      doiTuong: id.toString(),
      noiDung: `Old: ${oldDataStr} | New: ${newDataStr}`,
    });

    // Reload order from DB after SP update
    return this.findOne(id);
  }

  /**
   * Soft delete order
   */
  async remove(id: number, nguoiTao = 'system'): Promise<void> {
    const order = await this.findOne(id);
    await order.update({ DaXoa: true });

    await this.systemLogsService.create({
      nguoiTao,
      nguon: 'EditOrder:XoaDonHang',
      hanhDong: 'Xoa',
      doiTuong: '',
      noiDung: `ID: ${id}`,
    });
  }

  /**
   * Mass soft delete orders using stored procedure (same as EditOrder logic)
   */
  async massDelete(massDeleteDto: MassDeleteDto, nguoiTao = 'system'): Promise<{ deleted: number }> {
    const { ids } = massDeleteDto;

    // Check kỳ đóng (giống EditOrder KiemTraDuocCapNhatCongNo)
    const ngayGhiNo = new Date().toISOString().split('T')[0];
    const [checkResult]: any[] = await this.sequelize.query(
      `DECLARE @ret int; EXEC @ret = dbo.SP_KiemTra_DuocCapNhatCongNo @NgayGhiNo = :ngayGhiNo, @UserName = :username; SELECT @ret AS DuocCapNhat`,
      {
        replacements: { ngayGhiNo, username: nguoiTao || '' },
        type: QueryTypes.RAW,
      }
    );
    const checkDataRaw = Array.isArray(checkResult) && checkResult.length > 0 ? checkResult[0] as any : { DuocCapNhat: -1 };
    const checkValue = checkDataRaw?.DuocCapNhat ?? -1;

    if (checkValue !== 0) {
      throw new BadRequestException('Kỳ đã đóng không thể thực hiện cancel');
    }

    // SP_CapNhat_MassCancel1: @id, @NguoiTao (không có @ghichu)
    try {
      await this.sequelize.query(
        `EXEC dbo.SP_CapNhat_MassCancel1 @id = :ids, @NguoiTao = :username`,
        {
        replacements: { ids: ids.join(','), username: nguoiTao || '' },
          type: QueryTypes.RAW,
        }
      );
    } catch (error) {
      console.error('MassCancel1 error:', error);
      throw new BadRequestException('Failed to mass delete orders');
    }

    // Log the mass delete action
    await this.systemLogsService.create({
      nguoiTao,
      nguon: 'EditOrder:MassCancel1',
      hanhDong: 'Chinh sua',
      doiTuong: '',
      noiDung: `ID: ${ids.join(',')}`,
    });

    return { deleted: ids.length };
  }

  /**
   * Mass complete orders using stored procedure (giống EditOrder logic)
   */
  async massComplete(ids: string, nguoiTao = 'system', nguon = 'EditOrder'): Promise<{ completed: number }> {
    // SP_CapNhat_MassComplete: @id (comma-separated IDs)
    try {
      await this.sequelize.query(`EXEC dbo.SP_CapNhat_MassComplete @id = :ids`, {
        replacements: { ids },
        type: QueryTypes.RAW,
      });
    } catch (error) {
      console.error('MassComplete error:', error);
      throw new BadRequestException('Failed to mass complete orders');
    }

    // System log (giống EditOrder)
    await this.systemLogsService.create({
      nguoiTao: nguoiTao || 'system',
      nguon: nguon === 'CanHang' ? 'CanHang:MassComplete' : 'EditOrder:MassComplete',
      hanhDong: 'Chinh sua',
      doiTuong: '',
      noiDung: `ID: ${ids}`,
    });

    return { completed: ids.split(',').length };
  }

  /**
   * Mass received orders using stored procedure (giống EditOrder logic)
   * Converted from: EditOrder.cs - lbtMassReceived_Click
   * Calls: SP_CapNhat_MassReceived (@id, @NguoiTao)
   */
  async massReceived(ids: string, nguoiTao = 'system'): Promise<{ received: number }> {
    // Check kỳ đóng trước khi thực hiện (giống code cũ)
    const [checkResult]: any[] = await this.sequelize.query(
      `DECLARE @ret int; EXEC @ret = dbo.SP_KiemTra_DuocCapNhatCongNo @NgayGhiNo = :ngayGhiNo, @UserName = :username; SELECT @ret AS DuocCapNhat`,
      {
        replacements: { ngayGhiNo: new Date().toISOString().split('T')[0], username: '' },
        type: QueryTypes.RAW,
      },
    );
    console.log({checkResult});
    const checkDataRaw = Array.isArray(checkResult) && checkResult.length > 0 ? checkResult[0] as any : { DuocCapNhat: -1 };
    const checkValue = checkDataRaw?.DuocCapNhat ?? -1;

    if (checkValue !== 0) {
      throw new BadRequestException('Kỳ đã đóng không thể thực hiện mass received');
    }

    // Call stored procedure SP_CapNhat_MassReceived
    try {
      await this.sequelize.query(`EXEC dbo.SP_CapNhat_MassReceived @id = :ids, @NguoiTao = :nguoiTao`, {
        replacements: { ids, nguoiTao: nguoiTao || '' },
        type: QueryTypes.RAW,
      });
    } catch (error) {
      console.error('MassReceived error:', error);
      throw new BadRequestException('Failed to mass received orders');
    }

    // System log (giống EditOrder)
    await this.systemLogsService.create({
      nguoiTao,
      nguon: 'EditOrder:MassReceived',
      hanhDong: 'Chinh sua',
      doiTuong: '',
      noiDung: `ID: ${ids}`,
    });

    return { received: ids.split(',').length };
  }

  /**
   * Mass shipped orders using stored procedure (giống EditOrder logic)
   * Converted from: EditOrder.cs - lbtMassShipped_Click + DBConnect.MassShipped
   * Calls: SP_CapNhat_MassShipped (@id)
   * Note: Không check kỳ đóng (giống code cũ)
   */
  async massShipped(ids: string, nguoiTao = 'system', nguon = 'EditOrder'): Promise<{ shipped: number }> {
    // Call stored procedure SP_CapNhat_MassShipped
    try {
      await this.sequelize.query(`EXEC dbo.SP_CapNhat_MassShipped @id = :ids`, {
        replacements: { ids },
        type: QueryTypes.RAW,
      });
    } catch (error) {
      console.error('MassShipped error:', error);
      throw new BadRequestException('Failed to mass shipped orders');
    }

    // System log (giống EditOrder)
    await this.systemLogsService.create({
      nguoiTao,
      nguon: nguon === 'CanHang' ? 'CanHang:MassShipped' : 'EditOrder:MassShipped',
      hanhDong: 'Chinh sua',
      doiTuong: '',
      noiDung: `ID: ${ids}`,
    });

    return { shipped: ids.split(',').length };
  }

  /**
   * Mass update orders
   * Converted from QLDatHang_MassUpdate.cs - btShare_Click -> DBConnect.ShareOrders
   * Uses stored procedure SP_ShareOrders
   */
  async massUpdate(massUpdateDto: MassUpdateDto): Promise<{ updated: number }> {
    const { items, username: nguoiTao } = massUpdateDto;
    const ids = items.map(item => item.id).join(',');

    // Get first item to get common values (for batch updates, all items share same values)
    const firstItem = items[0];
    if (!firstItem) {
      return { updated: 0 };
    }

    const {
      id, // exclude id from update data
      orderNumber,
      tyGia = 0,
      cong = 0,
      saleOff = 0,
      phuThu = 0,
      shipUsa = 0,
      tax = 0,
      totalCharged = 0,
      totalItem = 0,
      heThongTuTinhCong = false,
      trangThaiOrder,
      adminNote,
    } = firstItem;

    try {
      // Call the stored procedure SP_ShareOrders
      // This matches the C# logic in DBConnect.ShareOrders()
      await this.sequelize.query(
        `EXEC dbo.SP_ShareOrders
          @id = :ids,
          @ordernumber = :orderNumber,
          @cong = :cong,
          @saleoff = :saleOff,
          @phuthu = :phuThu,
          @shipUSA = :shipUsa,
          @tax = :tax,
          @TotalCharged = :totalCharged,
          @TotalItem = :totalItem,
          @HeThongTuTinhCong = :heThongTuTinhCong,
          @tygia = :tyGia,
          @NguoiTao = :nguoiTao`,
        {
          replacements: {
            ids,
            orderNumber: orderNumber || '',
            cong,
            saleOff,
            phuThu,
            shipUsa,
            tax,
            totalCharged,
            totalItem,
            heThongTuTinhCong,
            tyGia,
            nguoiTao: nguoiTao || 'system',
          },
          type: QueryTypes.RAW,
        },
      );

      // Log the action
      console.log(`[massUpdate] Updated orders: ${ids}`);

      return { updated: items.length };
    } catch (error) {
      console.error('[massUpdate] Error:', error);
      throw new Error(`Failed to mass update orders: ${error.message}`);
    }
  }

  /**
   * Restore soft-deleted order
   */
  async restore(id: number): Promise<Order> {
    const order = await this.orderModel.findByPk(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order.update({ DaXoa: false });
  }

  /**
   * Batch restore multiple deleted orders
   */
  async batchRestore(ids: number[]): Promise<{ success: boolean; count: number }> {
    try {
      const [updated] = await this.orderModel.update(
        { DaXoa: false },
        { where: { id: { [Op.in]: ids }, DaXoa: true } }
      );
      return { success: true, count: updated };
    } catch (error: any) {
      console.error('Error in batchRestore:', error.message);
      return { success: false, count: 0 };
    }
  }

  /**
   * Permanently delete an order (vĩnh viễn xóa)
   */
  async permanentDelete(id: number): Promise<{ success: boolean }> {
    try {
      await this.orderModel.destroy({ where: { id }, force: true });
      return { success: true };
    } catch (error: any) {
      console.error('Error in permanentDelete:', error.message);
      return { success: false };
    }
  }

  /**
   * Mass cancel orders
   */
  async batchCancel(ids: number[]): Promise<{ success: boolean; count: number }> {
    try {
      const [updated] = await this.orderModel.update(
        { trangThaiOrder: 'Cancelled' },
        { where: { id: { [Op.in]: ids }, DaXoa: true } }
      );
      return { success: true, count: updated };
    } catch (error: any) {
      console.error('Error in batchCancel:', error.message);
      return { success: false, count: 0 };
    }
  }

  /**
   * Mass complete orders (only Ordered/Shipped can be completed)
   */
  async batchComplete(ids: number[]): Promise<{ success: boolean; count: number; message?: string }> {
    try {
      // Only update orders that are Ordered or Shipped
      const [updated] = await this.orderModel.update(
        { trangThaiOrder: 'Completed' },
        { where: { id: { [Op.in]: ids }, DaXoa: true, trangThaiOrder: { [Op.in]: ['Ordered', 'Shipped'] } } }
      );
      return { success: true, count: updated };
    } catch (error: any) {
      console.error('Error in batchComplete:', error.message);
      return { success: false, count: 0 };
    }
  }

  /**
   * Mass set orders to Received status
   */
  async batchReceived(ids: number[]): Promise<{ success: boolean; count: number }> {
    try {
      const [updated] = await this.orderModel.update(
        { trangThaiOrder: 'Received' },
        { where: { id: { [Op.in]: ids }, DaXoa: true } }
      );
      return { success: true, count: updated };
    } catch (error: any) {
      console.error('Error in batchReceived:', error.message);
      return { success: false, count: 0 };
    }
  }

  /**
   * Mass set orders to Shipped status
   */
  async batchShipped(ids: number[]): Promise<{ success: boolean; count: number }> {
    try {
      const [updated] = await this.orderModel.update(
        { trangThaiOrder: 'Shipped' },
        { where: { id: { [Op.in]: ids }, DaXoa: true } }
      );
      return { success: true, count: updated };
    } catch (error: any) {
      console.error('Error in batchShipped:', error.message);
      return { success: false, count: 0 };
    }
  }

  /**
   * Find all deleted orders with filters and pagination
   *
   * Converted from OrderDaXoa.aspx.cs - LoadDanhSachDonHangDaXoa()
   */
  async findDeleted(query: QueryOrderDto): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { website, username, status, statuses, search, orderId, startDate, endDate, quocGiaId, page = 1, limit = 20 } = query;

    // Cap limit to 500 max to match @Max(500) validation
    const safeLimit = Math.min(limit, 500);
    try {
      const offset = (page - 1) * safeLimit;
      let whereClause = 'WHERE DaXoa = 1';

      if (website) {
        whereClause += ` AND WebsiteName LIKE '%${website}%'`;
      }
      if (username) {
        whereClause += ` AND username LIKE '%${username}%'`;
      }
      if (status) {
        whereClause += ` AND trangThaiOrder = '${status}'`;
      }
      // Handle statuses array for CheckBoxList filter
      if (statuses && statuses.length > 0) {
        const statusList = statuses.map((s) => `'${s}'`).join(',');
        whereClause += ` AND trangThaiOrder IN (${statusList})`;
      }
      if (search) {
        whereClause += ` AND (ordernumber LIKE '%${search}%' OR username LIKE '%${search}%' OR MaSoHang LIKE '%${search}%')`;
      }
      if (orderId) {
        whereClause += ` AND ID = '${orderId}'`;
      }
      if (quocGiaId && quocGiaId > 0) {
        whereClause += ` AND QuocGiaID = ${quocGiaId}`;
      }
      if (startDate) {
        whereClause += ` AND ngaySaveLink >= '${startDate}'`;
      }
      if (endDate) {
        whereClause += ` AND ngaySaveLink <= '${endDate}'`;
      }

      // Get total count
      const [countResult]: any[] = await this.sequelize.query(
        `SELECT COUNT(*) as total FROM dbo.DON_HANG ${whereClause}`
      );
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data with lowercase aliases for frontend compatibility
      const [data] = await this.sequelize.query(`
        SELECT * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY ID DESC) as RowNum,
            ID as id, username, WebsiteName as websiteName, ordernumber as orderNumber,
            linkweb as linkWeb, linkhinh as linkHinh, corlor as color, size, soluong as soLuong,
            dongiaweb as donGiaWeb, saleoff as saleOff, phuthu as phuThu, shipUSA as shipUsa,
            tax, cong, tiencongUSD as tienCongUsd, tongtienUSD as tongTienUsd,
            tyGia, tongtienVND as tongTienVnd, trangThaiOrder as trangThaiOrder,
            ngayveVN as ngayVeVn, ngaySaveLink as ngaySaveLink, ngaymuahang as ngayMuaHang,
            TenDotHang as tenDotHang, ghichu as ghiChu, MaSoHang as maSoHang,
            QuocGiaID as quocGiaId, HangKhoan as hangKhoan
          FROM dbo.DON_HANG ${whereClause}
        ) AS Paginated
        WHERE RowNum BETWEEN ${offset + 1} AND ${offset + safeLimit}
      `);

      return {
        data: data || [],
        total,
        page,
        limit: safeLimit,
      };
    } catch (error) {
      console.error('Error in findDeleted:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit: safeLimit,
      };
    }
  }

  /**
   * Get count of deleted orders by status
   * For CheckBoxList with counts like C# version
   */
  async getDeletedStatusCounts(): Promise<{ status: string; count: number }[]> {
    try {
      const [results]: any[] = await this.sequelize.query(`
        SELECT trangThaiOrder as status, COUNT(*) as count
        FROM dbo.DON_HANG
        WHERE DaXoa = 1
        GROUP BY trangThaiOrder
      `);
      return results || [];
    } catch (error: any) {
      console.error('Error in getDeletedStatusCounts:', error.message);
      return [];
    }
  }

  /**
   * Update order note (add additional note)
   *
   * Converted from EditOrder_BoSungGhiChu.aspx.cs
   */
  async updateNote(ids: number[], updateNoteDto: UpdateOrderNoteDto, nguoiTao = 'system'): Promise<any> {
    // Converted from EditOrder_BoSungGhiChu.aspx.cs - btCapNhat_Click()
    // Calls stored procedure SP_CapNhat_BoSungGhiChu which handles batch note update
    // SP uses SplitString(@id, ',') to parse comma-separated IDs
    try {
      const idsParam = ids.join(',');
      await this.sequelize.query(
        `EXEC dbo.SP_CapNhat_BoSungGhiChu @id = :ids, @BoSungGhiChu = :note`,
        {
          replacements: {
            ids: idsParam,
            note: (updateNoteDto.boSungGhiChu || '').replace(/'/g, "''"),
          },
          type: QueryTypes.RAW,
        },
      );
      await this.systemLogsService.create({
        nguoiTao,
        nguon: 'EditOrder_BoSungGhiChu:btCapNhat_Click',
        hanhDong: 'Chinh sua',
        doiTuong: idsParam,
        noiDung: `ID: ${idsParam}; BoSungGhiChu: ${updateNoteDto.boSungGhiChu || ''}`,
      });
      // Return first updated order for response
      return this.findOne(ids[0]);
    } catch (error) {
      console.error('UpdateNote error:', error);
      throw new Error(`Failed to update note for orders ${ids.join(',')}`);
    }
  }

  /**
   * Update order return date to Vietnam
   *
   * Converted from EditOrder_NgayVeVN.aspx.cs - btCapNhat_Click()
   * Calls stored procedure SP_CapNhat_NgayVeVN which handles:
   * - Update ngayVeVN
   * - Auto-generate tenDotHang = yyyyMMdd format
   * - Optionally change status to Completed
   * - Optionally append additional note
   * - Auto create/update DotHang (shipment batch)
   * - Log system action
   */
  async updateReturnDate(
    id: number,
    updateReturnDateDto: UpdateReturnDateDto,
    username?: string,
  ): Promise<Order> {
    const { ngayVeVn, boSungGhiChu, chuyenVeCompleted } = updateReturnDateDto;

    // Parse the return date
    const returnDate = new Date(ngayVeVn);

    // Format date for SQL (yyyyMMdd)
    const tenDotHang = returnDate.toISOString().slice(0, 10).replace(/-/g, '');
    const sqlDate = returnDate.toISOString().slice(0, 10);

    // Call stored procedure SP_CapNhat_NgayVeVN
    await this.sequelize.query(
      `EXEC SP_CapNhat_NgayVeVN
        @id = '${id}',
        @NgayVeVN = '${sqlDate}',
        @TenDotHang = '${tenDotHang}',
        @BoSungGhiChu = '${(boSungGhiChu || '').replace(/'/g, "''")}',
        @ChuyenSangComplete = ${chuyenVeCompleted ? 1 : 0}`,
    );

    // Fetch updated order
    const updatedOrder = await this.findOne(id);

    // System logging (from EditOrder_NgayVeVN.aspx.cs)
    if (username && updatedOrder) {
      await this.systemLogsService.create({
        nguoiTao: username,
        nguon: 'EditOrder_NgayVeVN:CapNhatNgayVeVN',
        hanhDong: 'Chinh sua',
        doiTuong: String(id),
        noiDung: `ID: ${id}; NgayVeVN: ${ngayVeVn}; BoSungGhiChu: ${boSungGhiChu || ''}`,
      });
    }

    return updatedOrder;
  }

  /**
   * Import orders from Excel file
   *
   * Converted from QLDatHang_Import.aspx.cs
   * This is a simplified version - actual implementation would parse Excel file
   */
  async importOrders(
    file: any,
    importDto: ImportOrdersDto,
  ): Promise<{ imported: number; errors?: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    // Check if file is provided
    if (!file) {
      // If no file, return stub response for now
      return { imported: 0, errors: ['No file uploaded'] };
    }

    // Validate file type
    if (!file.originalname.endsWith('.xlsx')) {
      throw new BadRequestException('Only .xlsx files are supported');
    }

    // In a full implementation, we would:
    // 1. Parse the Excel file using xlsx library
    // 2. Validate each row against required fields
    // 3. Create or update orders based on mode
    // 4. Return import results

    // For now, return a placeholder response
    return {
      imported: 0,
      errors: ['Excel import not fully implemented - requires xlsx library'],
    };
  }

  /**
   * Get product types (LoaiHang) for can hang dropdown
   *
   * Converted from CanHang.aspx.cs - LoadDataLoaiHang
   */
  async getProductTypes(): Promise<{ data: Array<{ LoaiHangID: number; TenLoaiHang: string }> }> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT LoaiHangID, TenLoaiHang FROM dbo.LoaiHang ORDER BY TenLoaiHang
      `);
      return { data: data as any };
    } catch (error) {
      console.error('Error fetching product types:', error);
      return { data: [] };
    }
  }

  /**
   * Get order counts by status for can hang page
   *
   * Converted from CanHang.aspx.cs - LoadSoLuongDonHang
   */
  async getStatusCounts(): Promise<Record<string, number>> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT trangThaiOrder, COUNT(*) as SL
        FROM dbo.DON_HANG
        WHERE DaXoa = 0
        GROUP BY trangThaiOrder
      `);

      const counts: Record<string, number> = {
        Received: 0,
        Ordered: 0,
        Shipped: 0,
        Completed: 0,
        Cancelled: 0,
      };

      (data as any[]).forEach((row) => {
        if (counts.hasOwnProperty(row.trangThaiOrder)) {
          counts[row.trangThaiOrder] = parseInt(row.SL);
        }
      });

      return counts;
    } catch (error) {
      console.error('Error fetching status counts:', error);
      return {
        Received: 0,
        Ordered: 0,
        Shipped: 0,
        Completed: 0,
        Cancelled: 0,
      };
    }
  }

  /**
   * Calculate shipping fee based on weight, product type, currency, and user
   *
   * Converted from CanHang.aspx.cs - gvDonHang_RowCommand (TinhTienShip)
   * Uses: EnhancedMath.RoundUp(weight * LayCongShipVeVN(loaiHangId, loaiTien, userName))
   */
  async calculateShipping(body: { weight: number; loaiHangId: number; loaiTien: string; username: string }): Promise<{ shippingFee: number }> {
    try {
      const { weight, loaiHangId, loaiTien, username } = body;

      // Get shipping rate from database - LayCongShipVeVN
      const [rates] = await this.sequelize.query(`
        SELECT CongShipVeVN FROM dbo.LoaiHang WHERE LoaiHangID = ${loaiHangId}
      `);

      if (!rates || (rates as any[]).length === 0) {
        return { shippingFee: 0 };
      }

      const rate = (rates as any[])[0].CongShipVeVN || 0;

      // Calculate: RoundUp(weight * rate)
      const shippingFee = Math.ceil(weight * rate);

      return { shippingFee };
    } catch (error) {
      console.error('Error calculating shipping:', error);
      return { shippingFee: 0 };
    }
  }

  async updateCanHang(
    id: number,
    body: {
      loaiHangId: number;
      canHangSoKg: number;
      canHangTienShipVeVn: number;
      canHangTienShipTrongNuoc?: number;
      canHangGhiChuShipVeVn?: string;
    },
    nguoiTao = 'system',
  ): Promise<{ success: boolean }> {
    const canHangTienShipTrongNuoc = body.canHangTienShipTrongNuoc ?? 0;
    const canHangGhiChuShipVeVn = body.canHangGhiChuShipVeVn || '';

    await this.sequelize.query(
      `EXEC dbo.SP_CanHang
        @ID = :id,
        @LoaiHangID = :loaiHangId,
        @CanHang_SoKg = :canHangSoKg,
        @CanHang_TienShipVeVN = :canHangTienShipVeVn,
        @CanHang_TienShipTrongNuoc = :canHangTienShipTrongNuoc,
        @CanHang_GhiChuShipVeVN = :canHangGhiChuShipVeVn,
        @NguoiTao = :nguoiTao`,
      {
        replacements: {
          id,
          loaiHangId: body.loaiHangId,
          canHangSoKg: body.canHangSoKg ?? 0,
          canHangTienShipVeVn: body.canHangTienShipVeVn ?? 0,
          canHangTienShipTrongNuoc,
          canHangGhiChuShipVeVn,
          nguoiTao,
        },
        type: QueryTypes.RAW,
      },
    );

    await this.systemLogsService.create({
      nguoiTao,
      nguon: 'CanHang:CanHang',
      hanhDong: 'Chinh sua',
      doiTuong: String(id),
      noiDung: `ID: ${id}; LoaiHang: ${body.loaiHangId}; CanHang_SoKg: ${body.canHangSoKg ?? 0}; CanHang_TienShipVeVN: ${body.canHangTienShipVeVn ?? 0}; CanHang_GhiChuShipVeVN: ${canHangGhiChuShipVeVn}`,
    });

    return { success: true };
  }

  /**
   * Get list of usernames for can hang dropdown
   *
   * Converted from CanHang.aspx.cs - LoadDataUser
   * Uses: UserManager.Users (AspNetUsers table)
   */
  async getUsernames(): Promise<{ username: string }[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT UserName as username FROM dbo.AspNetUsers ORDER BY UserName
      `);
      return data as any;
    } catch (error) {
      console.error('Error fetching usernames:', error);
      return [];
    }
  }

  /**
   * Get list of batches (DotHang) for can hang dropdown
   *
   * Converted from CanHang.aspx.cs - LoadDataDotHang
   * Uses: LayDanhSachTenDotHang(DateTime.Today.AddYears(-1))
   */
  async getBatches(): Promise<{ tenDotHang: string }[]> {
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const [data] = await this.sequelize.query(`
        SELECT DISTINCT tenDotHang FROM dbo.DON_HANG
        WHERE DaXoa = 0 AND tenDotHang IS NOT NULL AND ngayVeVN >= '${oneYearAgo.toISOString().split('T')[0]}'
        ORDER BY tenDotHang DESC
      `);
      return data as any;
    } catch (error) {
      console.error('Error fetching batches:', error);
      return [];
    }
  }

  /**
   * Update order - converted from EditOrderDetail.cs - btCapNhat_Click
   *
   * Steps:
   * 1. Check permission using SP_KiemTra_DuocCapNhatDonHang
   * 2. Update order using SP_CapNhatDonHang
   * 3. Log action to SystemLogs
   * 4. Update ngayVeVN using SP_CapNhatNgayVeVN (if provided)
   *
   * Returns:
   *   { success: true } - Update success
   *   { error: 'closed_period' } - Kỳ đã đóng
   *   { error: 'failed' } - Update failed
   */
  async updateOrderDetail(
    id: number,
    // Accept both camelCase and snake_case from frontend
    updateData: {
      username: string;
      linkweb?: string;
      linkhinh?: string;
      linkWeb?: string;
      linkHinh?: string;
      corlor?: string;
      size?: string;
      soluong: number;
      dongiaweb?: number;
      donGiaWeb?: number;
      saleoff?: number;
      saleOff?: number;
      phuthu?: number;
      phuThu?: number;
      shipUSA?: number;
      shipUsa?: number;
      shipusa?: number;
      tax?: number;
      cong?: number;
      loaitien?: string;
      loaiTien?: string;
      ghichu?: string;
      ghiChu?: string;
      tygia?: number;
      tyGia?: number;
      giasauoffUSD?: number;
      giaSauOffUsd?: number;
      giasauoffVND?: number;
      giaSauOffVnd?: number;
      tiencongUSD?: number;
      tienCongUsd?: number;
      tiencongVND?: number;
      tienCongVnd?: number;
      tongtienUSD?: number;
      tongTienUsd?: number;
      tongtienVND?: number;
      tongTienVnd?: number;
      ordernumber?: string;
      orderNumber?: string;
      trangthaiOrder?: string;
      trangThaiOrder?: string;
      ngaymuahang?: string;
      ngayMuaHang?: string;
      ngayveVN?: string;
      ngayVeVn?: string;
      adminNote?: string;
      LoaiHangID?: number;
      loaiHangId?: number;
      QuocGiaID?: number;
      quocGiaId?: number;
      usernamesave?: string;
      nguoiTao: string;
    },
    actorUsername = 'system',
  ): Promise<{ success: boolean; error?: string }> {
    const {
      username,
      linkweb: linkWeb,
      linkhinh: linkHinh,
      corlor,
      size,
      soluong,
      dongiaweb: donGiaWeb,
      saleoff: saleOff,
      phuthu: phuThu,
      shipusa: shipUsa,
      tax,
      cong,
      loaitien: loaiTien,
      ghichu: ghiChu,
      tygia: tyGia,
      giasauoffUSD: giaSauOffUsd,
      giasauoffVND: giaSauOffVnd,
      tiencongUSD: tienCongUsd,
      tiencongVND: tienCongVnd,
      tongtienUSD: tongTienUsd,
      tongtienVND: tongTienVnd,
      ordernumber: orderNumber,
      trangthaiOrder: trangThaiOrder,
      ngaymuahang: ngayMuaHang,
      ngayveVN: ngayVeVn,
      adminNote,
      LoaiHangID: loaiHangId,
      QuocGiaID: quocGiaId,
      usernamesave,
      nguoiTao,
    } = updateData;
    const logUsername = actorUsername || nguoiTao || 'system';

    // Step 1: Check permission using SP_KiemTra_DuocCapNhatDonHang
    const [checkResult]: any[] = await this.sequelize.query(
      `DECLARE @ret int; EXEC @ret = dbo.SP_KiemTra_DuocCapNhatDonHang @ID = :id, @UserName = :username; SELECT @ret AS DuocCapNhat`,
      {
        replacements: { id, username: username || '' },
        type: QueryTypes.RAW,
      },
    );
    const checkDataRaw = Array.isArray(checkResult) && checkResult.length > 0 ? checkResult[0] as any : { DuocCapNhat: -1 };
    const checkValue = checkDataRaw?.DuocCapNhat ?? -1;

    if (checkValue === 1) {
      return { success: false, error: 'closed_period' }; // Kỳ đã đóng
    }
    if (checkValue === 2) {
      return { success: false, error: 'debt_locked' }; // Công nợ bị khóa
    }
    if (checkValue !== 0) {
      return { success: false, error: 'failed' };
    }

    // Step 2: Build NoiDung for SystemLogs (giống BLL.NoiDungDonHangSystemLogs)
    const noiDung = [
      `username: ${username}`,
      `linkweb: ${linkWeb}`,
      `linkhinh: ${linkHinh}`,
      `corlor: ${corlor}`,
      `size: ${size}`,
      `soluong: ${soluong}`,
      `dongiaweb: ${donGiaWeb}`,
      `saleoff: ${saleOff}`,
      `phuthu: ${phuThu}`,
      `shipUSA: ${shipUsa}`,
      `tax: ${tax}`,
      `cong: ${cong}`,
      `loaitien: ${loaiTien}`,
      `ghichu: ${ghiChu}`,
      `tygia: ${tyGia}`,
      `giasauoffUSD: ${giaSauOffUsd}`,
      `giasauoffVND: ${giaSauOffVnd}`,
      `tiencongUSD: ${tienCongUsd}`,
      `tiencongVND: ${tienCongVnd}`,
      `tongtienUSD: ${tongTienUsd}`,
      `tongtienVND: ${tongTienVnd}`,
      `ordernumber: ${orderNumber}`,
      `trangthaiOrder: ${trangThaiOrder}`,
      `ngaymuahang: ${ngayMuaHang || ''}`,
    ].join('; ');

    // Step 3: Update order using SP_CapNhatDonHang
    try {
      await this.sequelize.query(
        `EXEC dbo.SP_CapNhatDonHang
          @ID = :id,
          @username = :username,
          @usernamesave = :usernamesave,
          @linkweb = :linkweb,
          @linkhinh = :linkhinh,
          @corlor = :corlor,
          @size = :size,
          @soluong = :soluong,
          @dongiaweb = :dongiaweb,
          @saleoff = :saleoff,
          @phuthu = :phuthu,
          @shipUSA = :shipusa,
          @tax = :tax,
          @cong = :cong,
          @loaitien = :loaitien,
          @ghichu = :ghichu,
          @tygia = :tygia,
          @giasauoffUSD = :giasauoffUSD,
          @giasauoffVND = :giasauoffVND,
          @tiencongUSD = :tiencongUSD,
          @tiencongVND = :tiencongVND,
          @tongtienUSD = :tongtienUSD,
          @tongtienVND = :tongtienVND,
          @ordernumber = :ordernumber,
          @trangthaiOrder = :trangthaiOrder,
          @ngaymuahang = :ngaymuahang,
          @ngayveVN = :ngayvevn,
          @AdminNote = :adminNote,
          @LoaiHangID = :loaiHangId,
          @QuocGiaID = :quocGiaId,
          @NguoiTao = :nguoiTao`,
        {
          replacements: {
            id,
            username: username || '',
            usernamesave: usernamesave || '',
            linkweb: (linkWeb || '').replace(/'/g, "''"),
            linkhinh: (linkHinh || '').replace(/'/g, "''"),
            corlor: (corlor || '').replace(/'/g, "''"),
            size: (size || '').replace(/'/g, "''"),
            soluong,
            dongiaweb: donGiaWeb,
            saleoff: saleOff,
            phuthu: phuThu || 0,
            shipusa: shipUsa || null,
            tax: tax || 0,
            cong: cong || 0,
            loaitien: loaiTien || 'USD',
            ghichu: (ghiChu || '').replace(/'/g, "''"),
            tygia: tyGia || 0,
            giasauoffUSD: giaSauOffUsd || 0,
            giasauoffVND: giaSauOffVnd || 0,
            tiencongUSD: tienCongUsd || 0,
            tiencongVND: tienCongVnd || 0,
            tongtienUSD: tongTienUsd || 0,
            tongtienVND: tongTienVnd || 0,
            ordernumber: orderNumber || '',
            trangthaiOrder: trangThaiOrder || 'Received',
            ngaymuahang: ngayMuaHang || null,
            ngayvevn: ngayVeVn || null,
            adminNote: (adminNote || '').replace(/'/g, "''"),
            loaiHangId: loaiHangId || null,
            quocGiaId: quocGiaId || null,
            nguoiTao: logUsername,
          },
          type: QueryTypes.RAW,
        },
      );
    } catch (error) {
      console.error('updateOrderDetail error:', error);
      return { success: false, error: 'failed' };
    }

    // Step 4: Log to SystemLogs
    await this.systemLogsService.create({
      nguoiTao: logUsername,
      nguon: 'EditOrderDetail:CapNhatDonHang',
      hanhDong: 'Chinh sua',
      doiTuong: String(id),
      noiDung: `ID: ${id}; ${noiDung}`,
    });

    // Step 5: Update ngayVeVN using SP_CapNhatNgayVeVN if provided
    if (ngayVeVn) {
      try {
        const ngayVeDate = new Date(ngayVeVn);
        const tenDotHang = ngayVeDate.toISOString().slice(0, 10).replace(/-/g, '');

        await this.sequelize.query(
          `EXEC dbo.SP_CapNhatNgayVeVN
            @id = :id,
            @NgayVeVN = :ngayVeVN,
            @TenDotHang = :tenDotHang,
            @BoSungGhiChu = '',
            @ChuyenSangComplete = 0`,
          {
            replacements: {
              id,
              ngayVeVN: ngayVeDate.toISOString().slice(0, 10),
              tenDotHang,
            },
            type: QueryTypes.RAW,
          },
        );
      } catch (error) {
        console.error('updateOrderDetail ngayVeVN error:', error);
        // Continue even if ngayVeVN update fails
      }
    }

    return { success: true };
  }

  /**
   * Get list of countries (QuocGia)
   *
   * Converted from EditOrder.aspx.cs - LoadDataQuocGia()
   * Uses: dBConnect.LayDanhSachQuocGia() -> SP_Lay_QuocGia
   */
  async getQuocGia(): Promise<{ QuocGiaID: number; TenQuocGia: string; PhiShipVeVN: number }[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT QuocGiaID, TenQuocGia, PhiShipVeVN FROM dbo.tbQuocGia ORDER BY TenQuocGia
      `);
      return data as any;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  }

  /**
   * Get exchange rates (TyGia) for EditOrderDetail
   *
   * Converted from EditOrderDetail.cs - LoadDataTyGia()
   * Uses: BLL.LayDanhSachTyGia() -> DBConnect.LayDanhSachTyGia
   */
  async getExchangeRates(): Promise<{ name: string; tyGiaVND: number; congShipVeVN: number }[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT Name, TyGiaVND, CongShipVeVN FROM dbo.TY_GIA ORDER BY Name
      `);
      return data as any;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return [];
    }
  }

  /**
   * Get product types (LoaiHang) for EditOrderDetail
   *
   * Converted from EditOrderDetail.cs - LoadDataLoaiHang()
   * Uses: BLL.LayDanhSachLoaiHang()
   */
  async getLoaiHang(): Promise<{ LoaiHangID: number; TenLoaiHang: string }[]> {
    try {
      const [data] = await this.sequelize.query(`
        SELECT LoaiHangID, TenLoaiHang FROM dbo.LoaiHang ORDER BY TenLoaiHang
      `);
      return data as any;
    } catch (error) {
      console.error('Error fetching LoaiHang:', error);
      return [];
    }
  }

  /**
   * Calculate service fee (GiaTienCong) for EditOrderDetail
   *
   * Converted from EditOrderDetail.cs - drLoaitien_SelectedIndexChanged()
   * Uses: BLL.LayGiaTienCong(loaiTien, donGiaWeb, khachBuon)
   */
  async getGiaTienCong(loaiTien: string, donGiaWeb: number, username: string): Promise<{ tienCong1Mon: number; tinhTheoPhanTram: boolean }> {
    try {
      // Get user's KhachBuon status
      const [users] = await this.sequelize.query(
        `SELECT KhachBuon FROM dbo.AspNetUsers WHERE UserName = :username`,
        {
          replacements: { username },
          type: QueryTypes.RAW,
        },
      );
      const khachBuon = (users as any[])?.[0]?.KhachBuon || false;

      // Get service fee from GiaTienCong table
      // TinhTheoPhanTram = 1 means percentage-based
      try {
        const [giaTienCong] = await this.sequelize.query(
          `SELECT TOP 1 TienCong1Mon, TinhTheoPhanTram FROM dbo.GiaTienCong
           WHERE LoaiTien = :loaiTien
           ORDER BY ID DESC`,
          {
            replacements: { loaiTien },
            type: QueryTypes.RAW,
          },
        );

        if ((giaTienCong as any[]).length === 0) {
          return { tienCong1Mon: khachBuon ? 0 : 0, tinhTheoPhanTram: false };
        }

        const gia = (giaTienCong as any[])[0];
        return {
          tienCong1Mon: gia.TienCong1Mon || 0,
          tinhTheoPhanTram: !!gia.TinhTheoPhanTram,
        };
      } catch (tableError) {
        // Table may not exist - return default values
        console.warn('Table tbGiaTienCong not found, using default values');
        return { tienCong1Mon: khachBuon ? 0 : 0, tinhTheoPhanTram: false };
      }
    } catch (error) {
      console.error('Error calculating GiaTienCong:', error);
      return { tienCong1Mon: 0, tinhTheoPhanTram: false };
    }
  }

  /**
   * Update tracking number for LIST_ORDER
   * Converted from: TrackingNumber.aspx - btCapNhat_Click
   * Uses: orderNumber (string) as input, matching C# capNhatTrackingNumber
   */
  async updateTrackingNumber(orderNumber: string, trackingNumber: string, ngayNhanTaiNuocNgoai: string, trackingLink: string): Promise<{ success: boolean; message: string }> {
    try {
      const orderNumberSafe = orderNumber.replace(/'/g, "''");

      // Check if order exists in LIST_ORDER by orderNumber
      const [existing]: any[] = await this.sequelize.query(
        `SELECT ID FROM dbo.LIST_ORDER WHERE OrderNumber = N'${orderNumberSafe}'`
      );

      if (!existing || existing.length === 0) {
        return { success: false, message: 'Order not found' };
      }

      // Update tracking number - USING STORED PROCEDURE like C#
      await this.sequelize.query(`
        EXEC dbo.SP_CapNhat_TrackingNumber
          @ordernumber = N'${orderNumberSafe}',
          @tracking_number = N'${trackingNumber || ''}',
          ${ngayNhanTaiNuocNgoai ? `@NgayNhanTaiNuocNgoai = '${ngayNhanTaiNuocNgoai}'` : '@NgayNhanTaiNuocNgoai = NULL'},
          @TrackingLink = N'${trackingLink || ''}'
      `);

      return { success: true, message: 'Đã cập nhật thành công' };
    } catch (error) {
      console.error('Error in updateTrackingNumber:', error.message);
      return { success: false, message: 'Có lỗi xảy ra' };
    }
  }

  /**
   * Search orders by order number OR tracking number for TrackingNumber page
   * Converted from: TrackingNumber.aspx - btTimKiem_Click
   * Calls BLL.LayDanhSachListOrder with both orderNumber and trackingNumber search
   */
  async searchByOrderOrTracking(orderNumber: string, trackingNumber: string, page: number = 1, limit: number = 20): Promise<{ data: any[]; total: number }> {
    try {
      const orderNumberSafe = orderNumber?.replace(/'/g, "''") || '';
      const trackingNumberSafe = trackingNumber?.replace(/'/g, "''") || '';

      // Search using STORED PROCEDURE like C# SP_Lay_ListOrder
      // SP returns: [ { TOTALROW: 50 }, {row1}, {row2}, ... ]
      const results: any[] = await this.sequelize.query(`
        EXEC dbo.SP_Lay_ListOrder
          @OrderNumber = N'${orderNumberSafe || ''}',
          @TrackingNumber = N'${trackingNumberSafe || ''}',
          @PageSize = ${limit},
          @PageNum = ${page}
      `);

      const total = Number(results[0]?.TOTALROW) || 0;
      const data = results.slice(1) || [];

      return { data, total };
    } catch (error) {
      console.error('Error in searchByOrderOrTracking:', error.message);
      return { data: [], total: 0 };
    }
  }

  /**
   * Get totals for QLDatHang_LietKe page
   * Converted from: QLDatHang_LietKe.aspx - CheckAllItem JavaScript calculation
   */
  async getTotals(query: QueryOrderDto): Promise<{ totalCount: number; totalPrice: number; totalVnd: number }> {
    try {
      const { website, username, status, statuses, search, startDate, endDate, quocGiaId } = query;

      let whereClause = 'WHERE dh.DaXoa = 0';

      if (website) whereClause += ` AND dh.WebsiteName LIKE '%${website}%'`;
      if (username) whereClause += ` AND dh.username LIKE '%${username}%'`;
      if (statuses && statuses.length > 0) {
        const statusList = statuses.map(s => `'${s}'`).join(',');
        whereClause += ` AND dh.trangthaiOrder IN (${statusList})`;
      } else if (status) {
        whereClause += ` AND dh.trangthaiOrder = '${status}'`;
      }
      if (search) whereClause += ` AND (dh.ordernumber LIKE '%${search}%' OR dh.username LIKE '%${search}%')`;
      if (startDate) whereClause += ` AND dh.ngaySaveLink >= '${startDate}'`;
      if (endDate) whereClause += ` AND dh.ngaySaveLink <= '${endDate}'`;
      if (quocGiaId && quocGiaId > 0) whereClause += ` AND dh.QuocGiaID = ${quocGiaId}`;

      const [result]: any[] = await this.sequelize.query(`
        SELECT
          SUM(dh.soluong) as totalCount,
          SUM(dh.giasauoffusd * dh.soluong) as totalPrice,
          SUM(dh.tongtienvnd) as totalVnd
        FROM dbo.DON_HANG dh
        ${whereClause}
      `);

      return {
        totalCount: Number(result[0]?.totalCount) || 0,
        totalPrice: Number(result[0]?.totalPrice) || 0,
        totalVnd: Number(result[0]?.totalVnd) || 0,
      };
    } catch (error) {
      console.error('Error in getTotals:', error.message);
      return { totalCount: 0, totalPrice: 0, totalVnd: 0 };
    }
  }

  /**
   * Get order counts by status for user (DanhSachDonHang.aspx)
   * Matches: DanhSachDonHang.cs -> LoadSoLuongDonHang -> SP_Lay_SoLuongDonHang(@username, @HangKhoan=-1, @DaXoa=false)
   */
  async getUserStatusCounts(username: string, hangKhoan: number = -1): Promise<any[]> {
    try {
      const results = await this.sequelize.query(
        `EXEC SP_Lay_SoLuongDonHang
          @username = :username,
          @HangKhoan = :hangKhoan,
          @DaXoa = 0`,
        { replacements: { username, hangKhoan }, type: 'SELECT' as const },
      );
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error('Error in getUserStatusCounts:', (error as any).message);
      return [];
    }
  }

  /**
   * Delete order via SP (DanhSachDonHang.aspx)
   * Matches: DanhSachDonHang.cs -> lbtDelete_Click -> bLL.XoaDonHang(id, username)
   * Uses: SP_Xoa_DonHang @ID, @NguoiTao
   * Note: Only for orders with trangthaiOrder='Received' and HangKhoan=false (enforced by UI)
   */
  async xoaDonHangSP(id: number, nguoiTao: string): Promise<{ success: boolean }> {
    try {
      await this.sequelize.query(
        `EXEC SP_Xoa_DonHang @ID = :id, @NguoiTao = :nguoiTao`,
        { replacements: { id, nguoiTao }, type: QueryTypes.RAW },
      );
      return { success: true };
    } catch (error) {
      console.error('Error in xoaDonHangSP:', (error as any).message);
      return { success: false };
    }
  }

  /**
   * Update order for user (SuaDonHang.aspx)
   * Matches: SuaDonHang.cs -> btCapNhat_Click -> dBConnect.CapNhatDonHangSimple(...)
   * Uses: SP_CapNhatDonHangSimple (NOT CoTamTinh — different params: has @LoaiHangID, @MaSoHang; no @cong/@tax/@shipUSA)
   */
  async updateForUser(id: number, dto: {
    websiteName: string;
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
    saleOff: number;
    loaiHangId?: number | null;
    maSoHang?: string;
    quocGiaId?: number | null;
    nguoiTao: string;
  }): Promise<{ success: boolean }> {
    try {
      await this.sequelize.query(
        `EXEC SP_CapNhatDonHangSimple
          @ID = :id,
          @WebsiteName = :websiteName,
          @username = :username,
          @linkweb = :linkWeb,
          @linkhinh = :linkHinh,
          @corlor = :color,
          @size = :size,
          @soluong = :soLuong,
          @dongiaweb = :donGiaWeb,
          @loaitien = :loaiTien,
          @ghichu = :ghiChu,
          @tygia = :tyGia,
          @saleoff = :saleOff,
          @LoaiHangID = :loaiHangId,
          @MaSoHang = :maSoHang,
          @QuocGiaID = :quocGiaId,
          @NguoiTao = :nguoiTao`,
        {
          replacements: {
            id,
            websiteName: dto.websiteName || '',
            username: dto.username || '',
            linkWeb: dto.linkWeb || '',
            linkHinh: dto.linkHinh || '',
            color: dto.color || '',
            size: dto.size || '',
            soLuong: dto.soLuong,
            donGiaWeb: dto.donGiaWeb,
            loaiTien: dto.loaiTien || 'USD',
            ghiChu: dto.ghiChu || '',
            tyGia: dto.tyGia,
            saleOff: dto.saleOff || 0,
            loaiHangId: dto.loaiHangId ?? null,
            maSoHang: dto.maSoHang || '',
            quocGiaId: dto.quocGiaId ?? null,
            nguoiTao: dto.nguoiTao,
          },
          type: QueryTypes.RAW,
        },
      );
      return { success: true };
    } catch (error) {
      console.error('Error in updateForUser:', (error as any).message);
      return { success: false };
    }
  }
}
