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
import { InStockItemsService } from './in-stock-items.service';
import { InStockItem } from './entities/in-stock-item.entity';
import { CreateInStockItemDto } from './dto/create-in-stock-item.dto';
import { UpdateInStockItemDto } from './dto/update-in-stock-item.dto';
import { QueryInStockItemDto } from './dto/query-in-stock-item.dto';

/**
 * In-Stock Items Controller
 *
 * Endpoints:
 * - GET /in-stock-items - List in-stock items with filters
 * - GET /in-stock-items/:id - Get in-stock item by ID
 * - POST /in-stock-items - Create new in-stock item
 * - PUT /in-stock-items/:id - Update in-stock item
 * - DELETE /in-stock-items/:id - Delete in-stock item
 */
@Controller('in-stock-items')
export class InStockItemsController {
  constructor(private readonly inStockItemsService: InStockItemsService) {}

  /**
   * GET /in-stock-items
   */
  @Get()
  async findAll(
    @Query() query: QueryInStockItemDto,
  ): Promise<{ data: InStockItem[]; total: number; page: number; limit: number }> {
    return this.inStockItemsService.findAll(query);
  }

  /**
   * GET /in-stock-items/:id
   */
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<InStockItem> {
    return this.inStockItemsService.findOne(id);
  }

  /**
   * POST /in-stock-items
   */
  @Post()
  async create(
    @Body() createInStockItemDto: CreateInStockItemDto,
  ): Promise<InStockItem> {
    return this.inStockItemsService.create(createInStockItemDto);
  }

  /**
   * PUT /in-stock-items/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInStockItemDto: UpdateInStockItemDto,
  ): Promise<InStockItem> {
    return this.inStockItemsService.update(id, updateInStockItemDto);
  }

  /**
   * DELETE /in-stock-items/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.inStockItemsService.remove(id);
  }
}
