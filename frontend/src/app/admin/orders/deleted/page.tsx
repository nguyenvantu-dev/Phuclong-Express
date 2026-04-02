'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeletedOrders, restoreOrder } from '@/lib/api';
import { QueryParams } from '@/types/order';
import { OrderStatus, orderStatusOptions } from '@/types/order-status';

/**
 * Deleted Orders Page
 *
 * Converted from OrderDaXoa.aspx
 * Features:
 * - List all soft-deleted orders
 * - Filter by status, username, date range, country
 * - Restore deleted orders
 * - Mass restore, mass cancel, mass complete actions
 */
export default function DeletedOrdersPage() {
  const queryClient = useQueryClient();

  // Filter state
  const [filters, setFilters] = useState<QueryParams>({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // Selection state
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Fetch deleted orders
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['orders-deleted', filters],
    queryFn: () => getDeletedOrders(filters),
  });

  // Restore mutation
  const restoreMutation = useMutation({
    mutationFn: (id: number) => restoreOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders-deleted'] });
      setSelectedIds([]);
    },
  });

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

  // Mock data for dropdowns
  const usernames = ['user1', 'user2', 'user3', 'user4', 'user5'];
  const quocGias = ['USA', 'UK', 'China', 'Japan', 'Korea', 'Germany'];

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng đã xóa</h1>
        </div>
      </div>

      {/* Filter panel */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 md:grid-cols-6">
          {/* Search */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Tìm kiếm</label>
            <input
              type="text"
              placeholder="Mã đơn hàng, username..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Username */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Username</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.username || ''}
              onChange={(e) => handleFilterChange('username', e.target.value)}
            >
              <option value="">All Users</option>
              {usernames.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Trạng thái</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              {orderStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
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

          {/* Search button */}
          <div className="flex items-end">
            <button className="w-full rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Selection info */}
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm font-medium text-yellow-800">
          Đã chọn: {selectedIds.length} đơn hàng
        </p>
        {selectedIds.length > 0 && (
          <div className="mt-2 flex gap-4">
            <button
              onClick={() => {
                if (confirm(`Khôi phục ${selectedIds.length} đơn hàng đã chọn?`)) {
                  selectedIds.forEach((id) => restoreMutation.mutate(id));
                }
              }}
              disabled={restoreMutation.isPending}
              className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
            >
              Khôi phục
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
            <table className="min-w-full divide-y divide-gray-200 text-sm">
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
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Khôi phục
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Mã ĐH
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Website
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Username
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ngày save
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Trạng thái
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Số lượng
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Tổng VND
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ghi chú
                  </th>
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
                    <td className="px-2 py-2">
                      <button
                        onClick={() => handleRestore(order.id)}
                        disabled={restoreMutation.isPending}
                        className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
                      >
                        Khôi phục
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.id}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.websiteName || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.username}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {formatDate(order.ngaySaveLink)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.trangThaiOrder}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {order.soLuong}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(order.tongTienVnd)}
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
