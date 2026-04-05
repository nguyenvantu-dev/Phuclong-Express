'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth-context';
import { getShipmentGroups } from '@/lib/api';

interface ShipmentGroupItem {
  tenDotHang: string;
  username: string;
  shipperName?: string;
  shipperID?: number;
  soVanDon?: string;
  phiShipTrongNuoc?: number;
  soLuongHang?: number;
  ngayVeVN?: string;
}

/**
 * DotHangUser Page - Shipment Groups List
 * Converted from: UF/DotHangUser.aspx
 * Uses backend: shipment-groups
 */
export default function DotHangUserPage() {
  const { user } = useAuth();
  const [shipments, setShipments] = useState<ShipmentGroupItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 20;

  useEffect(() => {
    if (user?.username) {
      loadShipments();
    }
  }, [page, user]);

  const loadShipments = async () => {
    if (!user?.username) return;

    setIsLoading(true);
    try {
      const response = await getShipmentGroups({
        username: user.username,
        page,
        limit,
      });
      setShipments(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Error loading shipments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">Hàng đang gửi</h2>

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
          <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Đợt hàng</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">User Name</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Shipper</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Số vận đơn</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Phí gửi</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Số lượng hàng</th>
                </tr>
              </thead>
              <tbody>
                {shipments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  shipments.map((shipment, index) => (
                    <tr key={shipment.tenDotHang || index} className="bg-white">
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-cyan-600 font-medium">{shipment.tenDotHang}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{shipment.username}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">
                        {shipment.shipperName ? (
                          <Link href={`/shipper-detail?id=${shipment.shipperID}`} className="text-cyan-600 hover:text-cyan-800">
                            {shipment.shipperName}
                          </Link>
                        ) : '-'}
                      </td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{shipment.soVanDon || '-'}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">
                        {shipment.phiShipTrongNuoc ? formatNumber(shipment.phiShipTrongNuoc) : '-'}
                      </td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">
                        {shipment.soLuongHang || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
