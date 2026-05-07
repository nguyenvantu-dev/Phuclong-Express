import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import type { UpdateExchangeRateDto } from './exchange-rates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('exchange-rates')
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  async findAll() {
    const data = await this.exchangeRatesService.findAll();
    return { data };
  }

  @Get('daily-rates')
  async getDailyRates(@Query('days') days?: string) {
    const daysNum = Math.min(parseInt(days || '60', 10) || 60, 60);
    const data = await this.exchangeRatesService.getDailyRates(daysNum);
    return { data };
  }

  @Get(':name/history')
  async getHistory(@Param('name') name: string) {
    const data = await this.exchangeRatesService.getHistory(name);
    return { data };
  }

  @Get(':name')
  async findOne(@Param('name') name: string) {
    const data = await this.exchangeRatesService.findOne(name);
    return { data };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':name')
  async update(
    @Param('name') name: string,
    @Body() updateDto: UpdateExchangeRateDto,
    @Request() req: any,
  ) {
    return this.exchangeRatesService.update({ ...updateDto, name }, req.user?.username || 'system');
  }
}
