'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import {
  getDebtReportByLot,
  exportDebtReportByLot,
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
  // Filter state - matching tbTuNgay, tbDenNgay in aspx
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
  });

  // Refs for date inputs
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);

  // Error message
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initialize dates on mount - matching KhoiTaoNgay() in C#
  useEffect(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Format dd/mm/yyyy for flatpickr
    const formatDate = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    setFilters({
      fromDate: formatDate(firstDayOfMonth),
      toDate: formatDate(lastDayOfMonth),
    });

    // Initialize flatpickr
    const fpFrom = flatpickr(fromDateRef.current!, {
      dateFormat: 'd/m/Y',
      defaultDate: formatDate(firstDayOfMonth),
      onChange: (dates) => {
        if (dates[0]) {
          const d = dates[0];
          const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          setFilters(prev => ({ ...prev, fromDate: formatted }));
        }
      },
    });

    const fpTo = flatpickr(toDateRef.current!, {
      dateFormat: 'd/m/Y',
      defaultDate: formatDate(lastDayOfMonth),
      onChange: (dates) => {
        if (dates[0]) {
          const d = dates[0];
          const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          setFilters(prev => ({ ...prev, toDate: formatted }));
        }
      },
    });

    return () => {
      fpFrom.destroy();
      fpTo.destroy();
    };
  }, []);

  // Fetch debt reports by lot
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['debt-reports-by-lot', filters],
    queryFn: () => {
      const { fromDate, toDate } = getAPIDates();
      return getDebtReportByLot(fromDate, toDate);
    },
    enabled: !!filters.fromDate && !!filters.toDate,
  });

  // Convert dd/mm/yyyy to yyyy-mm-dd for API
  const convertToISODate = (dateStr: string) => {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

  // Get dates for API (convert to YYYY-MM-DD format)
  const getAPIDates = () => ({
    fromDate: convertToISODate(filters.fromDate),
    toDate: convertToISODate(filters.toDate),
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => {
      const { fromDate, toDate } = getAPIDates();
      return exportDebtReportByLot(fromDate, toDate);
    },
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
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Từ ngày
            </label>
            <div className="relative">
              <input
                ref={fromDateRef}
                type="text"
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 hover:border-gray-300"
                placeholder="dd/mm/yyyy"
                value={filters.fromDate}
                readOnly
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* To date - matching tbDenNgay in aspx */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Đến ngày
            </label>
            <div className="relative">
              <input
                ref={toDateRef}
                type="text"
                className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-gray-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 hover:border-gray-300"
                placeholder="dd/mm/yyyy"
                value={filters.toDate}
                readOnly
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
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
