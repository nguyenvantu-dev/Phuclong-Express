'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getCustomerDebtReport,
  exportCustomerDebtReport,
  CustomerDebtReportItem,
} from '@/lib/api';

/**
 * Customer Debt Report Page (BaoCao_CongNoKhachHang)
 *
 * Converted from admin/BaoCao_CongNoKhachHang.aspx
 * Features:
 * - Data table with columns: UserName, TienNo, TienHangChuaGiao, PhanTram
 * - Conditional styling: If PhanTram > 30, text color = Red
 * - Export to Excel
 */

export default function CustomerDebtReportPage() {
  // Error message state
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch customer debt report - loads on page mount (matching !IsPostBack in C#)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customer-debt-report'],
    queryFn: getCustomerDebtReport,
  });

  // Normalize data to ensure it's always an array
  const customerDebts = Array.isArray(data) ? data : [];

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: exportCustomerDebtReport,
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

  // Handle export button click
  const handleExport = () => {
    exportMutation.mutate();
  };

  // Handle refresh button click
  const handleRefresh = () => {
    refetch();
  };

  // Format currency - matching {0:n0} in C#
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format percentage - matching {0:n1} in C#
  const formatPercentage = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0.0';
    return new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  };

  // Check if percentage > 30 - matching PhanTram > 30.0 in C#
  const isOverLimit = (percentage: number | null | undefined) => {
    return percentage !== null && percentage !== undefined && percentage > 30;
  };

  return (
    <div className="space-y-4">
      {/* Page title - matching h1.titlead in aspx */}
      <h1 className="text-2xl font-bold text-gray-800">Báo cáo công nợ khách hàng</h1>

      {/* Error message */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">{errorMessage}</div>
      )}

      {/* Action buttons - matching btExportToExcel in aspx */}
      <div className="flex gap-2">
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 disabled:opacity-50"
        >
          {isLoading ? 'Đang tải...' : 'Làm mới'}
        </button>
        <button
          onClick={handleExport}
          disabled={exportMutation.isPending || !customerDebts.length}
          className="rounded-lg bg-[#14264b] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a6e] disabled:opacity-50"
        >
          {exportMutation.isPending ? 'Đang xuất...' : 'Export to excel'}
        </button>
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

      {/* Data table - matching gvCongNo in aspx */}
      {!isLoading && !error && customerDebts.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              {/* Header - matching HeaderStyle CssClass="myGridHeader" */}
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền Nợ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền hàng chưa giao
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Phần trăm
                  </th>
                </tr>
              </thead>
              {/* Body - matching AlternatingRowStyle BackColor="#f9f9f9" */}
              <tbody className="divide-y divide-gray-200 bg-white">
                {customerDebts.map((item: CustomerDebtReportItem) => {
                  const isRed = isOverLimit(item.PhanTram);

                  return (
                    <tr
                      key={item.UserName}
                      className={isRed ? 'bg-red-50' : 'hover:bg-gray-50'}
                      // RowDataBound styling in C#: if PhanTram > 30.0 then ForeColor = Red
                      style={{ color: isRed ? 'red' : 'black' }}
                    >
                      {/* UserName */}
                      <td className="whitespace-nowrap px-4 py-2 font-medium">
                        {item.UserName}
                      </td>
                      {/* TienNo - matching DataFormatString="{0:n0}" */}
                      <td className="whitespace-nowrap px-4 py-2 text-right">
                        {formatCurrency(item.TienNo)}
                      </td>
                      {/* TienHangChuaGiao - matching DataFormatString="{0:n0}" */}
                      <td className="whitespace-nowrap px-4 py-2 text-right">
                        {formatCurrency(item.TienHangChuaGiao)}
                      </td>
                      {/* PhanTram - matching DataFormatString="{0:n1}" */}
                      <td className="whitespace-nowrap px-4 py-2 text-right">
                        {formatPercentage(item.PhanTram)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {customerDebts.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              Không có dữ liệu
            </div>
          )}
        </div>
      )}
    </div>
  );
}
