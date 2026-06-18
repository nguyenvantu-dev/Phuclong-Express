'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DataTable } from '@/app/components/admin';
import { DashboardStaffOutput, getDashboardOutputDetail } from '@/lib/api';

interface StaffOutputTableProps {
  data: DashboardStaffOutput[];
  loading?: boolean;
}

const fmtInt = (v: number) => (v ?? 0).toLocaleString('vi-VN');
const fmtKg = (v: number) =>
  (v ?? 0).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const summaryColumns = [
  { key: 'nhanVien', label: 'Nhân viên' },
  { key: 'thang', label: 'Tháng', align: 'center' as const, width: '120px' },
  { key: 'soDon', label: 'Số đơn', align: 'right' as const, render: (v: number) => fmtInt(v) },
  { key: 'sanLuongKg', label: 'Sản lượng (kg)', align: 'right' as const, render: (v: number) => fmtKg(v) },
];

const detailColumns = [
  { key: 'ngayGhiNo', label: 'Ngày ghi nợ', width: '120px' },
  { key: 'khachHang', label: 'Khách hàng' },
  { key: 'noiDung', label: 'Nội dung' },
  { key: 'sanLuongKg', label: 'Sản lượng (kg)', align: 'right' as const, render: (v: number) => fmtKg(v) },
  { key: 'ghiChu', label: 'Ghi chú' },
];

export function StaffOutputTable({ data, loading }: StaffOutputTableProps) {
  const [selected, setSelected] = useState<DashboardStaffOutput | null>(null);

  const detail = useQuery({
    queryKey: ['dashboard-output-detail', selected?.nhanVien, selected?.thang],
    queryFn: () => getDashboardOutputDetail(selected!.nhanVien, selected!.thang),
    enabled: !!selected,
  });

  const totalDetailKg = (detail.data || []).reduce((s, r) => s + r.sanLuongKg, 0);

  return (
    <>
      <div className="bg-white rounded-lg border border-[#14264b]/20 p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[#14264b] mb-3">Sản lượng nhân viên theo tháng</h3>
        <DataTable
          columns={summaryColumns}
          data={(data || []).map((r) => ({ ...r, id: `${r.nhanVien}-${r.thang}` }))}
          rowKey="id"
          loading={loading}
          emptyMessage="Không có dữ liệu trong khoảng đã chọn"
          onRowClick={(row) => setSelected({ nhanVien: row.nhanVien, thang: row.thang, soDon: row.soDon, sanLuongKg: row.sanLuongKg })}
        />
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#14264b]/20">
              <div>
                <h3 className="text-base font-semibold text-[#14264b]">Chi tiết sản lượng</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selected.nhanVien} &mdash; Tháng {selected.thang}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-[#14264b] transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="overflow-auto flex-1 px-5 py-4">
              <DataTable
                columns={detailColumns}
                data={(detail.data || []).map((r, i) => ({ ...r, id: i }))}
                rowKey="id"
                loading={detail.isLoading}
                emptyMessage="Không có dữ liệu chi tiết"
              />
            </div>

            {/* Footer tổng */}
            {!detail.isLoading && (detail.data?.length ?? 0) > 0 && (
              <div className="px-5 py-3 border-t border-[#14264b]/20 flex justify-end gap-6 text-sm">
                <span className="text-gray-500">{detail.data!.length} bản ghi</span>
                <span className="font-semibold text-[#14264b]">
                  Tổng: {fmtKg(totalDetailKg)} kg
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
