import { Controller, Get, Put, Body, Param, Headers } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import type { UpdateExchangeRateDto } from './exchange-rates.service';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  async findAll() {
    const data = await this.exchangeRatesService.findAll();
    return { data };
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    const data = await this.exchangeRatesService.findOne(name);
    return { data };
  }

  @Put(':name')
  async update(
    @Param('name') name: string,
    @Body() updateDto: UpdateExchangeRateDto,
    @Headers('x-username') username: string,
  ) {
    return this.exchangeRatesService.update({ ...updateDto, name }, username || 'system');
  }
}
