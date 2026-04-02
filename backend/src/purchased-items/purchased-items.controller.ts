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
import { PurchasedItemsService } from './purchased-items.service';
import { CreatePurchasedItemDto } from './dto/create-purchased-item.dto';
import { UpdatePurchasedItemDto } from './dto/update-purchased-item.dto';
import { QueryPurchasedItemDto, MassUpdatePurchasedItemDto, ShareOrdersDto } from './dto/query-purchased-item.dto';

/**
 * Purchased Items Controller
 *
 * Endpoints:
 * - GET /purchased-items - List purchased items with filters
 * - GET /purchased-items/:id - Get purchased item by ID
 * - POST /purchased-items - Create new purchased item
 * - PUT /purchased-items/:id - Update purchased item
 * - DELETE /purchased-items/:id - Delete purchased item
 * - POST /purchased-items/mass-delete - Mass delete
 * - POST /purchased-items/mass-update - Mass update
 * - POST /purchased-items/share - Share orders with totals
 */
@Controller('purchased-items')
export class PurchasedItemsController {
  constructor(private readonly purchasedItemsService: PurchasedItemsService) {}

  @Get()
  async findAll(
    @Query() query: QueryPurchasedItemDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.purchasedItemsService.findAll(query);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<any> {
    return this.purchasedItemsService.findOne(id);
  }

  @Post()
  async create(
    @Body() createPurchasedItemDto: CreatePurchasedItemDto,
  ): Promise<any> {
    return this.purchasedItemsService.create(createPurchasedItemDto);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePurchasedItemDto: UpdatePurchasedItemDto,
  ): Promise<any> {
    return this.purchasedItemsService.update(id, updatePurchasedItemDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.purchasedItemsService.remove(id);
  }

  @Post('mass-delete')
  @HttpCode(HttpStatus.OK)
  async massDelete(
    @Body() body: { ids: number[] },
  ): Promise<{ deleted: number }> {
    return this.purchasedItemsService.massDelete(body.ids);
  }

  @Post('mass-update')
  @HttpCode(HttpStatus.OK)
  async massUpdate(
    @Body() massUpdateDto: MassUpdatePurchasedItemDto,
  ): Promise<{ updated: number }> {
    return this.purchasedItemsService.massUpdate(massUpdateDto);
  }

  @Post('share')
  @HttpCode(HttpStatus.OK)
  async share(
    @Body() shareOrdersDto: ShareOrdersDto,
  ): Promise<{ success: boolean }> {
    return this.purchasedItemsService.shareOrders(shareOrdersDto);
  }
}
