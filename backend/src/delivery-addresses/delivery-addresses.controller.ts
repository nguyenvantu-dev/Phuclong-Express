import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { DeliveryAddressesService } from './delivery-addresses.service';
import type { QueryDeliveryAddressDto, CreateDeliveryAddressDto, UpdateDeliveryAddressDto } from './delivery-addresses.service';

@Controller('delivery-addresses')
export class DeliveryAddressesController {
  constructor(private readonly deliveryAddressesService: DeliveryAddressesService) {}

  @Get()
  async findAll(@Query() query: QueryDeliveryAddressDto) {
    return this.deliveryAddressesService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.deliveryAddressesService.findOne(Number(id));
    return { data };
  }

  @Post()
  async create(
    @Body() createDto: CreateDeliveryAddressDto,
    @Headers('x-username') username: string,
  ) {
    return this.deliveryAddressesService.create(createDto, username || 'system');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDeliveryAddressDto,
    @Headers('x-username') username: string,
  ) {
    return this.deliveryAddressesService.update({ ...updateDto, id: Number(id) }, username || 'system');
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-username') username: string,
  ) {
    return this.deliveryAddressesService.remove(Number(id), username || 'system');
  }
}
