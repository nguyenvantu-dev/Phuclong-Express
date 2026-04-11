import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
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
