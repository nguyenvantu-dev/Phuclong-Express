'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import {
  getDebtReportByShipmentLot,
  exportDebtReportByShipmentLot,
} from '@/lib/api';

/**
 * Debt Reports By Shipment Lot Page
 *
 * Converted from admin/BaoCao_CongNoTheoDotHang.aspx
 * Features:
 * - Filter panel: From date, To date
 * - Data table with columns: UserName, HoTen, NgayVeVN, TienHang, TienShip, TongTien, PhoneNumber, DiaChi
 * - Action link: In phiếu (link to BaoCao_InPhieuShipTheoDotHang)
 * - Actions: Search, Export Excel
 * - Date defaults: from 10 days ago, to today
 */

export default function DebtReportsByShipmentLotPage() {

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
    const today = new Date();
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(today.getDate() - 10);

    // Format dd/mm/yyyy for flatpickr
    const formatDate = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    setFilters({
      fromDate: formatDate(tenDaysAgo),
      toDate: formatDate(today),
    });

    // Initialize flatpickr
    const fpFrom = flatpickr(fromDateRef.current!, {
      dateFormat: 'd/m/Y',
      defaultDate: formatDate(tenDaysAgo),
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
      defaultDate: formatDate(today),
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

  // Fetch debt reports by shipment lot
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['debt-reports-by-shipment-lot', filters],
    queryFn: () => {
      const { fromDate, toDate } = getAPIDates();
      return getDebtReportByShipmentLot(fromDate, toDate);
    },
    enabled: !!filters.fromDate && !!filters.toDate,
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => {
      const { fromDate, toDate } = getAPIDates();
      return exportDebtReportByShipmentLot(fromDate, toDate);
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
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate totals - matching summary in C#
  const totals = data?.reduce(
    (acc, item) => ({
      tienHang: acc.tienHang + (item.TienHang || 0),
      tienShip: acc.tienShip + (item.TienShip || 0),
      tongTien: acc.tongTien + (item.TongTien || 0),
    }),
    { tienHang: 0, tienShip: 0, tongTien: 0 },
  ) || { tienHang: 0, tienShip: 0, tongTien: 0 };

  return (
    <div className="space-y-4">
      {/* Page title - matching h1 in aspx */}
      <h1 className="text-2xl font-bold text-black">Báo cáo công nợ theo đợt hàng</h1>

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
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#14264b] focus:outline-none"
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
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-[#14264b] focus:outline-none"
              placeholder="dd/MM/yyyy"
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
          Error loading debt reports: {(error as Error).message}
        </div>
      )}

      {/* Data table - matching gvCongNo in aspx */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    In phiếu
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    UserName
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Tên
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Đợt hàng ngày
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền hàng
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền ship
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tổng tiền
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Số điện thoại
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Địa chỉ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    {/* In phiếu link - matching Eval("UserName"), Eval("TenDotHang") in aspx */}
                    <td className="px-2 py-2">
                      <a
                        href={`/admin/debt-reports/shipping-slip?u=${encodeURIComponent(item.UserName)}&dh=${encodeURIComponent(item.TenDotHang || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#14264b] hover:text-[#14264b]"
                      >
                        In phiếu
                      </a>
                    </td>
                    {/* UserName */}
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.UserName}
                    </td>
                    {/* HoTen */}
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.HoTen}
                    </td>
                    {/* NgayVeVN - Đợt hàng ngày */}
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {formatDate(item.NgayVeVN)}
                    </td>
                    {/* TienHang */}
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {formatCurrency(item.TienHang)}
                    </td>
                    {/* TienShip */}
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {formatCurrency(item.TienShip)}
                    </td>
                    {/* TongTien - matching ItemStyle-ForeColor="Red" in aspx */}
                    <td className="whitespace-nowrap px-2 py-2 text-right font-bold text-red-600">
                      {formatCurrency(item.TongTien)}
                    </td>
                    {/* PhoneNumber */}
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.PhoneNumber}
                    </td>
                    {/* DiaChi */}
                    <td className="max-w-[200px] truncate px-2 py-2 text-gray-900">
                      {item.DiaChi}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Summary row - matching calculations in C# */}
              {data.length > 0 && (
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={4} className="px-2 py-3 text-right text-gray-900">
                      Tổng cộng:
                    </td>
                    <td className="px-2 py-3 text-right text-gray-900">
                      {formatCurrency(totals.tienHang)}
                    </td>
                    <td className="px-2 py-3 text-right text-gray-900">
                      {formatCurrency(totals.tienShip)}
                    </td>
                    <td className="px-2 py-3 text-right text-red-600">
                      {formatCurrency(totals.tongTien)}
                    </td>
                    <td colSpan={2}></td>
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
