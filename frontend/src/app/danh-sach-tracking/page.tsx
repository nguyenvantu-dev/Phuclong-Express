'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTrackingList, getTrackingDetails, deleteTracking } from '@/lib/api';

const TRACKING_STATUSES = ['Received', 'InTransit', 'InVN', 'VNTransit', 'Completed', 'Cancelled'];

/**
 * DanhSachTracking Page - Tracking List
 * Converted from: UF/DanhSachTracking.aspx
 * Uses backend: tracking service
 */
export default function DanhSachTrackingPage() {
  const [trackings, setTrackings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Received', 'InTransit', 'InVN', 'VNTransit', 'Completed']);

  const limit = 50;

  useEffect(() => {
    loadTrackings();
  }, [page, selectedStatuses]);

  const loadTrackings = async () => {
    setIsLoading(true);
    try {
      const response = await getTrackingList({
        search,
        statuses: selectedStatuses.join(','),
        page,
        limit,
      });
      setTrackings(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading trackings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setPage(1);
  };

  const handleSearch = () => {
    setPage(1);
    loadTrackings();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const handleDelete = async (trackingId: number) => {
    if (!confirm('Bạn có chắc muốn xóa không?')) {
      return;
    }

    try {
      await deleteTracking(trackingId);
      // Reload the list after delete
      loadTrackings();
    } catch (error) {
      console.error('Error deleting tracking:', error);
      alert('Có lỗi khi xóa tracking');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách tracking</h2>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-40"
        />
        <div className="flex gap-2">
          {TRACKING_STATUSES.map((status) => (
            <label key={status} className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={() => toggleStatus(status)}
                className="cursor-pointer"
              />
              <span className="text-sm">{status}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Xem
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">Mã</th>
                  <th className="border border-gray-300 px-2 py-1">Tracking Number</th>
                  <th className="border border-gray-300 px-2 py-1">Order Number</th>
                  <th className="border border-gray-300 px-2 py-1">Ngày ĐH</th>
                  <th className="border border-gray-300 px-2 py-1">Nhà vận chuyển</th>
                  <th className="border border-gray-300 px-2 py-1">Quốc gia</th>
                  <th className="border border-gray-300 px-2 py-1">Lô hàng</th>
                  <th className="border border-gray-300 px-2 py-1">Tình trạng</th>
                  <th className="border border-gray-300 px-2 py-1">Ghi chú</th>
                  <th className="border border-gray-300 px-2 py-1"></th>
                  <th className="border border-gray-300 px-2 py-1"></th>
                </tr>
              </thead>
              <tbody>
                {trackings.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-4">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  trackings.map((tracking, index) => (
                    <tr
                      key={tracking.id || tracking.TrackingID}
                      className={index % 2 === 0 ? '' : 'bg-gray-50'}
                    >
                      <td className="border border-gray-300 px-2 py-1">
                        {tracking.id || tracking.TrackingID}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {tracking.trackingNumber || tracking.TrackingNumber}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {tracking.orderNumber || tracking.OrderNumber}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {formatDate(tracking.ngayDatHang || tracking.NgayDatHang)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {tracking.tenNhaVanChuyen || tracking.TenNhaVanChuyen}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {tracking.tenQuocGia || tracking.TenQuocGia}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {tracking.tenLoHang || tracking.TenLoHang}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {tracking.tinhTrang || tracking.TinhTrang}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {tracking.ghiChu || tracking.GhiChu}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {(tracking.tinhTrang || tracking.TinhTrang) === 'Received' && (
                          <Link
                            href={`/sua-tracking?id=${tracking.id || tracking.TrackingID}`}
                            className="text-blue-500 hover:underline"
                          >
                            Sửa
                          </Link>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {(tracking.tinhTrang || tracking.TinhTrang) === 'Received' && (
                          <button
                            className="text-red-500 hover:underline"
                            onClick={() => handleDelete(tracking.id || tracking.TrackingID)}
                          >
                            Xóa
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Trang {page} / {totalPages} (Tổng: {total})
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
