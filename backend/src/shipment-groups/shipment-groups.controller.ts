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
} from '@nestjs/common';
import { ShipmentGroupsService } from './shipment-groups.service';
import { CreateShipmentGroupDto } from './dto/create-shipment-group.dto';
import { UpdateShipmentGroupDto } from './dto/update-shipment-group.dto';
import { QueryShipmentGroupDto } from './dto/query-shipment-group.dto';

/**
 * Shipment Groups Controller
 *
 * Handles shipment group (DotHang) CRUD endpoints.
 *
 * Endpoints:
 * - GET /shipment-groups - List shipment groups with filters
 * - GET /shipment-groups/:id - Get shipment group by ID
 * - POST /shipment-groups - Create new shipment group
 * - PUT /shipment-groups/:id - Update shipment group
 * - DELETE /shipment-groups/:id - Soft delete shipment group
 * - GET /shipment-groups/:username/:tenDotHang - Get shipment group by username and name
 * - PUT /shipment-groups/:username/:tenDotHang/ship - Update shipping info
 * - PUT /shipment-groups/:username/:tenDotHang/complete - Mark as complete
 */
@Controller('shipment-groups')
export class ShipmentGroupsController {
  constructor(private readonly shipmentGroupsService: ShipmentGroupsService) {}

  /**
   * GET /shipment-groups
   * List shipment groups with filters
   */
  @Get()
  async findAll(
    @Query() query: QueryShipmentGroupDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.shipmentGroupsService.findAll(query);
  }

  /**
   * GET /shipment-groups/delivered
   * List delivered shipment groups
   */
  @Get('delivered')
  async findDelivered(
    @Query() query: QueryShipmentGroupDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.shipmentGroupsService.findDelivered(query);
  }

  /**
   * GET /shipment-groups/:id
   * Get shipment group by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.shipmentGroupsService.findOne(id);
  }

  /**
   * GET /shipment-groups/user/:username
   * Get shipment groups by username
   */
  @Get('user/:username')
  async findByUsername(@Param('username') username: string): Promise<any[]> {
    return this.shipmentGroupsService.findByUsername(username);
  }

  /**
   * GET /shipment-groups/:username/:tenDotHang
   * Get shipment group by username and tenDotHang
   */
  @Get(':username/:tenDotHang')
  async findByUsernameAndTenDotHang(
    @Param('username') username: string,
    @Param('tenDotHang') tenDotHang: string,
  ): Promise<any> {
    return this.shipmentGroupsService.findByUsernameAndTenDotHang(username, tenDotHang);
  }

  /**
   * POST /shipment-groups
   * Create new shipment group
   */
  @Post()
  async create(
    @Body() createShipmentGroupDto: CreateShipmentGroupDto,
  ): Promise<any> {
    return this.shipmentGroupsService.create(createShipmentGroupDto);
  }

  /**
   * PUT /shipment-groups/:id
   * Update shipment group
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShipmentGroupDto: UpdateShipmentGroupDto,
  ): Promise<any> {
    return this.shipmentGroupsService.update(id, updateShipmentGroupDto);
  }

  /**
   * DELETE /shipment-groups/:id
   * Soft delete shipment group
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.shipmentGroupsService.remove(id);
  }

  /**
   * PUT /shipment-groups/:username/:tenDotHang/ship
   * Update shipping info for shipment group
   */
  @Put(':username/:tenDotHang/ship')
  async updateShipping(
    @Param('username') username: string,
    @Param('tenDotHang') tenDotHang: string,
    @Body() body: {
      shipperId: number;
      ngayGuiHang: string;
      soVanDon: string;
      phiShipTrongNuoc: number;
    },
  ): Promise<any> {
    return this.shipmentGroupsService.updateShipping(
      username,
      tenDotHang,
      body.shipperId,
      body.ngayGuiHang,
      body.soVanDon,
      body.phiShipTrongNuoc,
    );
  }

  /**
   * PUT /shipment-groups/:username/:tenDotHang/complete
   * Mark shipment group as complete
   */
  @Put(':username/:tenDotHang/complete')
  async complete(
    @Param('username') username: string,
    @Param('tenDotHang') tenDotHang: string,
  ): Promise<any> {
    return this.shipmentGroupsService.complete(username, tenDotHang);
  }
}
