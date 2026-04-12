import { Controller, Get } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';

@Controller('ty-gia')
export class TyGiaController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Get()
  async findAll() {
    const data = await this.exchangeRatesService.findAll();
    return { data };
  }
}
