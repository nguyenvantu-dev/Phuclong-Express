import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ShippersService } from './shippers.service';
import { QueryShipperDto, CreateShipperDto, UpdateShipperDto } from './dto/shipper.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Shippers Controller
 *
 * Handles shipper management operations
 */
@Controller('shippers')
@UseGuards(JwtAuthGuard)
export class ShippersController {
  constructor(private readonly shippersService: ShippersService) {}

  /**
   * Get all shippers
   * Matches: LoadDanhSachShipper() in Shipper_LietKe.cs
   */
  @Get()
  async getShippers() {
    return this.shippersService.getShippers();
  }

  /**
   * Get shipper by ID
   * Matches: LoadDataShipper() in Shipper_Them.cs
   */
  @Get(':id')
  async getShipperById(@Param('id') id: number) {
    return this.shippersService.getShipperById(id);
  }

  /**
   * Create new shipper
   * Matches: btCapNhat_Click() -> ThemShipper() in Shipper_Them.cs
   */
  @Post()
  async createShipper(@Body() createDto: CreateShipperDto) {
    return this.shippersService.createShipper(createDto, 'admin');
  }

  /**
   * Update shipper
   * Matches: btCapNhat_Click() -> CapNhatShipper() in Shipper_Them.cs
   */
  @Put(':id')
  async updateShipper(
    @Param('id') id: number,
    @Body() updateDto: UpdateShipperDto,
  ) {
    return this.shippersService.updateShipper(id, updateDto, 'admin');
  }

  /**
   * Delete shipper
   * Matches: gvShipper_RowDeleting() -> XoaShipper() in Shipper_LietKe.cs
   */
  @Delete(':id')
  async deleteShipper(@Param('id') id: number) {
    return this.shippersService.deleteShipper(id, 'admin');
  }
}
