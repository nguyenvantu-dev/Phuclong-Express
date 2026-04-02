import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { PeriodsService } from './periods.service';
import type { CreatePeriodDto, UpdatePeriodDto, QueryPeriodDetailDto } from './periods.service';

@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  // Period List endpoints
  @Get()
  async findAll() {
    const data = await this.periodsService.findAll();
    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.periodsService.findOne(Number(id));
    return { data };
  }

  @Post()
  async create(
    @Body() createDto: CreatePeriodDto,
    @Headers('x-username') username: string,
  ) {
    return this.periodsService.create(createDto, username || 'system');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePeriodDto,
    @Headers('x-username') username: string,
  ) {
    return this.periodsService.update({ ...updateDto, id: Number(id) }, username || 'system');
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-username') username: string,
  ) {
    return this.periodsService.remove(Number(id), username || 'system');
  }

  @Post(':id/close')
  async closePeriod(
    @Param('id') id: string,
    @Headers('x-username') username: string,
  ) {
    return this.periodsService.closePeriod(Number(id), username || 'system');
  }

  // Period Detail endpoints (ChotKy)
  @Get('details/list')
  async findAllDetails(@Query() query: QueryPeriodDetailDto) {
    return this.periodsService.findAllDetails(query);
  }

  @Post('details/:id/temp-open')
  async tempOpenPeriod(
    @Param('id') id: string,
    @Headers('x-username') username: string,
  ) {
    return this.periodsService.tempOpenPeriod(Number(id), username || 'system');
  }

  @Post('details/:id/temp-close')
  async closeTempOpenPeriod(
    @Param('id') id: string,
    @Headers('x-username') username: string,
  ) {
    return this.periodsService.closeTempOpenPeriod(Number(id), username || 'system');
  }
}
