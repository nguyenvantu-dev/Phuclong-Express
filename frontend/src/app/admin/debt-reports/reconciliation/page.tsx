'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import {
  getDebtReconciliation,
  moveToReceived,
  updateOrderTotalVND,
  exportDebtReconciliation,
  getDebtReportUsers,
  DebtReconciliationItem,
} from '@/lib/api';

/**
 * Debt Reconciliation Page
 *
 * Converted from admin/BaoCao_DoiChieuCongNo.aspx
 * Features:
 * - Filter panel: From date, To date, User, Order number
 * - Data table with columns: ordernumber, UserName, ngaymuahang, SoLinkA, SotienA, SoLinkB, SotienB, tracking_number, SotienAVND, SotienBVND, KiemTraVND
 * - Inline edit: SotienBVND
 * - Actions: Edit row, Update SotienBVND, Chuyển về Received, Export Excel
 * - Date defaults: first day of current month, today
 */

export default function DebtReconciliationPage() {
  const queryClient = useQueryClient();

  // Filter state - matching tbTuNgay, tbDenNgay, druser, tbOrderNumber in aspx
  const [filters, setFilters] = useState({
    fromDate: '',
    toDate: '',
    username: '',
    orderNumber: '',
  });

  // Refs for date inputs
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);

  // Edit state for inline editing - matching gvDoiChieuCongNo.EditIndex
  const [editingRow, setEditingRow] = useState<{ ordernumber: string; tracking_number: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Error message
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Initialize dates on mount - matching KhoiTaoNgay() in C#
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Format dd/mm/yyyy for flatpickr
    const formatDate = (d: Date) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    setFilters({
      fromDate: formatDate(firstDayOfMonth),
      toDate: formatDate(today),
      username: '',
      orderNumber: '',
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

  // Fetch users for dropdown - matching LoadDataUser() in C#
  const { data: users } = useQuery({
    queryKey: ['debt-report-users'],
    queryFn: getDebtReportUsers,
  });

  // Fetch debt reconciliation report
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['debt-reconciliation', filters],
    queryFn: () => {
      const { fromDate, toDate } = getAPIDates();
      return getDebtReconciliation(
        fromDate,
        toDate,
        filters.username || undefined,
        filters.orderNumber || undefined,
      );
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

  // Move to Received mutation - matching gvDoiChieuCongNo_RowCommand("ChuyenVeReceived") in C#
  const moveToReceivedMutation = useMutation({
    mutationFn: (ordernumber: string) => moveToReceived(ordernumber),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['debt-reconciliation'] });
      } else {
        setErrorMessage(result.message || 'Chuyển trạng thái thất bại');
      }
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  // Update total VND mutation - matching gvDoiChieuCongNo_RowUpdating() in C#
  const updateTotalVndMutation = useMutation({
    mutationFn: ({
      ordernumber,
      trackingNumber,
      tongTienOrderVND,
    }: {
      ordernumber: string;
      trackingNumber: string;
      tongTienOrderVND: number;
    }) => updateOrderTotalVND(ordernumber, trackingNumber, tongTienOrderVND),
    onSuccess: (result) => {
      if (result.success) {
        setEditingRow(null);
        queryClient.invalidateQueries({ queryKey: ['debt-reconciliation'] });
      } else {
        setErrorMessage(result.message || 'Cập nhật thất bại');
      }
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => {
      const { fromDate, toDate } = getAPIDates();
      return exportDebtReconciliation(
        fromDate,
        toDate,
        filters.username || undefined,
        filters.orderNumber || undefined,
      );
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

  // Handle filter changes
  const handleFilterChange = (
    key: 'fromDate' | 'toDate' | 'username' | 'orderNumber',
    value: string,
  ) => {
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

  // Start editing - matching gvDoiChieuCongNo_RowEditing in C#
  const handleEdit = (item: DebtReconciliationItem) => {
    setEditingRow({
      ordernumber: item.ordernumber,
      tracking_number: item.tracking_number,
    });
    setEditValue(item.SotienBVND?.toString() || '0');
    setErrorMessage('');
  };

  // Cancel editing - matching gvDoiChieuCongNo_RowCancelingEdit in C#
  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditValue('');
  };

  // Save editing - matching gvDoiChieuCongNo_RowUpdating in C#
  const handleSaveEdit = () => {
    if (!editingRow) return;

    // Validation matching C# code
    const value = parseFloat(editValue);
    if (isNaN(value)) {
      setErrorMessage('Tiền thực trả (VNĐ) phải là kiểu số');
      return;
    }

    updateTotalVndMutation.mutate({
      ordernumber: editingRow.ordernumber,
      trackingNumber: editingRow.tracking_number,
      tongTienOrderVND: value,
    });
  };

  // Handle move to Received - matching gvDoiChieuCongNo_RowCommand("ChuyenVeReceived") in C#
  const handleMoveToReceived = (ordernumber: string) => {
    if (confirm('Bạn có chắc muốn chuyển về trạng thái Received không?')) {
      moveToReceivedMutation.mutate(ordernumber);
    }
  };

  // Format currency - matching {0:n2} in C#
  const formatCurrency = (value: number | null | undefined, decimals = 0) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  };

  // Format date - matching {0:dd/MM/yyyy} in C#
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Check if a row is being edited
  const isEditing = (item: DebtReconciliationItem) =>
    editingRow?.ordernumber === item.ordernumber &&
    editingRow?.tracking_number === item.tracking_number;

  return (
    <div className="space-y-4">
      {/* Page title - matching h1 in aspx */}
      <h1 className="text-2xl font-bold text-gray-800">Báo cáo kiểm tra đơn hàng mua</h1>

      {/* Error message - matching lbLoi in aspx */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">{errorMessage}</div>
      )}

      {/* Filter panel - matching table in aspx */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 md:grid-cols-6">
          {/* From date - matching tbTuNgay in aspx */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Từ ngày
            </label>
            <input
              ref={fromDateRef}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              placeholder="dd/mm/yyyy"
              value={filters.fromDate}
              readOnly
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
              placeholder="dd/mm/yyyy"
              value={filters.toDate}
              readOnly
            />
          </div>

          {/* User - matching druser in aspx */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              User
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
            >
              <option value="">--All--</option>
              {users?.map((user) => (
                <option key={user.Id} value={user.UserName}>
                  {user.UserName}
                </option>
              ))}
            </select>
          </div>

          {/* Order number - matching tbOrderNumber in aspx */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Order number
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              value={filters.orderNumber}
              onChange={(e) => handleFilterChange('orderNumber', e.target.value)}
              placeholder="Order number"
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
          Error loading debt reconciliation: {(error as Error).message}
        </div>
      )}

      {/* Data table - matching gvDoiChieuCongNo in aspx */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-24 px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Edit
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Số OrderNumber
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    User
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ngày mua hàng
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Link thu khách
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền thu khách
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Link thực trả
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tiền thực trả
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Tracking number
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500 text-red-600">
                    Tiền thu khách (VND)
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500 text-red-600">
                    Tiền thực trả (VND)
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500 text-red-600">
                    Kiểm tra
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((item) => {
                  const rowEditing = isEditing(item);

                  return (
                    <tr key={`${item.ordernumber}-${item.tracking_number}`} className="hover:bg-gray-50">
                      {/* Edit button - matching lbtEdit in aspx */}
                      <td className="px-2 py-2">
                        {rowEditing ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveEdit}
                              disabled={updateTotalVndMutation.isPending}
                              className="text-green-600 hover:text-green-800"
                            >
                              Update
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                      {/* ordernumber */}
                      <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                        {item.ordernumber}
                      </td>
                      {/* UserName */}
                      <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                        {item.UserName}
                      </td>
                      {/* ngaymuahang */}
                      <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                        {formatDate(item.ngaymuahang)}
                      </td>
                      {/* SoLinkA */}
                      <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                        {formatCurrency(item.SoLinkA, 2)}
                      </td>
                      {/* SotienA */}
                      <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                        {formatCurrency(item.SotienA, 2)}
                      </td>
                      {/* SoLinkB */}
                      <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                        {formatCurrency(item.SoLinkB, 2)}
                      </td>
                      {/* SotienB */}
                      <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                        {formatCurrency(item.SotienB, 2)}
                      </td>
                      {/* tracking_number */}
                      <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                        {item.tracking_number}
                      </td>
                      {/* SotienAVND */}
                      <td className="whitespace-nowrap px-2 py-2 text-right font-medium text-gray-900">
                        {formatCurrency(item.SotienAVND)}
                      </td>
                      {/* SotienBVND - matching ItemStyle-ForeColor="Red" in aspx */}
                      <td className="whitespace-nowrap px-2 py-2 text-right">
                        {rowEditing ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-right"
                            style={{ textAlign: 'right' }}
                          />
                        ) : (
                          <span className="font-medium text-red-600">
                            {formatCurrency(item.SotienBVND)}
                          </span>
                        )}
                      </td>
                      {/* KiemTraVND - matching ItemStyle-ForeColor="Red" in aspx */}
                      <td className="whitespace-nowrap px-2 py-2 font-medium text-red-600">
                        {formatCurrency(item.KiemTraVND)}
                      </td>
                      {/* Action - Chuyển về Received */}
                      <td className="whitespace-nowrap px-2 py-2">
                        <button
                          onClick={() => handleMoveToReceived(item.ordernumber)}
                          disabled={moveToReceivedMutation.isPending}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Chuyển về Received
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
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
