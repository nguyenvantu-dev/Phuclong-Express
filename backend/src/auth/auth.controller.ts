import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/**
 * Auth Controller
 *
 * Handles authentication endpoints.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Authenticate user with username and password
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * POST /auth/register
   * Register a new user
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  /**
   * GET /auth/profile
   * Get current user profile
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req: any) {
    return {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      roles: req.user.roles,
    };
  }

  // ========== Role Endpoints ==========

  /**
   * GET /auth/roles - Get all roles
   */
  @Get('roles')
  async getRoles() {
    return this.authService.getRoles();
  }

  /**
   * POST /auth/roles - Create new role
   */
  @UseGuards(JwtAuthGuard)
  @Post('roles')
  async createRole(@Body() body: { roleName: string }, @Request() req: any) {
    return this.authService.createRole(body.roleName, req.user?.username || 'system');
  }

  /**
   * DELETE /auth/roles/:id - Delete role
   */
  @Delete('roles/:id')
  async deleteRole(@Param('id') id: number) {
    return this.authService.deleteRole(Number(id));
  }
}
