'use client';

import Link from 'next/link';
import { FiExternalLink, FiEdit2, FiTrash2, FiPackage } from 'react-icons/fi';
import { Order } from '@/types/order';
import OrderStatusBadge from './order-status-badge';

interface OrderListTableProps {
  orders: Order[];
  deletingId: number | null;
  onDelete: (order: Order) => void;
  formatNumber: (num: number | null | undefined) => string;
}

const TH = ({
  children,
  align = 'left',
  className = '',
}: {
  children?: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}) => (
  <th
    className={`border-b border-slate-200 px-2 py-2 ${
      align === 'right' ? 'text-right' : 'text-left'
    } text-slate-500 font-semibold text-[9px] uppercase tracking-wide whitespace-nowrap bg-slate-50 ${className}`}
  >
    {children}
  </th>
);

/** Dense data table for the user order list */
export default function OrderListTable({ orders, deletingId, onDelete, formatNumber }: OrderListTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#14264b]/5 flex items-center justify-center mb-4">
          <FiPackage className="w-8 h-8 text-[#14264b]/60" />
        </div>
        <p className="text-slate-700 font-semibold text-lg mb-1">Không có đơn hàng</p>
        <p className="text-slate-400 text-sm">Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
      <table className="w-full min-w-[1200px] border-collapse text-[11px]">
        <thead>
          <tr>
            <TH>Mã ĐH</TH>
            <TH>Ngày ĐH</TH>
            <TH>Order Number</TH>
            <TH>Link</TH>
            <TH>Hình</TH>
            <TH>Màu</TH>
            <TH>Size</TH>
            <TH align="right">SL</TH>
            <TH align="right">Giá web</TH>
            <TH align="right">% off</TH>
            <TH align="right">Ship</TH>
            <TH align="right">% Tax</TH>
            <TH align="right">% Công</TH>
            <TH align="right">Công NT</TH>
            <TH align="right">Tổng NT</TH>
            <TH align="right">Tỷ giá</TH>
            <TH align="right">Tổng VND</TH>
            <TH>Status</TH>
            <TH>VN Status</TH>
            <TH>Ghi chú</TH>
            <TH></TH>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => {
            const canEdit = order.trangThaiOrder === 'Received' && !order.hangKhoan;
            return (
              <tr
                key={order.id}
                className={`group transition-colors duration-150 hover:bg-[#14264b]/5 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                }`}
              >
                {/* Mã ĐH */}
                <td className="border-b border-slate-100 px-2 py-2.5 font-semibold text-[#14264b] whitespace-nowrap">
                  #{order.id}
                </td>

                {/* Ngày ĐH */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-slate-500 text-[10px] whitespace-nowrap">
                  {order.ngayMuaHang
                    ? new Date(order.ngayMuaHang).toLocaleDateString('vi-VN')
                    : '—'}
                </td>

                {/* Order Number */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-slate-600 text-[10px] whitespace-nowrap">
                  {order.orderNumber || '—'}
                </td>

                {/* Link */}
                <td className="border-b border-slate-100 px-2 py-2.5">
                  {!order.hangKhoan && order.linkWeb ? (
                    <a
                      href={order.linkWeb}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-w-0 max-w-[180px] items-center gap-1 text-[#14264b] hover:text-[#0f1e38] cursor-pointer text-[10px]"
                    >
                      <FiExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{order.linkWeb.replace(/^https?:\/\//, '').substring(0, 25)}…</span>
                    </a>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                {/* Hình */}
                <td className="border-b border-slate-100 px-2 py-2.5">
                  {order.linkHinh ? (
                    <img
                      src={order.linkHinh}
                      alt="sản phẩm"
                      width={44}
                      height={44}
                      className="w-11 h-11 object-cover rounded-lg border border-slate-200"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">
                      <FiPackage className="w-4 h-4 text-slate-300" />
                    </div>
                  )}
                </td>

                {/* Màu */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-slate-600 text-[10px] whitespace-nowrap">
                  {order.color || '—'}
                </td>

                {/* Size */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-slate-600 text-[10px] whitespace-nowrap">
                  {order.size || '—'}
                </td>

                {/* SL */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right font-semibold text-slate-700 whitespace-nowrap">
                  {order.soLuong}
                </td>

                {/* Giá web */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right text-slate-600 text-[10px] whitespace-nowrap">
                  {formatNumber(order.donGiaWeb)}
                </td>

                {/* % off */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right text-slate-600 text-[10px] whitespace-nowrap">
                  {order.saleOff != null ? `${order.saleOff}%` : '—'}
                </td>

                {/* Ship */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right text-slate-600 text-[10px] whitespace-nowrap">
                  {order.shipUsa != null ? formatNumber(order.shipUsa) : '—'}
                </td>

                {/* % Tax */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right text-slate-600 text-[10px] whitespace-nowrap">
                  {order.tax != null ? `${order.tax}%` : '—'}
                </td>

                {/* % Công */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right text-slate-600 text-[10px] whitespace-nowrap">
                  {order.cong != null ? `${order.cong}%` : '—'}
                </td>

                {/* Công NT */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right text-slate-600 text-[10px] whitespace-nowrap">
                  {formatNumber(order.tienCongUsd)}
                </td>

                {/* Tổng NT */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right font-semibold text-slate-700 whitespace-nowrap">
                  {formatNumber(order.tongTienUsd)}
                </td>

                {/* Tỷ giá */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right text-slate-500 text-[10px] whitespace-nowrap">
                  {formatNumber(order.tyGia)}
                </td>

                {/* Tổng VND */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-right font-bold text-[#14264b] whitespace-nowrap">
                  {formatNumber(order.tongTienVnd)}
                </td>

                {/* Status */}
                <td className="border-b border-slate-100 px-2 py-2.5 whitespace-nowrap">
                  <OrderStatusBadge
                    status={order.trangThaiOrder}
                    asLink={order.trangThaiOrder === 'Shipped'}
                    href={`/UF/ThongTinShiphang.aspx?id=${order.id}`}
                  />
                </td>

                {/* VN Status */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-slate-500 text-[10px] whitespace-nowrap">
                  {order.ngayVeVn
                    ? `Đợt ${new Date(order.ngayVeVn).toLocaleDateString('vi-VN')}`
                    : '—'}
                </td>

                {/* Ghi chú */}
                <td className="border-b border-slate-100 px-2 py-2.5 text-slate-400 text-[10px]">
                  <div className="max-w-[180px] whitespace-normal break-words">
                    {order.ghiChu || '—'}
                  </div>
                </td>

                {/* Actions */}
                <td className="border-b border-slate-100 px-1 py-1.5">
                  <div className="flex w-full items-center gap-1">
                    {canEdit && (
                      <Link
                        href={`/sua-don-hang?id=${order.id}`}
                        className="flex items-center justify-center rounded-md bg-[#14264b]/5 px-2 py-2 text-[#14264b] hover:bg-[#14264b]/10 cursor-pointer transition-colors duration-150"
                        title="Sửa đơn hàng"
                      >
                        <FiEdit2 className="w-3 h-3" />
                      </Link>
                    )}
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => onDelete(order)}
                        disabled={deletingId === order.id}
                        className="flex items-center justify-center rounded-md bg-red-50 px-2 py-2 text-red-600 hover:bg-red-100 cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Xóa đơn hàng"
                      >
                        <FiTrash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
