'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

interface InStockItem {
  id: number;
  maSoHang: string;
  tenHinh: string;
  tenHang: string;
  linkHang: string;
  giaTien: number;
  moTa: string;
  soSao: number;
  thuTu: number;
}

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const API_BASE = '/api/in-stock-items';

const getInStockItems = async (params: QueryParams): Promise<PaginatedResponse<InStockItem>> => {
  const response = await fetch(`${API_BASE}?${new URLSearchParams(params as any)}`);
  if (!response.ok) throw new Error('Failed to fetch in-stock items');
  return response.json();
};

const deleteInStockItem = async (id: number) => {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete item');
};

/**
 * In-Stock Items List Page
 *
 * Converted from admin/HangCoSan_LietKe.aspx
 */
export default function InStockItemsPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<QueryParams>({ page: 1, limit: 20, search: '' });

  const { data, isLoading, error } = useQuery({
    queryKey: ['in-stock-items', filters],
    queryFn: () => getInStockItems(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInStockItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['in-stock-items'] });
    },
  });

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa không?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="space-y-4">
      {/* Page tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <span className="rounded bg-gray-600 px-3 py-1 text-sm text-white">
          Quản lý hàng có sẵn
        </span>
        <Link
          href="/admin/in-stock-items/new"
          className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Tạo mới
        </Link>
      </div>

      {/* Search filter */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            value={filters.search || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="rounded-lg bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
          >
            Tìm kiếm
          </button>
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
          Error: {(error as Error).message}
        </div>
      )}

      {/* Data table */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Mã số hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Tên hàng
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Hình
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Giá tiền
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  Số sao
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  Thứ tự
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                    {item.maSoHang}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                    {item.tenHang}
                  </td>
                  <td className="px-4 py-3">
                    {item.tenHinh ? (
                      <img
                        src={`/imgHangCoSan/${item.tenHinh}`}
                        alt={item.tenHang}
                        className="h-12 w-auto"
                      />
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">
                    {formatCurrency(item.giaTien)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-gray-900">
                    {item.soSao || 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-gray-900">
                    {item.thuTu || 0}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <Link
                      href={`/in-stock-items/${item.id}`}
                      className="mr-2 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
