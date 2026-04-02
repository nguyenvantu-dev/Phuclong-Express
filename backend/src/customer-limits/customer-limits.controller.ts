import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { CustomerLimitsService } from './customer-limits.service';
import type { QueryCustomerLimitDto, CreateCustomerLimitDto, UpdateCustomerLimitDto } from './customer-limits.service';

@Controller('customer-limits')
export class CustomerLimitsController {
  constructor(private readonly customerLimitsService: CustomerLimitsService) {}

  @Get()
  async findAll(@Query() query: QueryCustomerLimitDto) {
    return this.customerLimitsService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.customerLimitsService.findOne(Number(id));
    return { data };
  }

  @Post()
  async create(
    @Body() createDto: CreateCustomerLimitDto,
    @Headers('x-username') username: string,
  ) {
    return this.customerLimitsService.create(createDto, username || 'system');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCustomerLimitDto,
    @Headers('x-username') username: string,
  ) {
    return this.customerLimitsService.update({ ...updateDto, id: Number(id) }, username || 'system');
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-username') username: string,
  ) {
    return this.customerLimitsService.remove(Number(id), username || 'system');
  }
}
