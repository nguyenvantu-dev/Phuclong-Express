'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface PurchasedItem {
  id: number;
  ordernumber: string;
  websiteName: string;
  username: string;
  ngaySaveLink: string;
  linkWeb: string;
  linkHinh: string;
  color: string;
  size: string;
  soLuong: number;
  donGiaWeb: number;
  ghiChu: string;
  trangThaiOrder: number;
}

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  website?: string;
  username?: string;
  status?: string;
  maDatHang?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const getPurchasedItems = async (params: QueryParams): Promise<PaginatedResponse<PurchasedItem>> => {
  const { data } = await apiClient.get('/purchased-items', { params });
  return data;
};

const deletePurchasedItem = async (id: number) => {
  await apiClient.delete(`/purchased-items/${id}`);
};

const massDeletePurchasedItems = async (ids: number[]) => {
  await apiClient.post('/purchased-items/mass-delete', { ids });
};

/**
 * Purchased Items List Page
 *
 * Converted from admin/HangKhoan_LietKe.aspx
 */
export default function PurchasedItemsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<QueryParams>({ page: 1, limit: 20 });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['purchased-items', filters],
    queryFn: () => getPurchasedItems(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePurchasedItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchased-items'] });
    },
  });

  const massDeleteMutation = useMutation({
    mutationFn: massDeletePurchasedItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchased-items'] });
      setSelectedIds([]);
    },
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data?.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.data.map((item) => item.id) || []);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa không?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleMassDelete = () => {
    if (confirm(`Xóa ${selectedIds.length} items đã chọn?`)) {
      massDeleteMutation.mutate(selectedIds);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1: return 'Received';
      case 2: return 'Confirmed';
      case 3: return 'Ordered';
      case 4: return 'Shipped';
      case 5: return 'Completed';
      case -1: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;
  const websites = ['Amazon', 'eBay', 'Nike', 'Adidas', 'Apple', 'Target', 'Walmart'];
  const usernames = ['user1', 'user2', 'user3', 'khachhang1', 'khachhang2'];

  return (
    <div className="space-y-4">
      {/* Page tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <span className="rounded bg-gray-600 px-3 py-1 text-sm text-white">
          Quản lý hàng khoán
        </span>
        <Link
          href="/admin/purchased-items/new"
          className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Tạo mới
        </Link>
        <Link
          href="/admin/purchased-items/mass-update"
          className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Mass update
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 md:grid-cols-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Filter</label>
            <input
              type="text"
              placeholder="Filter"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={filters.search || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Mã đặt hàng</label>
            <input
              type="text"
              placeholder="Mã đặt hàng"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={filters.maDatHang || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, maDatHang: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Website</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={filters.website || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, website: e.target.value }))}
            >
              <option value="">All</option>
              {websites.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Username</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              value={filters.username || ''}
              onChange={(e) => setFilters((prev) => ({ ...prev, username: e.target.value }))}
            >
              <option value="">All</option>
              {usernames.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="w-full rounded-lg bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600"
            >
              Xem
            </button>
          </div>
        </div>
      </div>

      {/* Mass actions */}
      {selectedIds.length > 0 && (
        <div className="rounded-lg bg-gray-50 p-4">
          <span className="text-sm font-medium">
            Đã chọn: {selectedIds.length} items
          </span>
          <button
            onClick={handleMassDelete}
            disabled={massDeleteMutation.isPending}
            className="ml-4 text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            Mass delete
          </button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Error: {(error as Error).message}
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
                    Edit
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    ID
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
                    Link SP
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Màu
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Size
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Số lượng
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Giá web
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ghi chú
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelect(item.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Link
                        href={`/orders/${item.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.id}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.websiteName || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.username}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {formatDate(item.ngaySaveLink)}
                    </td>
                    <td className="max-w-[150px] truncate px-2 py-2">
                      {item.linkWeb ? (
                        <a
                          href={item.linkWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {item.linkWeb}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.color || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {item.size || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {item.soLuong}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {formatCurrency(item.donGiaWeb)}
                    </td>
                    <td className="max-w-[150px] truncate px-2 py-2 text-gray-900">
                      {item.ghiChu || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {getStatusText(item.trangThaiOrder)}
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
            {Math.min(data.page * data.limit, data.total)} of {data.total}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))}
              disabled={data.page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))}
              disabled={data.page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
