'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { getProfitLossByLot, exportProfitLossByLot, ProfitLossByLotItem } from '@/lib/api';

/**
 * Profit/Loss By Lot Report Page
 *
 * Converted from admin/BaoCao_PhanTichLaiLoTheoLoHang.aspx
 * Features:
 * - Filter panel: From date, To date
 * - Data table: NgayLoHang, TenLoHang, TienLoHangA, TienPhiHaiQuanB, TongTienLoHangAB, TienChiPhiLoHangC, LaiLoD
 * - Actions: Search, Export Excel
 * - Link to LoHang_ChiPhi.aspx for lot expenses
 */

export default function ProfitLossByLotPage() {
  // Error message
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Refs for date inputs
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);

  // Initialize default dates
  const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return {
      fromDate: formatDate(firstDay),
      toDate: formatDate(lastDay),
    };
  };

  // Filter state - matching BaoCao_PhanTichLaiLoTheoLoHang.aspx filters
  const [filters, setFilters] = useState<{ fromDate: string; toDate: string }>(() => getDefaultDates());

  // Initialize flatpickr
  useEffect(() => {
    const fpFrom = flatpickr(fromDateRef.current!, {
      dateFormat: 'd/m/Y',
      defaultDate: filters.fromDate,
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
      defaultDate: filters.toDate,
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

  // Fetch profit/loss by lot data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['profit-loss-by-lot', filters],
    queryFn: () => getProfitLossByLot(filters.fromDate, filters.toDate),
    enabled: !!filters.fromDate && !!filters.toDate,
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => exportProfitLossByLot(filters.fromDate, filters.toDate),
    onSuccess: (result) => {
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
      setErrorMessage('Vui lòng nhập ngày bắt đầu và ngày kết thúc');
      return;
    }
    setErrorMessage('');
    refetch();
  };

  // Handle export button click - matching btExportToExcel_Click in C#
  const handleExport = () => {
    if (!filters.fromDate || !filters.toDate) {
      setErrorMessage('Vui lòng nhập ngày bắt đầu và ngày kết thúc');
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

  return (
    <div className="space-y-4">
      {/* Page title - matching h1 in aspx */}
      <h1 className="text-2xl font-bold text-gray-800">Báo cáo phân tích lãi lỗ theo lô</h1>

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
              ref={fromDateRef}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none"
              placeholder="dd/MM/yyyy"
            />
          </div>

          {/* To date - matching tbDenNgay in aspx */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Đến ngày
            </label>
            <input
              ref={toDateRef}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none"
              placeholder="dd/MM/yyyy"
            />
          </div>

          {/* Action buttons - matching tbTim, btExportToExcel in aspx */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
            >
              Tìm
            </button>
            <button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="rounded-lg bg-[#14264b] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a6e] disabled:opacity-50"
            >
              {exportMutation.isPending ? 'Đang xuất...' : 'Export to excel'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#14264b] border-t-transparent"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Error loading data: {(error as Error).message}
        </div>
      )}

      {/* Data table - matching gvLoHang in aspx */}
      {!isLoading && !error && data && data.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Chi phí lô hàng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Lô hàng ngày
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Mã lô ngày
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền Lô Hàng (A)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền phí hải quan(B)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tổng tiền lô hàng (A + B)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Chi phí (C)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Lãi/lỗ theo lô (A + B) - C
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* Chi phí lô hàng link - matching Eval("TenLoHang") in aspx */}
                    <td className="whitespace-nowrap px-4 py-2">
                      <a
                        href={`/lot-expenses?id=${item.TenLoHang}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#14264b] hover:underline"
                      >
                        Chi phí lô hàng
                      </a>
                    </td>
                    {/* NgayLoHang */}
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {formatDate(item.NgayLoHang)}
                    </td>
                    {/* TenLoHang */}
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {item.TenLoHang}
                    </td>
                    {/* TienLoHangA */}
                    <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.TienLoHangA)}
                    </td>
                    {/* TienPhiHaiQuanB */}
                    <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.TienPhiHaiQuanB)}
                    </td>
                    {/* TongTienLoHangAB */}
                    <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.TongTienLoHangAB)}
                    </td>
                    {/* TienChiPhiLoHangC */}
                    <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.TienChiPhiLoHangC)}
                    </td>
                    {/* LaiLoD - conditional styling for profit/loss */}
                    <td
                      className={`whitespace-nowrap px-4 py-2 text-right font-medium ${
                        item.LaiLoD >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {formatCurrency(item.LaiLoD)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No data state */}
      {!isLoading && !error && (!data || data.length === 0) && (
        <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
          Không có dữ liệu
        </div>
      )}
    </div>
  );
}
