'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getOrdersQLDatHang } from '@/lib/api';
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

  const limit = 50;

  useEffect(() => {
    loadOrders();
  }, [page, selectedStatuses]);

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

  const totalPages = Math.ceil(total / limit);

  const formatNumber = (num: number | null | undefined) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Danh sách đơn hàng</h2>

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
          {ORDER_STATUSES.map((status) => (
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
                  <th className="border border-gray-300 px-2 py-1">Mã ĐH</th>
                  <th className="border border-gray-300 px-2 py-1">Ngày ĐH</th>
                  <th className="border border-gray-300 px-2 py-1">Order Number</th>
                  <th className="border border-gray-300 px-2 py-1">Link</th>
                  <th className="border border-gray-300 px-2 py-1">Hình</th>
                  <th className="border border-gray-300 px-2 py-1">Màu</th>
                  <th className="border border-gray-300 px-2 py-1">Size</th>
                  <th className="border border-gray-300 px-2 py-1">SL</th>
                  <th className="border border-gray-300 px-2 py-1">Giá web</th>
                  <th className="border border-gray-300 px-2 py-1">% off</th>
                  <th className="border border-gray-300 px-2 py-1">Ship</th>
                  <th className="border border-gray-300 px-2 py-1">% Tax</th>
                  <th className="border border-gray-300 px-2 py-1">% Công</th>
                  <th className="border border-gray-300 px-2 py-1">Công NT</th>
                  <th className="border border-gray-300 px-2 py-1">Tổng NT</th>
                  <th className="border border-gray-300 px-2 py-1">Tỷ giá</th>
                  <th className="border border-gray-300 px-2 py-1">Tổng VND</th>
                  <th className="border border-gray-300 px-2 py-1">Status</th>
                  <th className="border border-gray-300 px-2 py-1">VN Status</th>
                  <th className="border border-gray-300 px-2 py-1">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="text-center py-4">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  orders.map((order, index) => (
                    <tr
                      key={order.id}
                      className={index % 2 === 0 ? '' : 'bg-gray-50'}
                    >
                      <td className="border border-gray-300 px-2 py-1">{order.id}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.ngayMuaHang
                          ? new Date(order.ngayMuaHang).toLocaleDateString('vi-VN')
                          : ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">{order.orderNumber}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.hangKhoan ? (
                          ''
                        ) : order.linkWeb ? (
                          <a
                            href={order.linkWeb}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {order.linkWeb.substring(0, 30)}...
                          </a>
                        ) : null}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.linkHinh && (
                          <img src={order.linkHinh} alt="hình" height="50" />
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">{order.color}</td>
                      <td className="border border-gray-300 px-2 py-1">{order.size}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {order.soLuong}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {formatNumber(order.donGiaWeb)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {order.saleOff}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">{order.shipUsa}</td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {order.tax}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {order.cong}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {formatNumber(order.tienCongUsd)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {formatNumber(order.tongTienUsd)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {formatNumber(order.tyGia)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {formatNumber(order.tongTienVnd)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.trangThaiOrder === 'Shipped' ? (
                          <Link
                            href={`/UF/ThongTinShiphang.aspx?id=${order.id}`}
                            className="text-blue-500 hover:underline"
                          >
                            Shipped
                          </Link>
                        ) : (
                          order.trangThaiOrder
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {order.ngayVeVn
                          ? `Đợt hàng ${new Date(order.ngayVeVn).toLocaleDateString('vi-VN')}`
                          : ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">{order.ghiChu}</td>
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
