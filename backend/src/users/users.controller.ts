import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { FileInterceptor } from '@nestjs/platform-express';

/**
 * Users Controller
 *
 * Handles user CRUD endpoints.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users
   * List all users
   */
  @Get()
  async findAll(@Query('keyword') keyword?: string): Promise<User[]> {
    return this.usersService.findAll(keyword);
  }

  /**
   * GET /users/:id
   * Get user by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.usersService.findByStringId(id);
  }

  /**
   * POST /users
   * Create new user
   */
  @Post()
  async create(@Body() userData: Partial<User>): Promise<User> {
    return this.usersService.create(userData);
  }

  /**
   * PUT /users/:id
   * Update user
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() userData: Partial<User>,
  ): Promise<User> {
    return this.usersService.update(id, userData);
  }

  /**
   * DELETE /users/:id
   * Delete user
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  /**
   * POST /users/clear-data
   * Clear all data for a specific user
   */
  @Post('clear-data')
  async clearUserData(@Body() body: { username: string; nguoiTao?: string }) {
    return this.usersService.clearUserData(body.username, body.nguoiTao);
  }

  /**
   * POST /users/import/sheets
   * Get sheets from uploaded Excel file
   */
  @Post('import/sheets')
  @UseInterceptors(FileInterceptor('file'))
  async getSheets(@UploadedFile() file: Express.Multer.File) {
    return this.usersService.getExcelSheets(file);
  }

  /**
   * POST /users/import/validate
   * Validate Excel data before import
   */
  @Post('import/validate')
  @UseInterceptors(FileInterceptor('file'))
  async validateImport(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { sheet: string; mode: string; editableColumns: number[] },
  ) {
    return this.usersService.validateImportData(file, body.sheet, body.mode, body.editableColumns);
  }

  /**
   * POST /users/import/execute
   * Execute the import
   */
  @Post('import/execute')
  @UseInterceptors(FileInterceptor('file'))
  async executeImport(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { sheet: string; mode: string; editableColumns: number[] },
  ) {
    return this.usersService.executeImport(file, body.sheet, body.mode, body.editableColumns);
  }

  /**
   * GET /users/:id/roles
   * Get roles for a user
   */
  @Get(':id/roles')
  async getUserRoles(@Param('id') id: string) {
    return this.usersService.getUserRoles(id);
  }

  /**
   * POST /users/:id/roles
   * Add role to user
   */
  @Post(':id/roles')
  async addRole(
    @Param('id') id: string,
    @Body() body: { roleName: string },
  ) {
    return this.usersService.addRoleToUser(id, body.roleName);
  }

  /**
   * DELETE /users/:id/roles/:roleName
   * Remove role from user
   */
  @Delete(':id/roles/:roleName')
  async removeRole(
    @Param('id') id: string,
    @Param('roleName') roleName: string,
  ) {
    return this.usersService.removeRoleFromUser(id, roleName);
  }

  /**
   * POST /users/:id/reset-password
   * Reset user password
   */
  @Post(':id/reset-password')
  async resetPassword(
    @Param('id') id: string,
    @Body() body: { password: string },
  ) {
    return this.usersService.resetPassword(id, body.password);
  }
}
