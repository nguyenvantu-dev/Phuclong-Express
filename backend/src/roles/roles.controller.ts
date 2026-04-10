import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /** GET /roles - List all roles */
  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  /** PATCH /roles/:id - Rename a role */
  @Patch(':id')
  async update(@Param('id') id: string, @Body('name') name: string) {
    await this.rolesService.update(id, name);
    return { success: true };
  }

  /** DELETE /roles/:id - Delete a role */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
    return { success: true };
  }
}
