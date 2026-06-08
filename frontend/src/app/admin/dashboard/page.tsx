'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FiUsers, FiDollarSign, FiPackage, FiShoppingBag } from 'react-icons/fi';
import { KPICard } from '@/app/components/admin';
import { useAuth } from '@/hooks/use-auth-context';
import {
  getDashboardNewCustomers,
  getDashboardRevenue,
  getDashboardOutputDaily,
  getDashboardOutputByStaff,
} from '@/lib/api';
import { DateRangeFilter } from './components/date-range-filter';
import { DailyTrendChart } from './components/daily-trend-chart';
import { StaffOutputTable } from './components/staff-output-table';

/** Khoảng mặc định: đầu→cuối tháng hiện tại (dd/MM/yyyy). */
const getDefaultRange = () => {
  const now = new Date();
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  return {
    fromDate: fmt(new Date(now.getFullYear(), now.getMonth(), 1)),
    toDate: fmt(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
};

const fmtMoney = (v: number) => (v ?? 0).toLocaleString('vi-VN');
const fmtKg = (v: number) =>
  (v ?? 0).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const sumBy = <T,>(rows: T[] | undefined, key: keyof T): number =>
  (rows || []).reduce((acc, r) => acc + (Number(r[key]) || 0), 0);

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const isAdmin = user?.roles?.includes('Admin') ?? false;

  const [draft, setDraft] = useState(getDefaultRange);
  const [applied, setApplied] = useState(draft);

  // Chỉ Admin được xem dashboard — non-admin redirect về login (chặn ở giao diện).
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.replace('/login');
    }
  }, [authLoading, isAdmin, router]);

  const newCustomers = useQuery({
    queryKey: ['dashboard-new-customers', applied],
    queryFn: () => getDashboardNewCustomers(applied.fromDate, applied.toDate),
    enabled: isAdmin,
  });
  const revenue = useQuery({
    queryKey: ['dashboard-revenue', applied],
    queryFn: () => getDashboardRevenue(applied.fromDate, applied.toDate),
    enabled: isAdmin,
  });
  const output = useQuery({
    queryKey: ['dashboard-output-daily', applied],
    queryFn: () => getDashboardOutputDaily(applied.fromDate, applied.toDate),
    enabled: isAdmin,
  });
  const staff = useQuery({
    queryKey: ['dashboard-output-staff', applied],
    queryFn: () => getDashboardOutputByStaff(applied.fromDate, applied.toDate),
    enabled: isAdmin,
  });

  const totals = useMemo(
    () => ({
      khMoi: sumBy(newCustomers.data, 'soKHMoi'),
      doanhThu: sumBy(revenue.data, 'doanhThu'),
      soDon: sumBy(revenue.data, 'soDon'),
      sanLuong: sumBy(output.data, 'sanLuongKg'),
    }),
    [newCustomers.data, revenue.data, output.data],
  );

  // Gate giao diện: chờ auth load, chặn non-admin (useEffect ở trên đã điều hướng).
  if (authLoading) {
    return <div className="p-6 text-sm text-gray-500">Đang tải…</div>;
  }
  if (!isAdmin) {
    return <div className="p-6 text-sm text-red-600">Bạn không có quyền truy cập trang này (chỉ Admin).</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#14264b]">Dashboard thống kê</h1>
        <p className="text-sm text-gray-500 mt-1">KH mới, doanh thu, sản lượng theo ngày · sản lượng nhân viên theo tháng</p>
      </div>

      <DateRangeFilter
        fromDate={draft.fromDate}
        toDate={draft.toDate}
        onChange={setDraft}
        onSearch={() => setApplied(draft)}
      />

      {/* KPI tổng hợp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Tổng KH mới" value={totals.khMoi.toLocaleString('vi-VN')} icon={<FiUsers size={28} />} />
        <KPICard label="Tổng doanh thu" value={fmtMoney(totals.doanhThu)} unit="₫" icon={<FiDollarSign size={28} />} />
        <KPICard label="Đơn hoàn tất" value={totals.soDon.toLocaleString('vi-VN')} icon={<FiShoppingBag size={28} />} />
        <KPICard label="Tổng sản lượng" value={fmtKg(totals.sanLuong)} unit="kg" icon={<FiPackage size={28} />} />
      </div>

      {/* Biểu đồ theo ngày */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DailyTrendChart
          title="Khách hàng mới / ngày"
          data={newCustomers.data || []}
          loading={newCustomers.isLoading}
          series={[{ key: 'soKHMoi', label: 'KH mới', color: '#2563eb' }]}
        />
        <DailyTrendChart
          title="Doanh thu / ngày (đơn hoàn tất)"
          data={revenue.data || []}
          loading={revenue.isLoading}
          series={[{ key: 'doanhThu', label: 'Doanh thu', color: '#16a34a' }]}
          valueFormatter={fmtMoney}
        />
        <DailyTrendChart
          title="Sản lượng (kg) / ngày"
          data={output.data || []}
          loading={output.isLoading}
          series={[{ key: 'sanLuongKg', label: 'Sản lượng', color: '#d97706' }]}
          valueFormatter={fmtKg}
        />
      </div>

      {/* Bảng nhân viên theo tháng */}
      <StaffOutputTable data={staff.data || []} loading={staff.isLoading} />
    </div>
  );
}
