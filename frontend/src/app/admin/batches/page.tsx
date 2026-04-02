'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Batches List Page
 *
 * Converted from admin/LoHang_LietKe.aspx
 * Features:
 * - Filter panel: username, date range
 * - Data table with batches
 * - Pagination
 */
interface Batch {
  ID: number;
  UserName: string;
  TrackingNumber: string;
  OrderNumber: string;
  NgayDatHang: string;
  TenLoHang: string;
  TinhTrang: string;
  LoaiTien: string;
  TyGia: number;
  NgayDenDuKien: string;
  NgayDenThucTe: string;
  GhiChu: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const getBatches = async (params: Record<string, any>) => {
  const response = await axios.get<PaginatedResponse<Batch>>(`${API_URL}/batches`, { params });
  return response.data;
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

export default function BatchesPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    username: '',
    startDate: '',
    endDate: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['batches', filters],
    queryFn: () => getBatches(filters),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách lô hàng</h1>
        <Link
          href="/admin/batches/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm mới lô hàng
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Tìm theo username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 20, username: '', startDate: '', endDate: '' })}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mr-2"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center">Đang tải...</div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">Lỗi tải dữ liệu</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã lô hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày dự kiến</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày thực tế</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tình trạng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data.map((batch) => (
                  <tr key={batch.ID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{batch.ID}</td>
                    <td className="px-4 py-3 text-sm">{batch.UserName}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/batches/${batch.ID}`} className="text-blue-600 hover:underline">
                        {batch.TenLoHang}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">{batch.TrackingNumber}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(batch.NgayDatHang)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(batch.NgayDenDuKien)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(batch.NgayDenThucTe)}</td>
                    <td className="px-4 py-3 text-sm">{batch.TinhTrang}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/batches/${batch.ID}/edit`}
                        className="text-blue-600 hover:underline mr-2"
                      >
                        Sửa
                      </Link>
                      <Link
                        href={`/batches/${batch.ID}/costs`}
                        className="text-green-600 hover:underline"
                      >
                        Chi phí
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 flex items-center justify-between border-t">
                <div className="text-sm text-gray-700">
                  Trang {data?.page} / {totalPages} (Tổng: {data?.total} bản ghi)
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
