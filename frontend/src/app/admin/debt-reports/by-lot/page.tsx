'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDebtReportByLot,
  exportDebtReportByLot,
  LotDebtItem,
} from '@/lib/api';

/**
 * Debt Reports By Lot Page
 *
 * Converted from admin/BaoCao_CongNoKhachHangTheoLo.aspx
 * Features:
 * - Filter panel: From date, To date
 * - Data table with columns: UserName, NgayLoHang, TenLoHang, LoaiTien, TyGia, TienLoHangA, TienPhiHaiQuanB, TongTienLoHangAB, DaThu, ConLai
 * - Actions: Search, Export Excel
 * - Date defaults: first day of current month, last day of current month
 */

export default function DebtReportsByLotPage() {
  const queryClient = useQueryClient();

  // Filter state - matching tbTuNgay, tbDenNgay in aspx
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
  });

  // Error message
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initialize dates on mount - matching KhoiTaoNgay() in C#
  useState(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFilters({
      fromDate: firstDayOfMonth.toISOString().split('T')[0].split('-').reverse().join('/'),
      toDate: lastDayOfMonth.toISOString().split('T')[0].split('-').reverse().join('/'),
    });
  });

  // Fetch debt reports by lot
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['debt-reports-by-lot', filters],
    queryFn: () => getDebtReportByLot(filters.fromDate, filters.toDate),
    enabled: !!filters.fromDate && !!filters.toDate,
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => exportDebtReportByLot(filters.fromDate, filters.toDate),
    onSuccess: (result) => {
      // Create and download CSV file
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      link.click();
    },
    onError: (err: Error) => {
      setErrorMessage('Export thất bại: ' + err.message);
    },
  });

  // Handle filter changes
  const handleFilterChange = (key: 'fromDate' | 'toDate', value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setErrorMessage('');
  };

  // Handle search button click - matching tbTim_Click in C#
  const handleSearch = () => {
    if (!filters.fromDate || !filters.toDate) {
      setErrorMessage('Vui lòng chọn từ ngày và đến ngày');
      return;
    }
    setErrorMessage('');
    refetch();
  };

  // Handle export - matching btExportToExcel_Click in C#
  const handleExport = () => {
    if (!data?.length) {
      setErrorMessage('Không có dữ liệu để xuất');
      return;
    }
    exportMutation.mutate();
  };

  // Format currency - matching {0:n0} in C#
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format date - matching {0:dd/MM/yyyy} in C#
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Calculate totals - matching summary in C#
  const totals = data?.reduce(
    (acc, item) => ({
      tienLoHangA: acc.tienLoHangA + (item.TienLoHangA || 0),
      tienPhiHaiQuanB: acc.tienPhiHaiQuanB + (item.TienPhiHaiQuanB || 0),
      tongTienLoHangAB: acc.tongTienLoHangAB + (item.TongTienLoHangAB || 0),
      daThu: acc.daThu + (item.DaThu || 0),
      conLai: acc.conLai + (item.ConLai || 0),
    }),
    { tienLoHangA: 0, tienPhiHaiQuanB: 0, tongTienLoHangAB: 0, daThu: 0, conLai: 0 },
  ) || { tienLoHangA: 0, tienPhiHaiQuanB: 0, tongTienLoHangAB: 0, daThu: 0, conLai: 0 };

  return (
    <div className="space-y-4">
      {/* Page title - matching h1 in aspx */}
      <h1 className="text-2xl font-bold text-black">Báo cáo công nợ khách hàng theo lô</h1>

      {/* Error message - matching lbLoi in aspx */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">{errorMessage}</div>
      )}

      {/* Filter panel - matching table in aspx */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 md:grid-cols-4">
          {/* From date - matching tbTuNgay in aspx */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Từ ngày
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            />
          </div>

          {/* To date - matching tbDenNgay in aspx */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Đến ngày
            </label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
            />
          </div>

          {/* Action buttons - matching tbTim, btExportToExcel in aspx */}
          <div className="flex items-end gap-2 md:col-span-2">
            <button
              onClick={handleSearch}
              className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
            >
              Tìm
            </button>
            <button
              onClick={handleExport}
              disabled={!data?.length || exportMutation.isPending}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {exportMutation.isPending ? 'Đang xuất...' : 'Export to excel'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Error loading debt reports: {(error as Error).message}
        </div>
      )}

      {/* Data table - matching gvLoHang in aspx */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    UserName
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ngày lô hàng
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Tên lô
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Loại tiền
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tỷ giá
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền lô hàng A
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền phí hải quan B
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tổng tiền lô AB
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Đã thu
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Còn lại
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* UserName */}
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.UserName}
                    </td>
                    {/* NgayLoHang */}
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {formatDate(item.NgayLoHang)}
                    </td>
                    {/* TenLoHang */}
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.TenLoHang}
                    </td>
                    {/* LoaiTien */}
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.LoaiTien}
                    </td>
                    {/* TyGia */}
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {formatCurrency(item.TyGia)}
                    </td>
                    {/* TienLoHangA */}
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {formatCurrency(item.TienLoHangA)}
                    </td>
                    {/* TienPhiHaiQuanB */}
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {formatCurrency(item.TienPhiHaiQuanB)}
                    </td>
                    {/* TongTienLoHangAB */}
                    <td className="whitespace-nowrap px-2 py-2 text-right font-bold text-gray-900">
                      {formatCurrency(item.TongTienLoHangAB)}
                    </td>
                    {/* DaThu */}
                    <td className="whitespace-nowrap px-2 py-2 text-right text-green-600">
                      {formatCurrency(item.DaThu)}
                    </td>
                    {/* ConLai - matching ItemStyle-ForeColor="Red" in aspx */}
                    <td className="whitespace-nowrap px-2 py-2 text-right font-bold text-red-600">
                      {formatCurrency(item.ConLai)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Summary row - matching calculations in C# */}
              {data.length > 0 && (
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={5} className="px-2 py-3 text-right text-gray-900">
                      Tổng cộng:
                    </td>
                    <td className="px-2 py-3 text-right text-gray-900">
                      {formatCurrency(totals.tienLoHangA)}
                    </td>
                    <td className="px-2 py-3 text-right text-gray-900">
                      {formatCurrency(totals.tienPhiHaiQuanB)}
                    </td>
                    <td className="px-2 py-3 text-right text-gray-900">
                      {formatCurrency(totals.tongTienLoHangAB)}
                    </td>
                    <td className="px-2 py-3 text-right text-green-600">
                      {formatCurrency(totals.daThu)}
                    </td>
                    <td className="px-2 py-3 text-right text-red-600">
                      {formatCurrency(totals.conLai)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && !data?.length && (
        <div className="rounded-lg bg-gray-50 p-8 text-center text-gray-500">
          Không có dữ liệu
        </div>
      )}

      {/* Fetching indicator */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white">
          Updating...
        </div>
      )}
    </div>
  );
}
