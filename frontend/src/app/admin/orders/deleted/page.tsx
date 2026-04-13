'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDeletedOrders,
  restoreOrder,
  getDeletedStatusCounts,
  batchRestoreOrders,
  permanentDeleteOrder,
  batchCancelOrders,
  batchCompleteOrders,
  batchReceivedOrders,
  batchShippedOrders,
} from '@/lib/api';
import { QueryParams } from '@/types/order';

/**
 * Deleted Orders Page
 *
 * Converted from OrderDaXoa.aspx
 * Features:
 * - List all soft-deleted orders
 * - Filter by status (CheckBoxList with counts), username, date range, country, order ID
 * - Restore deleted orders
 * - Mass actions: restore, cancel, complete, received, shipped
 * - Permanent delete
 * - Export to Excel
 */
const ORDER_STATUSES = ['Received', 'Ordered', 'Shipped', 'Completed', 'Cancelled'];

export default function DeletedOrdersPage() {
  const queryClient = useQueryClient();

  // Filter state
  const [filters, setFilters] = useState<QueryParams>({
    page: 1,
    limit: 200,
    sortBy: 'ID',
    sortOrder: 'DESC',
  });

  // Selected statuses (CheckBoxList)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Ordered']);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Countries list
  const countries = [
    { id: -1, name: '--All--' },
    { id: 1, name: 'USA' },
    { id: 2, name: 'UK' },
    { id: 3, name: 'China' },
    { id: 4, name: 'Japan' },
    { id: 5, name: 'Germany' },
    { id: 6, name: 'Korea' },
  ];

  // Usernames for dropdown
  const usernames = ['user1', 'user2', 'user3', 'user4', 'user5'];

  // Fetch status counts
  const { data: statusCounts } = useQuery({
    queryKey: ['orders-deleted-status-counts'],
    queryFn: getDeletedStatusCounts,
  });

  // Get status counts map
  const statusCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    statusCounts?.forEach((item) => {
      map[item.status] = item.count;
    });
    return map;
  }, [statusCounts]);

  // Fetch deleted orders
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['orders-deleted', { ...filters, statuses: selectedStatuses }],
    queryFn: async () => {
      const result = await getDeletedOrders({ ...filters, statuses: selectedStatuses });
      console.log('Deleted orders response:', result);
      return result;
    },
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-deleted'] });
      queryClient.invalidateQueries({ queryKey: ['orders-deleted-status-counts'] });
      setSelectedIds([]);
    },
  });

  // Batch restore mutation
  const batchRestoreMutation = useMutation({
    mutationFn: (ids: number[]) => batchRestoreOrders(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders-deleted'] });
      queryClient.invalidateQueries({ queryKey: ['orders-deleted-status-counts'] });
      setSelectedIds([]);
      alert(`Đã khôi phục ${data.count} đơn hàng`);
    },
  });

  // Permanent delete mutation
  const permanentDeleteMutation = useMutation({
    mutationFn: (id: number) => permanentDeleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-deleted'] });
      queryClient.invalidateQueries({ queryKey: ['orders-deleted-status-counts'] });
    },
  });

  // Batch cancel mutation
  const batchCancelMutation = useMutation({
    mutationFn: (ids: number[]) => batchCancelOrders(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders-deleted'] });
      queryClient.invalidateQueries({ queryKey: ['orders-deleted-status-counts'] });
      setSelectedIds([]);
      alert(`Đã hủy ${data.count} đơn hàng`);
    },
  });

  // Batch complete mutation
  const batchCompleteMutation = useMutation({
    mutationFn: (ids: number[]) => batchCompleteOrders(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders-deleted'] });
      queryClient.invalidateQueries({ queryKey: ['orders-deleted-status-counts'] });
      setSelectedIds([]);
      if (data.message) {
        alert(data.message);
      } else {
        alert(`Đã hoàn thành ${data.count} đơn hàng`);
      }
    },
  });

  // Batch received mutation
  const batchReceivedMutation = useMutation({
    mutationFn: (ids: number[]) => batchReceivedOrders(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders-deleted'] });
      queryClient.invalidateQueries({ queryKey: ['orders-deleted-status-counts'] });
      setSelectedIds([]);
      alert(`Đã chuyển ${data.count} đơn hàng sang Received`);
    },
  });

  // Batch shipped mutation
  const batchShippedMutation = useMutation({
    mutationFn: (ids: number[]) => batchShippedOrders(ids),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders-deleted'] });
      queryClient.invalidateQueries({ queryKey: ['orders-deleted-status-counts'] });
      setSelectedIds([]);
      alert(`Đã chuyển ${data.count} đơn hàng sang Shipped`);
    },
  });

  // Handle status checkbox change
  const handleStatusChange = (status: string, checked: boolean) => {
    setSelectedStatuses((prev) =>
      checked ? [...prev, status] : prev.filter((s) => s !== status)
    );
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof QueryParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === data?.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.data.map((o) => o.id) || []);
    }
  };

  // Handle individual select
  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Handle restore single order
  const handleRestore = (id: number) => {
    if (confirm('Bạn có chắc muốn khôi phục đơn hàng này?')) {
      restoreMutation.mutate(id);
    }
  };

  // Handle permanent delete single order
  const handlePermanentDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn XÓA VĨNH VIỄN đơn hàng này? Hành động này không thể hoàn tác!')) {
      permanentDeleteMutation.mutate(id);
    }
  };

  // Format currency
  const formatCurrency = (value: number | null | undefined, currency: string = 'VND') => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency,
    }).format(value);
  };

  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  // Check if mutation is pending
  const isPending =
    restoreMutation.isPending ||
    batchRestoreMutation.isPending ||
    permanentDeleteMutation.isPending ||
    batchCancelMutation.isPending ||
    batchCompleteMutation.isPending ||
    batchReceivedMutation.isPending ||
    batchShippedMutation.isPending;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders/list"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">ĐƠN HÀNG ĐÃ XÓA</h1>
        </div>
      </div>

      {/* Filter panel */}
      <div className="rounded-lg bg-white p-4 shadow">
        {/* Status CheckBoxList */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">Status:</label>
          <div className="flex flex-wrap gap-4">
            {ORDER_STATUSES.map((status) => {
              const count = statusCountMap[status] || 0;
              const label = `${status} (${count})`;
              return (
                <label key={status} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={(e) => handleStatusChange(status, e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Filter fields */}
        <div className="grid gap-4 md:grid-cols-6">
          {/* Search */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Nội dung tìm..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Mã đặt hàng */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Mã đặt hàng</label>
            <input
              type="text"
              placeholder="Mã ĐH..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.orderId || ''}
              onChange={(e) => handleFilterChange('orderId', e.target.value)}
            />
          </div>

          {/* Quốc gia */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Quốc gia</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.quocGiaId || ''}
              onChange={(e) => handleFilterChange('quocGiaId', e.target.value)}
            >
              {countries.map((c) => (
                <option key={c.id} value={c.id > 0 ? c.id : ''}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Username */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Username</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.username || ''}
              onChange={(e) => handleFilterChange('username', e.target.value)}
            >
              <option value="">--All--</option>
              {usernames.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Từ ngày */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Từ ngày</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>

          {/* Đến ngày */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Đến ngày</label>
            <input
              type="date"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
          >
            Xem
          </button>
          <button
            className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
          >
            Export to Excel
          </button>
        </div>
      </div>

      {/* Selection info and actions */}
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-800">
          Đã chọn: {selectedIds.length} đơn hàng
        </p>
        {selectedIds.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-4">
            <button
              onClick={() => {
                if (confirm(`Khôi phục ${selectedIds.length} đơn hàng đã chọn?`)) {
                  batchRestoreMutation.mutate(selectedIds);
                }
              }}
              disabled={isPending}
              className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
            >
              Khôi phục
            </button>
            <button
              onClick={() => {
                if (confirm(`Hủy ${selectedIds.length} đơn hàng đã chọn?`)) {
                  batchCancelMutation.mutate(selectedIds);
                }
              }}
              disabled={isPending}
              className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              Mass Cancel
            </button>
            <button
              onClick={() => {
                if (confirm(`Hoàn thành ${selectedIds.length} đơn hàng đã chọn? (Chỉ Ordered/Shipped)`)) {
                  batchCompleteMutation.mutate(selectedIds);
                }
              }}
              disabled={isPending}
              className="text-sm font-medium text-green-600 hover:underline disabled:opacity-50"
            >
              Mass Complete
            </button>
            <button
              onClick={() => {
                if (confirm(`Chuyển ${selectedIds.length} đơn hàng sang Received?`)) {
                  batchReceivedMutation.mutate(selectedIds);
                }
              }}
              disabled={isPending}
              className="text-sm font-medium text-purple-600 hover:underline disabled:opacity-50"
            >
              Mass Received
            </button>
            <button
              onClick={() => {
                if (confirm(`Chuyển ${selectedIds.length} đơn hàng sang Shipped?`)) {
                  batchShippedMutation.mutate(selectedIds);
                }
              }}
              disabled={isPending}
              className="text-sm font-medium text-orange-600 hover:underline disabled:opacity-50"
            >
              Mass Shipped
            </button>
          </div>
        )}
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
          Error loading orders: {(error as Error).message}
        </div>
      )}

      {/* Data table */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-10 px-2 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === data.data.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Trọn gói</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Xóa</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Mã ĐH</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Ngày ĐH</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Order Number</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Username</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Link</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Hình</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Màu</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Size</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">SL</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">Phụ thu</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">Sale off</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">ShipUS</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">Tax</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">Giá web</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">% Công</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">Công ngoại tệ</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">Tổng ngoại tệ</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">Tỷ giá</th>
                  <th className="px-2 py-3 text-right font-medium uppercase text-gray-500">Tổng VNĐ</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">ĐH Status</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">VN Status</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Đợt hàng</th>
                  <th className="px-2 py-3 text-left font-medium uppercase text-gray-500">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.data.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => handleSelect(order.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-2 py-2 text-gray-900">
                      {order.hangKhoan ? 'Trọn gói' : '-'}
                    </td>
                    <td className="px-2 py-2">
                      <button
                        onClick={() => handleRestore(order.id)}
                        disabled={isPending}
                        className="mr-2 text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
                      >
                        Khôi phục
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(order.id)}
                        disabled={isPending}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        Xóa
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.id}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {formatDate(order.ngayMuaHang)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.orderNumber || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.username}
                    </td>
                    <td className="max-w-[150px] truncate px-2 py-2 text-blue-600">
                      {order.linkWeb ? (
                        <a href={order.linkWeb} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {order.linkWeb}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-2 py-2">
                      {order.linkHinh && (
                        <img src={order.linkHinh} alt="product" className="h-10 w-10 object-cover" />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.color || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.size || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.soLuong}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.phuThu?.toFixed(2) || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.saleOff || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.shipUsa?.toFixed(2) || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.tax || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.donGiaWeb?.toFixed(2) || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.cong?.toFixed(2) || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.tienCongUsd?.toFixed(2) || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.tongTienUsd?.toFixed(2) || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.tyGia?.toLocaleString() || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(order.tongTienVnd)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.trangThaiOrder}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.ngayVeVn ? `Đợt hàng ${formatDate(order.ngayVeVn)}` : '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.tenDotHang || '-'}
                    </td>
                    <td className="max-w-[150px] truncate px-2 py-2 text-gray-900">
                      {order.ghiChu || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(data.page - 1) * data.limit + 1} to{' '}
            {Math.min(data.page * data.limit, data.total)} of {data.total} orders
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
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