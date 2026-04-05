'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrdersQLDatHang, getStatusCounts } from '@/lib/api';
import { Order } from '@/types/order';

const ORDER_STATUSES = ['Received', 'Ordered', 'Shipped', 'Completed', 'Cancelled'];

/**
 * DanhSachDonHang Page - Public Order List
 * Converted from: UF/DanhSachDonHang.aspx
 * Uses stored procedure: SP_Lay_DonHang
 */
export default function DanhSachDonHangPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Received']);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});

  const limit = 50;

  useEffect(() => {
    loadOrders();
    loadStatusCounts();
  }, [page, selectedStatuses]);

  const loadStatusCounts = async () => {
    try {
      const counts = await getStatusCounts();
      setStatusCounts(counts || {});
    } catch (error) {
      console.error('Error loading status counts:', error);
    }
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const response = await getOrdersQLDatHang({
        search,
        statuses: selectedStatuses,
        page,
        limit,
      });
      setOrders(response.danhSachDonHang || []);
      setTotal(response.totalItem || 0);
    } catch (error) {
      console.error('Error loading orders:', error);
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
    loadOrders();
  };

  const handleExportExcel = () => {
    // Create CSV content
    const headers = ['Mã ĐH', 'Ngày ĐH', 'Order Number', 'Link', 'Màu', 'Size', 'SL', 'Giá web', '% off', 'Ship', '% Tax', '% Công', 'Công NT', 'Tổng NT', 'Tỷ giá', 'Tổng VND', 'Status', 'VN Status', 'Ghi chú'];

    const rows = orders.map(order => [
      order.id,
      order.ngayMuaHang ? new Date(order.ngayMuaHang).toLocaleDateString('vi-VN') : '',
      order.orderNumber || '',
      order.linkWeb || '',
      order.color || '',
      order.size || '',
      order.soLuong || 0,
      order.donGiaWeb || 0,
      order.saleOff || 0,
      order.shipUsa || '',
      order.tax || 0,
      order.cong || 0,
      order.tienCongUsd || 0,
      order.tongTienUsd || 0,
      order.tyGia || 0,
      order.tongTienVnd || 0,
      order.trangThaiOrder || '',
      order.ngayVeVn ? `Đợt hàng ${new Date(order.ngayVeVn).toLocaleDateString('vi-VN')}` : '',
      order.ghiChu || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DanhSachDatHang_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalPages = Math.ceil(total / limit);

  const formatNumber = (num: number | null | undefined) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">Danh sách đơn hàng</h2>

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-3 mb-6 p-4 bg-cyan-50 rounded-xl">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 w-full sm:w-40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
        />
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((status) => (
            <label key={status} className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-cyan-300 transition-colors duration-150">
              <input
                type="checkbox"
                checked={selectedStatuses.includes(status)}
                onChange={() => toggleStatus(status)}
                className="cursor-pointer accent-cyan-600"
              />
              <span className="text-sm text-slate-700">
                {status}
                {statusCounts[status] !== undefined && ` (${statusCounts[status]})`}
              </span>
            </label>
          ))}
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow"
        >
          Xem
        </button>
        <button
          onClick={handleExportExcel}
          disabled={orders.length === 0}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Export to Excel
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <svg className="w-8 h-8 animate-spin text-cyan-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-2 text-slate-600">Đang tải...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Mã ĐH</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ngày ĐH</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Order Number</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Link</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Hình</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Màu</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Size</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">SL</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Giá web</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">% off</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ship</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">% Tax</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">% Công</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Công NT</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tổng NT</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tỷ giá</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tổng VND</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Status</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">VN Status</th>
                  <th className="border-b border-cyan-200 px-2 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="text-center py-8 text-slate-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-cyan-50/50'}
                    >
                      <td className="border-b border-cyan-100 px-2 py-2 text-cyan-600 font-medium">{order.id}</td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-slate-600">
                        {order.ngayMuaHang
                          ? new Date(order.ngayMuaHang).toLocaleDateString('vi-VN')
                          : ''}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-slate-600">{order.orderNumber}</td>
                      <td className="border-b border-cyan-100 px-2 py-2">
                        {order.hangKhoan ? (
                          ''
                        ) : order.linkWeb ? (
                          <a
                            href={order.linkWeb}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-600 hover:text-cyan-800 cursor-pointer"
                          >
                            {order.linkWeb.substring(0, 30)}...
                          </a>
                        ) : null}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2">
                        {order.linkHinh && (
                          <img src={order.linkHinh} alt="hình" height="50" className="rounded-lg" />
                        )}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-slate-600">{order.color}</td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-slate-600">{order.size}</td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-right font-medium text-slate-700">
                        {order.soLuong}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-right text-slate-700">
                        {formatNumber(order.donGiaWeb)}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-right text-slate-700">
                        {order.saleOff}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-slate-600">{order.shipUsa}</td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-right text-slate-700">
                        {order.tax}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-right text-slate-700">
                        {order.cong}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-right text-slate-700">
                        {formatNumber(order.tienCongUsd)}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-right text-slate-700 font-medium">
                        {formatNumber(order.tongTienUsd)}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-right text-slate-600">
                        {formatNumber(order.tyGia)}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-right text-cyan-700 font-bold">
                        {formatNumber(order.tongTienVnd)}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2">
                        {order.trangThaiOrder === 'Shipped' ? (
                          <Link
                            href={`/UF/ThongTinShiphang.aspx?id=${order.id}`}
                            className="text-cyan-600 hover:text-cyan-800 cursor-pointer font-medium"
                          >
                            Shipped
                          </Link>
                        ) : (
                          <span className="text-slate-600">{order.trangThaiOrder}</span>
                        )}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-slate-600">
                        {order.ngayVeVn
                          ? `Đợt hàng ${new Date(order.ngayVeVn).toLocaleDateString('vi-VN')}`
                          : ''}
                      </td>
                      <td className="border-b border-cyan-100 px-2 py-2 text-slate-500">{order.ghiChu}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-cyan-50 hover:border-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
              >
                Previous
              </button>
              <span className="px-4 py-1.5 text-slate-600">
                Trang <span className="font-medium text-cyan-700">{page}</span> / {totalPages} (Tổng: {total})
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-cyan-50 hover:border-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
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
