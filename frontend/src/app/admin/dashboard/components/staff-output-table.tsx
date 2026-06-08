'use client';

import { DataTable } from '@/app/components/admin';
import { DashboardStaffOutput } from '@/lib/api';

interface StaffOutputTableProps {
  data: DashboardStaffOutput[];
  loading?: boolean;
}

const fmtInt = (v: number) => (v ?? 0).toLocaleString('vi-VN');
const fmtKg = (v: number) => (v ?? 0).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/**
 * Bảng sản lượng mỗi nhân viên theo tháng: số đơn + số kg.
 */
export function StaffOutputTable({ data, loading }: StaffOutputTableProps) {
  const columns = [
    { key: 'nhanVien', label: 'Nhân viên' },
    { key: 'thang', label: 'Tháng', align: 'center' as const, width: '120px' },
    {
      key: 'soDon',
      label: 'Số đơn',
      align: 'right' as const,
      render: (v: number) => fmtInt(v),
    },
    {
      key: 'sanLuongKg',
      label: 'Sản lượng (kg)',
      align: 'right' as const,
      render: (v: number) => fmtKg(v),
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-[#14264b]/20 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-[#14264b] mb-3">Sản lượng nhân viên theo tháng</h3>
      <DataTable
        columns={columns}
        data={(data || []).map((r) => ({ ...r, id: `${r.nhanVien}-${r.thang}` }))}
        rowKey="id"
        loading={loading}
        emptyMessage="Không có dữ liệu trong khoảng đã chọn"
      />
    </div>
  );
}
