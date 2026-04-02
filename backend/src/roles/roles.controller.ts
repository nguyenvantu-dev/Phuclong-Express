import { Controller, Get } from '@nestjs/common';
import { RolesService } from './roles.service';

/**
 * Roles Controller
 *
 * Handles role-related endpoints.
 */
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * GET /roles
   * List all roles
   */
  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }
}
