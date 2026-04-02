'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

/**
 * Tracking List Page
 *
 * Converted from admin/Tracking_LietKe.aspx
 * Features:
 * - Filter panel: status, search, tracking number, username, date range, country
 * - Status counts
 * - Mass actions: delete, cancel, complete, update status
 * - Data table
 * - Pagination
 */
interface Tracking {
  ID: number;
  UserName: string;
  TrackingNumber: string;
  OrderNumber: string;
  NgayDatHang: string;
  TenLoHang: string;
  NhaVanChuyenID: number;
  QuocGiaID: number;
  TenQuocGia: string;
  TinhTrang: string;
  GhiChu: string;
  Kien: string;
  Mawb: string;
  Hawb: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

interface TrackingCounts {
  Received: number;
  InTransit: number;
  InVN: number;
  VNTransit: number;
  Completed: number;
  Cancelled: number;
}

const getTracking = async (params: Record<string, any>) => {
  const response = await axios.get<PaginatedResponse<Tracking>>(`${API_URL}/tracking`, { params });
  return response.data;
};

const getTrackingCounts = async () => {
  const response = await axios.get<TrackingCounts>(`${API_URL}/tracking/counts`);
  return response.data;
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const statusColors: Record<string, string> = {
  Received: 'bg-blue-100 text-blue-800',
  InTransit: 'bg-yellow-100 text-yellow-800',
  InVN: 'bg-orange-100 text-orange-800',
  VNTransit: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function TrackingPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    username: '',
    statuses: '',
    search: '',
    trackingNumber: '',
    startDate: '',
    endDate: '',
    quocGiaId: 0,
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['tracking', filters],
    queryFn: () => getTracking(filters),
  });

  const { data: counts } = useQuery({
    queryKey: ['tracking-counts'],
    queryFn: getTrackingCounts,
  });

  // Mass delete mutation
  const deleteMutation = useMutation({
    mutationFn: (ids: number[]) => axios.post(`${API_URL}/tracking/mass-delete`, { ids }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['tracking-counts'] });
      setSelectedIds([]);
    },
  });

  // Mass status mutation
  const statusMutation = useMutation({
    mutationFn: (data: { ids: number[]; tinhTrang: string }) =>
      axios.post(`${API_URL}/tracking/mass-status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['tracking-counts'] });
      setSelectedIds([]);
    },
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSelectAll = () => {
    if (selectedIds.length === data?.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.data.map((t) => t.ID) || []);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách tracking</h1>
        <Link
          href="/admin/tracking/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm mới tracking
        </Link>
      </div>

      {/* Status Counts */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-4">
        {Object.entries(counts || {}).map(([status, count]) => (
          <button
            key={status}
            onClick={() => handleFilterChange('statuses', status)}
            className={`px-3 py-2 rounded text-sm ${statusColors[status] || 'bg-gray-100'} ${filters.statuses === status ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
          >
            {status} ({count})
          </button>
        ))}
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
            <label className="block text-sm font-medium mb-1">Tracking Number</label>
            <input
              type="text"
              value={filters.trackingNumber}
              onChange={(e) => handleFilterChange('trackingNumber', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Tìm theo tracking"
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
        </div>
      </div>

      {/* Mass Actions */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 p-3 rounded mb-4 flex gap-2 flex-wrap">
          <span className="text-sm self-center mr-2">Đã chọn: {selectedIds.length}</span>
          <button
            onClick={() => statusMutation.mutate({ ids: selectedIds, tinhTrang: 'Received' })}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Set Received
          </button>
          <button
            onClick={() => statusMutation.mutate({ ids: selectedIds, tinhTrang: 'InTransit' })}
            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
          >
            Set InTransit
          </button>
          <button
            onClick={() => statusMutation.mutate({ ids: selectedIds, tinhTrang: 'InVN' })}
            className="px-3 py-1 bg-orange-500 text-white rounded text-sm"
          >
            Set InVN
          </button>
          <button
            onClick={() => statusMutation.mutate({ ids: selectedIds, tinhTrang: 'Completed' })}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            Set Completed
          </button>
          <button
            onClick={() => statusMutation.mutate({ ids: selectedIds, tinhTrang: 'Cancelled' })}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm"
          >
            Set Cancelled
          </button>
          <button
            onClick={() => deleteMutation.mutate(selectedIds)}
            className="px-3 py-1 bg-red-700 text-white rounded text-sm"
          >
            Xóa
          </button>
        </div>
      )}

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
                  <th className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === data?.data.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lô hàng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đặt</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tình trạng</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data.map((tracking) => (
                  <tr key={tracking.ID} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(tracking.ID)}
                        onChange={() => handleSelect(tracking.ID)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">{tracking.ID}</td>
                    <td className="px-4 py-3 text-sm">{tracking.UserName}</td>
                    <td className="px-4 py-3 text-sm">{tracking.TrackingNumber}</td>
                    <td className="px-4 py-3 text-sm">{tracking.OrderNumber}</td>
                    <td className="px-4 py-3 text-sm">{tracking.TenLoHang}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(tracking.NgayDatHang)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${statusColors[tracking.TinhTrang] || 'bg-gray-100'}`}>
                        {tracking.TinhTrang}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link href={`/tracking/${tracking.ID}/edit`} className="text-blue-600 hover:underline mr-2">
                        Sửa
                      </Link>
                      <Link href={`/tracking/${tracking.ID}`} className="text-green-600 hover:underline">
                        Chi tiết
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
