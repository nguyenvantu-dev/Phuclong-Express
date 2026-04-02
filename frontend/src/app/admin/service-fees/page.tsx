'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

interface ServiceFee {
  id: number;
  loaiTien: string;
  tuGia: number;
  denGia: number;
  tienCong1Mon: number;
  tinhTheoPhanTram: boolean;
  khachBuon: boolean;
}

interface QueryParams {
  page?: number;
  limit?: number;
  loaiTien?: string;
  khachBuon?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const API_BASE = '/api/service-fees';

const getServiceFees = async (params: QueryParams): Promise<PaginatedResponse<ServiceFee>> => {
  const response = await fetch(`${API_BASE}?${new URLSearchParams(params as any)}`);
  if (!response.ok) throw new Error('Failed to fetch service fees');
  return response.json();
};

const deleteServiceFee = async (id: number) => {
  const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Failed to delete service fee');
};

/**
 * Service Fees List Page
 *
 * Converted from admin/GiaTienCong_LietKe.aspx
 * Features:
 * - List all service fees
 * - Delete service fee
 * - Create new service fee link
 */
export default function ServiceFeesPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<QueryParams>({ page: 1, limit: 20 });

  const { data, isLoading, error } = useQuery({
    queryKey: ['service-fees', filters],
    queryFn: () => getServiceFees(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteServiceFee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-fees'] });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Bạn có chắc muốn xóa không?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="space-y-4">
      {/* Page tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <span className="rounded bg-gray-600 px-3 py-1 text-sm text-white">
          Quản lý giá tiền công
        </span>
        <Link
          href="/admin/service-fees/new"
          className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Tạo mới
        </Link>
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
          Error loading service fees: {(error as Error).message}
        </div>
      )}

      {/* Data table */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  Loại tiền
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Từ giá
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Đến giá
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                  Tiền công 1 món
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  Tính theo %
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  Khách buôn
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.data.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-gray-900">
                    {fee.loaiTien}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">
                    {formatCurrency(fee.tuGia)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">
                    {formatCurrency(fee.denGia)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-gray-900">
                    {formatCurrency(fee.tienCong1Mon)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-gray-900">
                    {fee.tinhTheoPhanTram ? 'Yes' : 'No'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center text-gray-900">
                    {fee.khachBuon ? 'Yes' : 'No'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-center">
                    <Link
                      href={`/service-fees/${fee.id}`}
                      className="mr-2 text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(fee.id)}
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
