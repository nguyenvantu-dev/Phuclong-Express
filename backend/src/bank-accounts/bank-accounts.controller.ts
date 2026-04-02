import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import type { CreateBankAccountDto, UpdateBankAccountDto } from './bank-accounts.service';

@Controller('bank-accounts')
export class BankAccountsController {
  constructor(private readonly bankAccountsService: BankAccountsService) {}

  @Get()
  async findAll() {
    const data = await this.bankAccountsService.findAll();
    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.bankAccountsService.findOne(Number(id));
    return { data };
  }

  @Post()
  async create(
    @Body() createDto: CreateBankAccountDto,
    @Headers('x-username') username: string,
  ) {
    return this.bankAccountsService.create(createDto, username || 'system');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBankAccountDto,
    @Headers('x-username') username: string,
  ) {
    return this.bankAccountsService.update({ ...updateDto, id: Number(id) }, username || 'system');
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-username') username: string,
  ) {
    return this.bankAccountsService.remove(Number(id), username || 'system');
  }
}
