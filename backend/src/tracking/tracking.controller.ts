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
import { TrackingService } from './tracking.service';
import { CreateTrackingDto } from './dto/create-tracking.dto';
import { UpdateTrackingDto } from './dto/update-tracking.dto';
import { QueryTrackingDto } from './dto/query-tracking.dto';
import { MassUpdateTrackingDto } from './dto/mass-update-tracking.dto';

/**
 * Tracking Controller
 *
 * Handles tracking CRUD endpoints.
 *
 * Endpoints:
 * - GET /tracking - List tracking with filters and pagination
 * - GET /tracking/counts - Get tracking counts by status
 * - GET /tracking/:id - Get tracking by ID
 * - POST /tracking - Create new tracking
 * - PUT /tracking/:id - Update tracking
 * - DELETE /tracking/:id - Soft delete tracking
 * - POST /tracking/mass-delete - Mass delete tracking
 * - POST /tracking/mass-status - Mass update status
 * - POST /tracking/mass-complete - Mass complete tracking
 * - GET /tracking/:id/details - Get tracking details
 * - GET /tracking/:id/history - Get tracking status history
 * - POST /tracking/:id/history - Add tracking status
 */
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  /**
   * GET /tracking
   * List tracking with filters and pagination
   */
  @Get()
  async findAll(
    @Query() query: QueryTrackingDto,
  ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    return this.trackingService.findAll(query);
  }

  /**
   * GET /tracking/counts
   * Get tracking counts by status
   */
  @Get('counts')
  async getCounts(): Promise<any> {
    return this.trackingService.getCounts();
  }

  /**
   * GET /tracking/search/:code
   * Public endpoint to search tracking by code
   */
  @Get('search/:code')
  async searchByCode(@Param('code') code: string): Promise<any> {
    return this.trackingService.searchByCode(code);
  }

  /**
   * GET /tracking/:id
   * Get tracking by ID
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.trackingService.findOne(id);
  }

  /**
   * POST /tracking
   * Create new tracking
   */
  @Post()
  async create(@Body() createTrackingDto: CreateTrackingDto): Promise<any> {
    return this.trackingService.create(createTrackingDto);
  }

  /**
   * PUT /tracking/:id
   * Update tracking
   */
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTrackingDto: UpdateTrackingDto,
  ): Promise<any> {
    return this.trackingService.update(id, updateTrackingDto);
  }

  /**
   * DELETE /tracking/:id
   * Soft delete tracking
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.trackingService.remove(id);
  }

  /**
   * POST /tracking/mass-delete
   * Mass delete tracking
   */
  @Post('mass-delete')
  @HttpCode(HttpStatus.OK)
  async massDelete(@Body() body: { ids: number[] }): Promise<{ deleted: number }> {
    return this.trackingService.massDelete(body.ids);
  }

  /**
   * POST /tracking/mass-status
   * Mass update status
   */
  @Post('mass-status')
  @HttpCode(HttpStatus.OK)
  async massStatus(@Body() massUpdateDto: MassUpdateTrackingDto): Promise<{ updated: number }> {
    return this.trackingService.massStatus(massUpdateDto);
  }

  /**
   * POST /tracking/mass-complete
   * Mass complete tracking
   */
  @Post('mass-complete')
  @HttpCode(HttpStatus.OK)
  async massComplete(@Body() body: { ids: number[] }): Promise<{ updated: number }> {
    return this.trackingService.massComplete(body.ids);
  }

  /**
   * POST /tracking/mass-complete-all
   * Mass complete tracking with filters
   */
  @Post('mass-complete-all')
  @HttpCode(HttpStatus.OK)
  async massCompleteAll(@Body() query: QueryTrackingDto): Promise<{ updated: number }> {
    return this.trackingService.massCompleteAll(query);
  }

  /**
   * GET /tracking/:id/details
   * Get tracking details
   */
  @Get(':id/details')
  async findDetails(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.trackingService.findDetails(id);
  }

  /**
   * GET /tracking/:id/history
   * Get tracking status history
   */
  @Get(':id/history')
  async findHistory(@Param('id', ParseIntPipe) id: number): Promise<any[]> {
    return this.trackingService.findHistory(id);
  }

  /**
   * POST /tracking/:id/history
   * Add tracking status
   */
  @Post(':id/history')
  async addHistory(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { ghiChu: string },
  ): Promise<any> {
    return this.trackingService.addHistory(id, body.ghiChu);
  }

  /**
   * PUT /tracking/:id/history/:historyId
   * Update tracking status
   */
  @Put(':id/history/:historyId')
  async updateHistory(
    @Param('id', ParseIntPipe) id: number,
    @Param('historyId', ParseIntPipe) historyId: number,
    @Body() body: { ghiChu: string },
  ): Promise<any> {
    return this.trackingService.updateHistory(historyId, body.ghiChu);
  }

  /**
   * DELETE /tracking/:id/history/:historyId
   * Delete tracking status
   */
  @Delete(':id/history/:historyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHistory(
    @Param('id', ParseIntPipe) id: number,
    @Param('historyId', ParseIntPipe) historyId: number,
  ): Promise<void> {
    return this.trackingService.deleteHistory(historyId);
  }
}
