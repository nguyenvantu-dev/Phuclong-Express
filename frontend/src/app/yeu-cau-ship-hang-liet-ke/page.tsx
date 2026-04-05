'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth-context';
import { getShippingRequests, createShippingRequest } from '@/lib/api';

interface ShippingRequestItem {
  TenDotHang: string;
  MaDatHang: number;
  CanNang: number;
  PhiShipVeVN_USD: number;
  TyGia: number;
  PhiShipVeVN_VND: number;
  TienHangUSD: number;
  TienHangVND: number;
  YeuCauGui_ghichu?: string;
  NgayYeuCauGuiHang?: string;
}

export default function YeuCauShipHangLietKePage() {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState<ShippingRequestItem[]>([]);
  const [requestedOrders, setRequestedOrders] = useState<ShippingRequestItem[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [ghiChu, setGhiChu] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.username) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.username) return;

    setIsLoading(true);
    try {
      const [available, requested] = await Promise.all([
        getShippingRequests({ username: user.username, status: 0 }),
        getShippingRequests({ username: user.username, status: 1 }),
      ]);
      setAvailableOrders(available || []);
      setRequestedOrders(requested || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      const allKeys = new Set(availableOrders.map(o => `${o.TenDotHang}-${o.MaDatHang}`));
      setSelectedOrders(allKeys);
    } else {
      setSelectedOrders(new Set());
    }
  };

  const handleCheck = (tenDotHang: string, maDatHang: number, checked: boolean) => {
    const key = `${tenDotHang}-${maDatHang}`;
    const newSelected = new Set(selectedOrders);
    if (checked) {
      newSelected.add(key);
    } else {
      newSelected.delete(key);
    }
    setSelectedOrders(newSelected);
  };

  const isSelected = (tenDotHang: string, maDatHang: number) => {
    return selectedOrders.has(`${tenDotHang}-${maDatHang}`);
  };

  const handleSubmit = async () => {
    if (selectedOrders.size === 0) {
      setError('Vui lòng chọn ít nhất một mặt hàng');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get selected orders info
      const selectedItems = availableOrders.filter(o =>
        selectedOrders.has(`${o.TenDotHang}-${o.MaDatHang}`)
      );

      // Create shipping requests for each selected order
      if (!user?.username) {
        setError('Không xác định được người dùng');
        setIsLoading(false);
        return;
      }

      for (const item of selectedItems) {
        await createShippingRequest({
          tenDotHang: item.TenDotHang,
          username: user.username,
          ghiChu: ghiChu || undefined,
        });
      }

      setSuccess(`Đã gửi yêu cầu cho ${selectedItems.length} mặt hàng`);
      setSelectedOrders(new Set());
      setGhiChu('');
      loadData();
    } catch (err) {
      console.error('Error creating shipping request:', err);
      setError('Có lỗi khi gửi yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number | null | undefined, decimals = 2) => {
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
      <h2 className="text-2xl md:text-3xl font-bold mb-4 text-cyan-700">Yêu cầu gửi hàng</h2>
      <p className="text-slate-600 mb-6">
        Vui lòng chọn các mặt hàng cần gửi sớm (đã về đến VN). Để chúng tôi phục gửi sớm nhất có thể
      </p>

      {error && <div className="text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="text-emerald-500 mb-4 bg-emerald-50 px-4 py-3 rounded-lg">{success}</div>}

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
          <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-center text-cyan-700 font-semibold text-xs uppercase tracking-wide">
                    <input
                      type="checkbox"
                      checked={selectedOrders.size === availableOrders.length && availableOrders.length > 0}
                      onChange={(e) => handleCheckAll(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tên đợt hàng</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Mã đặt hàng</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Cân nặng</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Phí ship ngoại tệ</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tỷ giá</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Phí ship VND</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tiền hàng ngoại tệ</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tiền hàng VND</th>
                </tr>
              </thead>
              <tbody>
                {availableOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      Không có mặt hàng nào
                    </td>
                  </tr>
                ) : (
                  availableOrders.map((order) => (
                    <tr key={`${order.TenDotHang}-${order.MaDatHang}`} className="bg-white">
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected(order.TenDotHang, order.MaDatHang)}
                          onChange={(e) => handleCheck(order.TenDotHang, order.MaDatHang, e.target.checked)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{order.TenDotHang}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-cyan-600 font-medium">{order.MaDatHang}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.CanNang, 2)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.PhiShipVeVN_USD, 2)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.TyGia, 0)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.PhiShipVeVN_VND, 0)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.TienHangUSD, 2)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.TienHangVND, 0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-4 mb-6">
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Ghi chú khi yêu cầu</label>
            <textarea
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              rows={2}
              placeholder="Nhập ghi chú..."
            />
            <button
              onClick={handleSubmit}
              disabled={selectedOrders.size === 0 || isLoading}
              className="mt-4 px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50"
            >
              {isLoading ? 'Đang gửi...' : 'Yêu cầu gửi hàng'}
            </button>
          </div>

          <h3 className="text-xl font-bold mb-4 text-cyan-700">Các mặt hàng đang yêu cầu gửi</h3>
          <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tên đợt hàng</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Mã đặt hàng</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Cân nặng</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Phí ship ngoại tệ</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tỷ giá</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Phí ship VND</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tiền hàng ngoại tệ</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tiền hàng VND</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ghi chú khi yêu cầu gửi</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ngày tạo yêu cầu gửi hàng</th>
                </tr>
              </thead>
              <tbody>
                {requestedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-500">
                      Không có yêu cầu nào
                    </td>
                  </tr>
                ) : (
                  requestedOrders.map((order) => (
                    <tr key={`${order.TenDotHang}-${order.MaDatHang}`} className="bg-white">
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{order.TenDotHang}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-cyan-600 font-medium">{order.MaDatHang}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.CanNang, 2)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.PhiShipVeVN_USD, 2)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.TyGia, 0)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.PhiShipVeVN_VND, 0)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.TienHangUSD, 2)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">{formatNumber(order.TienHangVND, 0)}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{order.YeuCauGui_ghichu || '-'}</td>
                      <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{formatDate(order.NgayYeuCauGuiHang)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
