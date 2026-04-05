'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-context';
import { getShipmentGroupByUsernameAndTenDotHang, getBatches } from '@/lib/api';

interface BatchItem {
  tenDotHang: string;
}

interface OrderItem {
  ID: number;
  ngaymuahang: string;
  linkhinh: string;
  soluong: number;
  corlor: string;
  size: string;
  tongtienUSD: number;
  tongtienVND: number;
  shipUSA: number;
  ghichu: string;
}

interface BatchInfo {
  tenDotHang: string;
  ngayVeVN?: string;
  tongTienUSD?: number;
  tongTienVND?: number;
  phiShipVeVNVND?: number;
  phiShipTrongNuoc?: number;
  tongTienThanhToan?: number;
  canNang?: number;
  orders?: OrderItem[];
}

function ThongTinDotHangContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const preSelectedDotHang = searchParams.get('dotHang');

  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedDotHang, setSelectedDotHang] = useState('');
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBatches();
  }, []);

  useEffect(() => {
    if (preSelectedDotHang) {
      setSelectedDotHang(preSelectedDotHang);
      if (user?.username) {
        loadBatchInfo(preSelectedDotHang, user.username);
      }
    }
  }, [preSelectedDotHang, user]);

  useEffect(() => {
    if (selectedDotHang && user?.username) {
      loadBatchInfo(selectedDotHang, user.username);
    }
  }, [selectedDotHang, user]);

  const loadBatches = async () => {
    try {
      const data = await getBatches();
      setBatches(data || []);
    } catch (err) {
      console.error('Error loading batches:', err);
    }
  };

  const loadBatchInfo = async (tenDotHang: string, username: string) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getShipmentGroupByUsernameAndTenDotHang(username, tenDotHang);
      setBatchInfo(data);
    } catch (err) {
      console.error('Error loading batch info:', err);
      setError('Không tìm thấy thông tin đợt hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimKiem = () => {
    if (selectedDotHang && user?.username) {
      loadBatchInfo(selectedDotHang, user.username);
    }
  };

  const formatNumber = (num: number | null | undefined, decimals = 0) => {
    if (!num && num !== 0) return '-';
    return new Intl.NumberFormat('vi-VN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">Thông tin đợt hàng</h2>

      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-4 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Đợt hàng (Năm - Tháng - Ngày)
            </label>
            <select
              value={selectedDotHang}
              onChange={(e) => setSelectedDotHang(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 min-w-[200px]"
            >
              <option value="">-- Chọn đợt hàng --</option>
              {batches.map((batch) => (
                <option key={batch.tenDotHang} value={batch.tenDotHang}>
                  {batch.tenDotHang}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleTimKiem}
            disabled={!selectedDotHang || isLoading}
            className="px-4 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors duration-150 disabled:opacity-50"
          >
            Xem
          </button>
        </div>
      </div>

      {error && <div className="text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-lg">{error}</div>}

      {isLoading ? (
        <div className="text-center py-12">
          <svg className="w-8 h-8 animate-spin text-cyan-600 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-2 text-slate-600">Đang tải...</p>
        </div>
      ) : batchInfo ? (
        <>
          <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-4 mb-6">
            <table className="w-full">
              <tbody>
                <tr className="border-b border-cyan-100">
                  <td className="px-4 py-2 text-right font-bold text-slate-700 w-1/2">Đợt hàng ngày:</td>
                  <td className="px-4 py-2 text-slate-600">{formatDate(batchInfo.ngayVeVN)}</td>
                </tr>
                <tr className="border-b border-cyan-100">
                  <td className="px-4 py-2 text-right font-bold text-slate-700">Tổng tiền hàng (ngoại tệ):</td>
                  <td className="px-4 py-2 text-slate-600">{formatNumber(batchInfo.tongTienUSD, 2)} USD</td>
                </tr>
                <tr className="border-b border-cyan-100">
                  <td className="px-4 py-2 text-right font-bold text-slate-700">Tổng tiền hàng (VNĐ):</td>
                  <td className="px-4 py-2 text-slate-600">{formatNumber(batchInfo.tongTienVND)} VNĐ</td>
                </tr>
                <tr className="border-b border-cyan-100">
                  <td className="px-4 py-2 text-right font-bold text-slate-700">Tiền ship từ nước ngoài về VN:</td>
                  <td className="px-4 py-2 text-slate-600">{formatNumber(batchInfo.phiShipVeVNVND)} VNĐ</td>
                </tr>
                <tr className="border-b border-cyan-100">
                  <td className="px-4 py-2 text-right font-bold text-slate-700">Tiền ship trong nước:</td>
                  <td className="px-4 py-2 text-slate-600">{formatNumber(batchInfo.phiShipTrongNuoc)} VNĐ</td>
                </tr>
                <tr className="border-b border-cyan-100">
                  <td className="px-4 py-2 text-right font-bold text-slate-700">Tổng tiền cần thanh toán:</td>
                  <td className="px-4 py-2 text-cyan-700 font-bold">{formatNumber(batchInfo.tongTienThanhToan)} VNĐ</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-right font-bold text-slate-700">Cân nặng:</td>
                  <td className="px-4 py-2 text-slate-600">{batchInfo.canNang || '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Mã ĐH</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ngày ĐH</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-center text-cyan-700 font-semibold text-xs uppercase tracking-wide">Hình</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">SL</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Màu</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Size</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tổng ngoại tệ</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tổng VNĐ</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">ShipUS</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {batchInfo.orders && batchInfo.orders.length > 0 ? (
                  batchInfo.orders.map((order) => (
                    <tr key={order.ID} className="bg-white">
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-cyan-600 font-medium">{order.ID}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{formatDate(order.ngaymuahang)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-center">
                        {order.linkhinh && (
                          <img src={order.linkhinh} alt="product" height="50px" className="max-w-[50px] h-auto" />
                        )}
                      </td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{order.soluong}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{order.corlor || '-'}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{order.size || '-'}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.tongtienUSD, 2)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.tongtienVND)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.shipUSA, 2)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{order.ghichu || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-slate-500">
          Vui lòng chọn đợt hàng để xem thông tin
        </div>
      )}
    </div>
  );
}

export default function ThongTinDotHangPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <svg className="w-8 h-8 animate-spin text-cyan-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <ThongTinDotHangContent />
    </Suspense>
  );
}
