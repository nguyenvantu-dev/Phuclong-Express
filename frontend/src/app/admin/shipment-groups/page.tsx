'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

/**
 * Shipment Groups List Page
 *
 * Converted from admin/DotHang_LietKe.aspx
 * Features:
 * - Filter panel: username, tenDotHang
 * - Data table with shipment groups
 * - Summary totals
 * - Pagination
 */
interface ShipmentGroup {
  ID: number;
  UserName: string;
  TenDotHang: string;
  CanNang: number;
  PhiShipVeVN_USD: number;
  PhiShipVeVN_VND: number;
  TyGia: number;
  NgayGuiHang: string;
  SoVanDon: string;
  ShipperID: number;
  DaYeuCauGuiHang: boolean;
  TienHangUSD: number;
  TienHangVND: number;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const getShipmentGroups = async (params: Record<string, string | number>) => {
  const response = await apiClient.get<PaginatedResponse<ShipmentGroup>>('/shipment-groups', { params });
  return response.data;
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatCurrency = (amount: number | null) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export default function ShipmentGroupsPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    username: '',
    tenDotHang: '',
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['shipment-groups', filters],
    queryFn: () => getShipmentGroups(filters),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  // Calculate totals
  const totals = data?.data.reduce(
    (acc, sg) => ({
      canNang: acc.canNang + (sg.CanNang || 0),
      phiShipUsd: acc.phiShipUsd + (sg.PhiShipVeVN_USD || 0),
      phiShipVnd: acc.phiShipVnd + (sg.PhiShipVeVN_VND || 0),
      tienHangUsd: acc.tienHangUsd + (sg.TienHangUSD || 0),
      tienHangVnd: acc.tienHangVnd + (sg.TienHangVND || 0),
    }),
    { canNang: 0, phiShipUsd: 0, phiShipVnd: 0, tienHangUsd: 0, tienHangVnd: 0 }
  ) || { canNang: 0, phiShipUsd: 0, phiShipVnd: 0, tienHangUsd: 0, tienHangVnd: 0 };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Danh sách đợt hàng</h1>
        <Link
          href="/admin/shipment-groups/new"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Thêm mới đợt hàng
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <label className="block text-sm font-medium mb-1">Tên đợt hàng</label>
            <input
              type="text"
              value={filters.tenDotHang}
              onChange={(e) => handleFilterChange('tenDotHang', e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="Tìm theo tên đợt hàng"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 20, username: '', tenDotHang: '' })}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên đợt hàng</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cân nặng</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Phí ship USD</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Phí ship VND</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tiền hàng USD</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Tiền hàng VND</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày gửi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số vận đơn</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data.map((sg) => (
                  <tr key={`${sg.UserName}-${sg.TenDotHang}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{sg.UserName}</td>
                    <td className="px-4 py-3 text-sm">{sg.TenDotHang}</td>
                    <td className="px-4 py-3 text-sm text-right">{sg.CanNang?.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(sg.PhiShipVeVN_USD)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(sg.PhiShipVeVN_VND)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(sg.TienHangUSD)}</td>
                    <td className="px-4 py-3 text-sm text-right">{formatCurrency(sg.TienHangVND)}</td>
                    <td className="px-4 py-3 text-sm">{formatDate(sg.NgayGuiHang)}</td>
                    <td className="px-4 py-3 text-sm">{sg.SoVanDon}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/shipment-groups/${sg.UserName}/${sg.TenDotHang}`}
                        className="text-blue-600 hover:underline mr-2"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold">
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right">Tổng:</td>
                  <td className="px-4 py-3 text-right">{totals.canNang.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals.phiShipUsd)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals.phiShipVnd)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals.tienHangUsd)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(totals.tienHangVnd)}</td>
                  <td colSpan={3}></td>
                </tr>
              </tfoot>
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
