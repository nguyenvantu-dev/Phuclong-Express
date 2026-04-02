'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { getTotalRevenue, TotalRevenueItem } from '@/lib/api';

/**
 * Total Revenue Report Page
 *
 * Converted from admin/BaoCao_TongDoanhThu.aspx
 * Features:
 * - Filter panel: From date, To date
 * - Summary cards: Đầu kỳ, Công nợ phát sinh, Đã thanh toán, Chênh lệch, Công nợ còn lại
 * - Action: Search
 */

// Initialize default dates (first day of month to last day of month)
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

export default function TotalRevenuePage() {
  // Filter state - matching BaoCao_TongDoanhThu.aspx filters
  const [filters, setFilters] = useState<{ fromDate: string; toDate: string }>(() => getDefaultDates());

  // Refs for date inputs
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);

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

  // Fetch total revenue data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['total-revenue', filters],
    queryFn: () => getTotalRevenue(filters.fromDate, filters.toDate),
    enabled: true,
  });

  // Handle search button click
  const handleSearch = () => {
    if (!filters.fromDate || !filters.toDate) {
      return;
    }
    refetch();
  };

  // Format currency - matching {0:n0} in C#
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(Math.round(value));
  };

  return (
    <div className="space-y-4">
      {/* Page title - matching h1 in aspx */}
      <h1 className="text-2xl font-bold text-gray-800">Báo cáo tổng doanh thu</h1>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">
          Error loading data: {(error as Error).message}
        </div>
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              placeholder="dd/MM/yyyy"
            />
          </div>

          {/* Search button - matching tbTim in aspx */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
            >
              Tìm
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

      {/* Summary cards - matching lbDauKy, lbPhanNo, lbPhanCo, lbChenhLech, lbCanDoi in aspx */}
      {!isLoading && data && (
        <div className="rounded-lg bg-white p-6 shadow">
          <table className="w-full">
            <tbody>
              <tr>
                <td className="py-2 text-gray-600">Đầu kỳ</td>
                <td className="py-2 text-right font-bold">:</td>
                <td className="bcth_tien py-2 text-right font-bold text-gray-900">
                  {formatCurrency(data.dauKy)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Công nợ phát sinh</td>
                <td className="py-2 text-right font-bold">:</td>
                <td className="bcth_tien py-2 text-right font-bold text-gray-900">
                  {formatCurrency(data.phanNo)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Đã thanh toán</td>
                <td className="py-2 text-right font-bold">:</td>
                <td className="bcth_tien py-2 text-right font-bold text-gray-900">
                  {formatCurrency(data.phanCo)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Chênh lệch</td>
                <td className="py-2 text-right font-bold">:</td>
                <td className="bcth_tien py-2 text-right font-bold text-gray-900">
                  {formatCurrency(data.chenhLech)}
                </td>
              </tr>
              <tr>
                <td className="py-2 text-gray-600">Công nợ còn lại</td>
                <td className="py-2 text-right font-bold">:</td>
                <td className="bcth_tien py-2 text-right font-bold text-gray-900">
                  {formatCurrency(data.canDoi)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
