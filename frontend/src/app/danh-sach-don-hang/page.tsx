'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';
import { deleteOrderForUser, getOrdersQLDatHang, getUserStatusCounts } from '@/lib/api';
import { Order } from '@/types/order';
import { useAuthStore } from '@/hooks/use-auth';
import OrderFilterBar from './components/order-filter-bar';
import OrderListTable from './components/order-list-table';
import OrderPagination from './components/order-pagination';

const LIMIT = 20;

/**
 * DanhSachDonHang Page - User order list
 * Converted from: UF/DanhSachDonHang.aspx
 */
export default function DanhSachDonHangPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Received']);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.username) return;
    loadOrders();
    loadStatusCounts();
  }, [page, selectedStatuses, user?.username]);

  const loadStatusCounts = async () => {
    if (!user?.username) return;
    try {
      const counts = await getUserStatusCounts(user.username, -1);
      setStatusCounts(counts || {});
    } catch (err) {
      console.error('Error loading status counts:', err);
    }
  };

  const loadOrders = async () => {
    if (!user?.username) return;
    setIsLoading(true);
    try {
      const response = await getOrdersQLDatHang({
        username: user.username,
        search,
        statuses: selectedStatuses,
        page,
        limit: LIMIT,
      });
      setOrders(response.danhSachDonHang || []);
      setTotal(response.totalItem || 0);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setPage(1);
  };

  const handleSearchSubmit = () => {
    setPage(1);
    loadOrders();
  };

  const handleDelete = async (order: Order) => {
    if (!user?.username) return;
    if (order.trangThaiOrder !== 'Received' || order.hangKhoan) return;
    if (!window.confirm('Bạn có chắc muốn xóa không?')) return;

    setDeletingId(order.id);
    try {
      const result = await deleteOrderForUser(order.id, user.username);
      if (!result.success) {
        window.alert('Xóa đơn hàng không thành công');
        return;
      }
      await Promise.all([loadOrders(), loadStatusCounts()]);
    } catch (err) {
      console.error('Error deleting order:', err);
      window.alert('Xóa đơn hàng không thành công');
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const headers = [
      'Mã ĐH','Ngày ĐH','Order Number','Link','Màu','Size','SL',
      'Giá web','% off','Ship','% Tax','% Công','Công NT','Tổng NT',
      'Tỷ giá','Tổng VND','Status','VN Status','Ghi chú',
    ];
    const rows = orders.map((o) => [
      o.id,
      o.ngayMuaHang ? new Date(o.ngayMuaHang).toLocaleDateString('vi-VN') : '',
      o.orderNumber || '', o.linkWeb || '', o.color || '', o.size || '',
      o.soLuong, o.donGiaWeb, o.saleOff ?? 0, o.shipUsa ?? '',
      o.tax, o.cong ?? 0, o.tienCongUsd ?? 0, o.tongTienUsd ?? 0,
      o.tyGia ?? 0, o.tongTienVnd ?? 0, o.trangThaiOrder || '',
      o.ngayVeVn ? `Đợt hàng ${new Date(o.ngayVeVn).toLocaleDateString('vi-VN')}` : '',
      o.ghiChu || '',
    ]);
    const csv = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `DanhSachDatHang_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-8">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Danh sách đơn hàng</h1>
          <p className="text-sm text-slate-400 mt-0.5">Theo dõi và quản lý các đơn hàng của bạn</p>
        </div>
        <Link
          href="/dat-hang"
          className="flex items-center gap-2 px-4 py-2 bg-[#14264b] hover:bg-[#1f3a6d] text-white text-sm font-medium rounded-xl cursor-pointer transition-colors duration-200 shadow-sm"
        >
          <FiPlus className="w-4 h-4" />
          Đặt hàng mới
        </Link>
      </div>

      {/* Filter bar */}
      <OrderFilterBar
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        selectedStatuses={selectedStatuses}
        onToggleStatus={handleToggleStatus}
        statusCounts={statusCounts}
        onExport={handleExport}
        exportDisabled={orders.length === 0}
      />

      {/* Loading skeleton */}
      {isLoading ? (
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="h-11 bg-slate-50 border-b border-slate-200" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3 px-4 py-3 border-b border-slate-100 animate-pulse">
              <div className="h-4 w-10 bg-slate-200 rounded" />
              <div className="h-4 w-20 bg-slate-100 rounded" />
              <div className="h-4 w-28 bg-slate-100 rounded" />
              <div className="h-4 flex-1 bg-slate-100 rounded" />
              <div className="h-4 w-16 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <OrderListTable
            orders={orders}
            deletingId={deletingId}
            onDelete={handleDelete}
            formatNumber={formatNumber}
          />
          <OrderPagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
          />
        </>
      )}
    </div>
  );
}
