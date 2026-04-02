import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { WebsitesService } from './websites.service';
import type { CreateWebsiteDto, UpdateWebsiteDto } from './websites.service';

@Controller('websites')
export class WebsitesController {
  constructor(private readonly websitesService: WebsitesService) {}

  @Get()
  async findAll() {
    const data = await this.websitesService.findAll();
    return { data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.websitesService.findOne(Number(id));
    return { data };
  }

  @Post()
  async create(
    @Body() createDto: CreateWebsiteDto,
    @Headers('x-username') username: string,
  ) {
    return this.websitesService.create(createDto, username || 'system');
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateWebsiteDto,
    @Headers('x-username') username: string,
  ) {
    return this.websitesService.update({ ...updateDto, id: Number(id) }, username || 'system');
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('x-username') username: string,
  ) {
    return this.websitesService.remove(Number(id), username || 'system');
  }
}
