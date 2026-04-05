import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrdersService } from './orders.service';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { QueryOrderListDto } from './dto/query-order-list.dto';
import { MassUpdateDto, MassDeleteDto, MassCompleteDto, MassReceivedDto, MassShippedDto } from './dto/mass-update.dto';
import { UpdateOrderNoteDto } from './dto/update-order-note.dto';
import { BatchUpdateNoteDto } from './dto/batch-update-note.dto';
import { UpdateReturnDateDto } from './dto/update-return-date.dto';
import { ImportOrdersDto } from './dto/import-orders.dto';
import { QueryQLDatHangDto, QLDatHangResponseDto } from './dto/query-qldathang.dto';
import { CreateQuickOrderDto, CreateQuickOrdersDto } from './dto/create-quick-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Orders Controller
 *
 * Handles order CRUD endpoints.
 */
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ========== SPECIAL ROUTES FIRST (before :id routes) ==========

  /**
   * GET /orders/usernames
   * Get list of usernames for can hang dropdown
   */
  @Get('usernames')
  async getUsernames(): Promise<{ username: string }[]> {
    return this.ordersService.getUsernames();
  }

  /**
   * GET /orders/batches
   * Get list of batches (DotHang) for can hang dropdown
   */
  @Get('batches')
  async getBatches(): Promise<{ tenDotHang: string }[]> {
    return this.ordersService.getBatches();
  }

  /**
   * GET /orders/product-types
   * Get product types (LoaiHang) for can hang dropdown
   */
  @Get('product-types')
  async getProductTypes(): Promise<{ data: Array<{ LoaiHangID: number; TenLoaiHang: string }> }> {
    return this.ordersService.getProductTypes();
  }

  /**
   * GET /orders/status-counts
   * Get order counts by status for can hang page
   */
  @Get('status-counts')
  async getStatusCounts(): Promise<Record<string, number>> {
    return this.ordersService.getStatusCounts();
  }

  /**
   * GET /orders/countries
   * Get list of countries (QuocGia) for dropdown
   */
  @Get('countries')
  async getQuocGia(): Promise<{ QuocGiaID: number; TenQuocGia: string; PhiShipVeVN: number }[]> {
    return this.ordersService.getQuocGia();
  }

  /**
   * GET /orders/deleted
   * List deleted orders with filters
   */
  @Get('deleted')
  async findDeleted(@Query() query: QueryOrderDto): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    return this.ordersService.findDeleted(query);
  }

  /**
   * POST /orders/calculate-shipping
   * Calculate shipping fee based on weight, product type, currency, and user
   */
  @Post('calculate-shipping')
  @HttpCode(HttpStatus.OK)
  async calculateShipping(
    @Body() body: { weight: number; loaiHangId: number; loaiTien: string; username: string },
  ): Promise<{ shippingFee: number }> {
    return this.ordersService.calculateShipping(body);
  }

  // ========== MAIN CRUD ROUTES ==========

  /**
   * GET /orders/exchange-rates
   * Get exchange rates (TyGia) for EditOrderDetail
   * Converted from: EditOrderDetail.cs - LoadDataTyGia()
   */
  @Get('exchange-rates')
  async getExchangeRates(): Promise<{ name: string; tyGiaVND: number; congShipVeVN: number }[]> {
    return this.ordersService.getExchangeRates();
  }

  /**
   * GET /orders/product-types-detail
   * Get product types (LoaiHang) for EditOrderDetail
   * Converted from: EditOrderDetail.cs - LoadDataLoaiHang()
   */
  @Get('product-types-detail')
  async getLoaiHang(): Promise<{ LoaiHangID: number; TenLoaiHang: string }[]> {
    return this.ordersService.getLoaiHang();
  }

  /**
   * POST /orders/calculate-fee
   * Calculate service fee (GiaTienCong) for EditOrderDetail
   * Converted from: EditOrderDetail.cs - drLoaitien_SelectedIndexChanged()
   *
   * Body: { loaiTien: string, donGiaWeb: number, username: string }
   */
  @Post('calculate-fee')
  @HttpCode(HttpStatus.OK)
  async getGiaTienCong(
    @Body() body: { loaiTien: string; donGiaWeb: number; username: string },
  ): Promise<{ tienCong1Mon: number; tinhTheoPhanTram: boolean }> {
    return this.ordersService.getGiaTienCong(body.loaiTien, body.donGiaWeb, body.username);
  }

  /**
   * GET /orders
   * List orders with filters and pagination
   */
  @Get()
  async findAll(@Query() query: QueryOrderDto): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    return this.ordersService.findAll(query);
  }

  /**
   * POST /orders/list
   * List orders with filters and pagination (POST method for complex filters)
   */
  @Post('list')
  async findAllPost(@Body() query: QueryOrderListDto): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    return this.ordersService.findAll(query as QueryOrderDto);
  }

  /**
   * POST /orders/qldathang-list
   * Get orders for Order Management List page (QLDatHang_LietKe)
   * Converted from: QLDatHang_LietKe.aspx.cs
   *
   * Response matches DonHangPhanTrang from C#:
   * - totalItem: total count
   * - danhSachDonHang: list of orders
   * - page, limit: pagination
   */
  @Post('qldathang-list')
  async getQLDatHangList(@Body() query: QueryQLDatHangDto): Promise<QLDatHangResponseDto> {
    return this.ordersService.getQLDatHangList(query);
  }

  /**
   * POST /orders
   * Create new order
   */
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(createOrderDto);
  }

  /**
   * POST /orders/quick
   * Create quick order (DatHangM - simple order)
   * Converted from: DatHangM.aspx - ThemDatHangSimple
   */
  @Post('quick')
  @HttpCode(HttpStatus.OK)
  async createQuickOrder(
    @Body() createQuickOrderDto: CreateQuickOrderDto,
  ): Promise<{ success: boolean; error?: string }> {
    return this.ordersService.createQuickOrder(createQuickOrderDto);
  }

  /**
   * POST /orders/quick/calculate
   * Calculate service fee for QLDatHang_Them footer form
   * Converted from: QLDatHang_Them.cs - giaTienCong calculation
   */
  @Post('quick/calculate')
  @HttpCode(HttpStatus.OK)
  async calculateTienCong(
    @Body() params: { loaiTien: string; donGiaWeb: number; soLuong: number; saleOff: number; cong: number; tyGia: number; username: string },
  ): Promise<{ tienCongVnd: number; giaSauOffUsd: number; tongTienUsd: number; tongTienVnd: number }> {
    return this.ordersService.calculateTienCong(params);
  }

  /**
   * POST /orders/quick/upload-image
   * Upload and resize image for QLDatHang_Them footer form
   * Converted from: QLDatHang_Them.cs - fuHinhAnh upload
   */
  @Post('quick/upload-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadQuickOrderImage(
    @UploadedFile() file: any,
  ): Promise<{ linkHinh: string }> {
    return this.ordersService.uploadQuickOrderImage(file);
  }

  /**
   * POST /orders/quick/add
   * Create order for QLDatHang_Them page (uses SP_Them_DonHang_Simple_CoTamTinh)
   * Converted from: QLDatHang_Them.cs - Insert command
   */
  @Post('quick/add')
  @HttpCode(HttpStatus.OK)
  async createQuickOrderAdd(
    @Body() createQuickOrderDto: CreateQuickOrderDto,
  ): Promise<{ success: boolean; error?: string }> {
    return this.ordersService.createQuickOrderCoTamTinh(createQuickOrderDto);
  }

  /**
   * POST /orders/quick/batch
   * Create multiple quick orders at once
   * Converted from: DatHangM.aspx - GuiYeuCau
   */
  @Post('quick/batch')
  @HttpCode(HttpStatus.OK)
  async createQuickOrders(
    @Body() createQuickOrdersDto: CreateQuickOrdersDto,
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    return this.ordersService.createQuickOrders(createQuickOrdersDto);
  }

  /**
   * POST /orders/mass-delete
   * Mass soft delete orders
   */
  @Post('mass-delete')
  @HttpCode(HttpStatus.OK)
  async massDelete(@Body() massDeleteDto: MassDeleteDto): Promise<{ deleted: number }> {
    return this.ordersService.massDelete(massDeleteDto);
  }

  /**
   * POST /orders/mass-update
   * Mass update orders
   */
  @Post('mass-update')
  @HttpCode(HttpStatus.OK)
  async massUpdate(@Body() massUpdateDto: MassUpdateDto): Promise<{ updated: number }> {
    return this.ordersService.massUpdate(massUpdateDto);
  }

  /**
   * POST /orders/mass-complete
   * Mass complete orders using stored procedure (giống EditOrder logic)
   */
  @Post('mass-complete')
  @HttpCode(HttpStatus.OK)
  async massComplete(@Body() massCompleteDto: MassCompleteDto): Promise<{ completed: number }> {
    const ids = massCompleteDto.ids.join(',');
    return this.ordersService.massComplete(ids, massCompleteDto.username);
  }

  /**
   * POST /orders/mass-received
   * Mass received orders using stored procedure (giống EditOrder logic)
   * Converted from: EditOrder.cs - lbtMassReceived_Click + DBConnect.MassReceived
   * Checks kỳ đóng before executing
   * Logs action to system logs
   */
  @Post('mass-received')
  @HttpCode(HttpStatus.OK)
  async massReceived(@Body() massReceivedDto: MassReceivedDto): Promise<{ received: number }> {
    const ids = massReceivedDto.ids.join(',');
    return this.ordersService.massReceived(ids, massReceivedDto.username);
  }

  /**
   * POST /orders/mass-shipped
   * Mass shipped orders using stored procedure (giống EditOrder logic)
   * Converted from: EditOrder.cs - lbtMassShipped_Click + DBConnect.MassShipped
   * Calls: SP_CapNhat_MassShipped (@id)
   * Logs action to system logs
   */
  @Post('mass-shipped')
  @HttpCode(HttpStatus.OK)
  async massShipped(@Body() massShippedDto: MassShippedDto): Promise<{ shipped: number }> {
    const ids = massShippedDto.ids.join(',');
    return this.ordersService.massShipped(ids, massShippedDto.username);
  }

  /**
   * POST /orders/import
   * Import orders from Excel
   */
  @Post('import')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async importOrders(
    @UploadedFile() file: any,
    @Body() importDto: ImportOrdersDto,
  ): Promise<{ imported: number; errors?: string[] }> {
    return this.ordersService.importOrders(file, importDto);
  }

  // ========== PARAMETERIZED ROUTES (must come last) ==========

  /**
   * GET /orders/:id
   * Get order by ID
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<Order> {
    return this.ordersService.findOne(id, includeDeleted === 'true');
  }

  /**
   * PUT /orders/:id
   * Update order
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    return this.ordersService.update(id, updateOrderDto);
  }

  /**
   * DELETE /orders/:id
   * Soft delete order
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.remove(id);
  }

  /**
   * POST /orders/:id/restore
   * Restore soft-deleted order
   */
  @Post(':id/restore')
  async restore(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.restore(id);
  }

  /**
   * GET /orders/:id/details
   * Get order details (products in order)
   */
  @Get(':id/details')
  async findDetails(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeDeleted') includeDeleted?: string,
  ): Promise<Order> {
    return this.ordersService.findOne(id, includeDeleted === 'true');
  }

  /**
   * PUT /orders/note/batch
   * Add additional note to one or more orders (batch)
   * Body: { ids: number[], boSungGhiChu: string }
   */
  @Put('note/batch')
  @HttpCode(HttpStatus.OK)
  async updateNoteBatch(
    @Body() batchDto: BatchUpdateNoteDto,
  ): Promise<any> {
    console.log('[updateNoteBatch] received:', JSON.stringify(batchDto));
    return this.ordersService.updateNote(batchDto.ids, { boSungGhiChu: batchDto.boSungGhiChu });
  }

  /**
   * PUT /orders/:id/note
   * Add additional note to single order
   */
  @Put(':id/note')
  async updateNoteSingle(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNoteDto: UpdateOrderNoteDto,
  ): Promise<Order> {
    return this.ordersService.updateNote([id], updateNoteDto);
  }

  /**
   * PUT /orders/:id/return-date
   * Update return date to Vietnam
   */
  @Put(':id/return-date')
  async updateReturnDate(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReturnDateDto: UpdateReturnDateDto,
  ): Promise<Order> {
    return this.ordersService.updateReturnDate(id, updateReturnDateDto, updateReturnDateDto.username);
  }

  // ========== EDIT ORDER DETAIL ENDPOINTS (converted from EditOrderDetail.cs) ==========

  /**
   * POST /orders/:id/upload-image
   * Upload and resize image to 640x480 for EditOrderDetail
   * Converted from: EditOrderDetail.cs - fuHinhAnh upload logic
   *
   * Saves to: /imgLink/YYYYMM/ directory
   */
  @Post(':id/upload-image')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
  ): Promise<{ linkHinh: string }> {
    return this.ordersService.uploadImage(id, file);
  }

  /**
   * PUT /orders/:id/detail
   * Update order detail with full edit flow
   * Converted from: EditOrderDetail.cs - btCapNhat_Click
   *
   * Checks: SP_KiemTra_DuocCapNhatDonHang (kỳ đóng)
   * Updates: SP_CapNhatDonHang
   * Logs: SystemLogs
   * Updates: ngayVeVN via SP_CapNhatNgayVeVN
   */
  @Put(':id/detail')
  async updateOrderDetail(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ): Promise<{ success: boolean; error?: string }> {
    return this.ordersService.updateOrderDetail(id, body);
  }

  /**
   * PUT /orders/tracking-number
   * Update tracking number for LIST_ORDER (TrackingNumber.aspx)
   * Uses orderNumber (string) as param, matching C# capNhatTrackingNumber
   */
  @Put('tracking-number')
  async updateTrackingNumber(
    @Body() body: { orderNumber: string; trackingNumber: string; ngayNhanTaiNuocNgoai: string; trackingLink: string },
  ): Promise<{ success: boolean; message: string }> {
    return this.ordersService.updateTrackingNumber(body.orderNumber, body.trackingNumber, body.ngayNhanTaiNuocNgoai, body.trackingLink);
  }

  /**
   * POST /orders/search-by-tracking
   * Search orders by order number OR tracking number (TrackingNumber.aspx)
   * Calls BLL.LayDanhSachListOrder with both parameters
   */
  @Post('search-by-tracking')
  async searchByOrderOrTracking(
    @Body() body: { orderNumber?: string; trackingNumber?: string; page?: number; limit?: number },
  ): Promise<{ data: any[]; total: number }> {
    return this.ordersService.searchByOrderOrTracking(body.orderNumber || '', body.trackingNumber || '', body.page, body.limit);
  }

  /**
   * GET /orders/totals
   * Get totals for QLDatHang_LietKe page (Total count, Total price, Total VND)
   */
  @Get('totals')
  async getTotals(@Query() query: QueryOrderDto): Promise<{ totalCount: number; totalPrice: number; totalVnd: number }> {
    return this.ordersService.getTotals(query);
  }
}
