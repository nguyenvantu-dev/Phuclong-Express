import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
  const mockSequelize = { query: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DashboardService, { provide: 'SEQUELIZE', useValue: mockSequelize }],
    }).compile();
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => jest.clearAllMocks());

  it('getNewCustomersByDay: EXEC đúng SP + map camelCase', async () => {
    mockSequelize.query.mockResolvedValueOnce([{ Ngay: '2026-06-01', SoKHMoi: 3 }]);
    const result = await service.getNewCustomersByDay('01/06/2026', '30/06/2026');

    const [sql, opts] = mockSequelize.query.mock.calls[0];
    expect(sql).toContain('SP_Dashboard_KhachHangMoiTheoNgay');
    expect(opts.replacements.tuNgay).toBe('2026-06-01');
    expect(opts.replacements.denNgay).toContain('2026-06-30');
    expect(result).toEqual([{ ngay: '2026-06-01', soKHMoi: 3 }]);
  });

  it('getRevenueByDay: map doanhThu + soDon', async () => {
    mockSequelize.query.mockResolvedValueOnce([{ Ngay: '2026-06-02', DoanhThu: 1500000, SoDon: 5 }]);
    const result = await service.getRevenueByDay('01/06/2026', '30/06/2026');
    expect(mockSequelize.query.mock.calls[0][0]).toContain('SP_Dashboard_DoanhThuTheoNgay');
    expect(result).toEqual([{ ngay: '2026-06-02', doanhThu: 1500000, soDon: 5 }]);
  });

  it('getOutputByDay: map sanLuongKg', async () => {
    mockSequelize.query.mockResolvedValueOnce([{ Ngay: '2026-06-03', SanLuongKg: 12.5 }]);
    const result = await service.getOutputByDay();
    expect(mockSequelize.query.mock.calls[0][0]).toContain('SP_Dashboard_SanLuongTheoNgay');
    expect(result).toEqual([{ ngay: '2026-06-03', sanLuongKg: 12.5 }]);
  });

  it('getOutputByStaff: map nhanVien/thang/soDon/sanLuongKg + xử lý nested array', async () => {
    mockSequelize.query.mockResolvedValueOnce([[{ NhanVien: 'cskh1', Thang: '2026-06', SoDon: 8, SanLuongKg: 40 }]]);
    const result = await service.getOutputByStaff('01/06/2026', '30/06/2026');
    expect(mockSequelize.query.mock.calls[0][0]).toContain('SP_Dashboard_SanLuongNhanVienTheoThang');
    expect(result).toEqual([{ nhanVien: 'cskh1', thang: '2026-06', soDon: 8, sanLuongKg: 40 }]);
  });

  it('mặc định khoảng ngày = tháng hiện tại khi không truyền', async () => {
    mockSequelize.query.mockResolvedValueOnce([]);
    await service.getNewCustomersByDay();
    const { tuNgay, denNgay } = mockSequelize.query.mock.calls[0][1].replacements;
    expect(tuNgay).toMatch(/^\d{4}-\d{2}-01$/); // ngày đầu tháng
    expect(denNgay).toMatch(/^\d{4}-\d{2}-\d{2} 23:59:59$/); // cuối ngày
  });

  it('trả mảng rỗng khi query lỗi', async () => {
    mockSequelize.query.mockRejectedValueOnce(new Error('db down'));
    expect(await service.getRevenueByDay()).toEqual([]);
  });
});
