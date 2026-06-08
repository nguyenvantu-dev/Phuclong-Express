import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Dashboard Controller
 *
 * Endpoint thống kê cho trang admin/dashboard.
 * Tất cả nhận ?fromDate&toDate (dd/MM/yyyy); mặc định tháng hiện tại.
 */
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /** KH mới theo ngày. */
  @Get('new-customers')
  async getNewCustomers(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getNewCustomersByDay(query.fromDate, query.toDate);
  }

  /** Doanh thu theo ngày (đơn đã hoàn tất). */
  @Get('revenue')
  async getRevenue(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getRevenueByDay(query.fromDate, query.toDate);
  }

  /** Sản lượng (kg) theo ngày. */
  @Get('output-daily')
  async getOutputDaily(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getOutputByDay(query.fromDate, query.toDate);
  }

  /** Sản lượng mỗi nhân viên theo tháng (số đơn + kg). */
  @Get('output-by-staff')
  async getOutputByStaff(@Query() query: DashboardQueryDto) {
    return this.dashboardService.getOutputByStaff(query.fromDate, query.toDate);
  }
}
