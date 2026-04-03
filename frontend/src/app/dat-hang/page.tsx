'use client';

import { useState, useEffect } from 'react';
import { createQuickOrders, getExchangeRates, getCountries } from '@/lib/api';

interface OrderItem {
  id: string;
  linkWeb: string;
  linkHinh: string;
  color: string;
  size: string;
  soLuong: number;
  donGiaWeb: number;
  saleOff: number;
  ghiChu: string;
  loaiTien: string;
  tyGia: number;
  quocGiaId: number;
  error: string;
}

interface ExchangeRate {
  Name: string;
  TyGiaVND: number;
}

interface Country {
  QuocGiaID: number;
  TenQuocGia: string;
}

/**
 * DatHangM Page - Public Order Form
 * Converted from: UF/DatHangM.aspx
 * Uses same backend: SP_Them_DonHang_Simple
 */
export default function DatHangMPage() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTyGia, setDefaultTyGia] = useState(1);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [rates, countryList] = await Promise.all([
        getExchangeRates(),
        getCountries(),
      ]);
      setExchangeRates(rates);
      setCountries(countryList);

      const usdRate = rates.find((r) => r.Name === 'USD');
      if (usdRate) {
        setDefaultTyGia(usdRate.TyGiaVND);
      }

      addOrderForm(true);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const generateId = () => Math.random().toString(36).substring(2, 11);

  const addOrderForm = (isFirst = false) => {
    const newOrder: OrderItem = {
      id: generateId(),
      linkWeb: '',
      linkHinh: '',
      color: '',
      size: '',
      soLuong: 1,
      donGiaWeb: 0,
      saleOff: 0,
      ghiChu: '',
      loaiTien: 'USD',
      tyGia: defaultTyGia,
      quocGiaId: 1,
      error: '',
    };
    setOrders((prev) => (isFirst ? [newOrder] : [...prev, newOrder]));
  };

  const removeOrderForm = (id: string) => {
    if (orders.length > 1) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const updateOrder = (id: string, field: keyof OrderItem, value: any) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const updated = { ...o, [field]: value, error: '' };

        if (field === 'loaiTien') {
          const rate = exchangeRates.find((r) => r.Name === value);
          updated.tyGia = rate ? rate.TyGiaVND : defaultTyGia;
        }

        return updated;
      })
    );
  };

  const validateOrders = (): boolean => {
    let isValid = true;
    setOrders((prev) =>
      prev.map((o) => {
        if (!o.linkWeb) {
          isValid = false;
          return { ...o, error: 'Vui lòng nhập link hàng' };
        }
        if (!o.linkHinh) {
          isValid = false;
          return { ...o, error: 'Vui lòng nhập link hình hoặc chọn file' };
        }
        if (!o.soLuong || o.soLuong < 1) {
          isValid = false;
          return { ...o, error: 'Vui lòng nhập số lượng' };
        }
        if (!o.donGiaWeb && o.donGiaWeb !== 0) {
          isValid = false;
          return { ...o, error: 'Vui lòng nhập giá website' };
        }
        if (o.saleOff && isNaN(o.saleOff)) {
          isValid = false;
          return { ...o, error: 'Sale Off phải là kiểu số' };
        }
        return { ...o, error: '' };
      })
    );
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateOrders()) {
      return;
    }

    setIsLoading(true);
    try {
      const ordersToSubmit = orders.map((o) => ({
        linkWeb: o.linkWeb,
        linkHinh: o.linkHinh,
        color: o.color,
        size: o.size,
        soLuong: o.soLuong,
        donGiaWeb: o.donGiaWeb,
        saleOff: o.saleOff,
        ghiChu: o.ghiChu,
        loaiTien: o.loaiTien,
        tyGia: o.tyGia,
        quocGiaId: o.quocGiaId,
      }));

      const result = await createQuickOrders(ordersToSubmit);

      if (result.success > 0) {
        alert(`Đã thêm thành công ${result.success} đơn hàng`);
        setOrders([
          {
            id: generateId(),
            linkWeb: '',
            linkHinh: '',
            color: '',
            size: '',
            soLuong: 1,
            donGiaWeb: 0,
            saleOff: 0,
            ghiChu: '',
            loaiTien: 'USD',
            tyGia: defaultTyGia,
            quocGiaId: 1,
            error: '',
          },
        ]);
      }

      if (result.failed > 0) {
        console.error('Failed orders:', result.errors);
      }
    } catch (error) {
      console.error('Error submitting orders:', error);
      alert('Có lỗi khi thêm đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">Đặt hàng</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-cyan-200 p-4 md:p-5 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-end mb-3">
              {orders.length > 1 && (
                <button
                  onClick={() => removeOrderForm(order.id)}
                  className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-red-50 transition-colors duration-150"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Xóa
                </button>
              )}
            </div>

            {order.error && (
              <div className="text-red-500 mb-3 text-sm bg-red-50 px-3 py-2 rounded-lg">{order.error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Link hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={order.linkWeb}
                  onChange={(e) => updateOrder(order.id, 'linkWeb', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Link hình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={order.linkHinh}
                  onChange={(e) => updateOrder(order.id, 'linkHinh', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Màu sắc</label>
                <input
                  type="text"
                  value={order.color}
                  onChange={(e) => updateOrder(order.id, 'color', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  placeholder="Đen, Trắng,..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Size</label>
                <input
                  type="text"
                  value={order.size}
                  onChange={(e) => updateOrder(order.id, 'size', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  placeholder="S, M, L,..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={order.soLuong}
                  onChange={(e) => updateOrder(order.id, 'soLuong', parseInt(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Giá website <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={order.donGiaWeb}
                  onChange={(e) => updateOrder(order.id, 'donGiaWeb', parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Sale Off (%)</label>
                <input
                  type="number"
                  value={order.saleOff}
                  onChange={(e) => updateOrder(order.id, 'saleOff', parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  defaultValue={0}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Ghi chú</label>
                <input
                  type="text"
                  value={order.ghiChu}
                  onChange={(e) => updateOrder(order.id, 'ghiChu', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Quốc gia</label>
                <select
                  value={order.quocGiaId}
                  onChange={(e) => updateOrder(order.id, 'quocGiaId', parseInt(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                >
                  {countries.map((c) => (
                    <option key={c.QuocGiaID} value={c.QuocGiaID}>
                      {c.TenQuocGia}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Loại tiền</label>
                <div className="flex gap-2">
                  <select
                    value={order.loaiTien}
                    onChange={(e) => updateOrder(order.id, 'loaiTien', e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  >
                    {exchangeRates.map((r) => (
                      <option key={r.Name} value={r.Name}>
                        {r.Name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={order.tyGia}
                    onChange={(e) => updateOrder(order.id, 'tyGia', parseFloat(e.target.value) || 0)}
                    className="w-24 border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                    placeholder="Tỷ giá"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => addOrderForm(false)}
          className="px-5 py-2.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm đơn hàng
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow"
        >
          {isLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Gửi yêu cầu</span>
            </>
          )}
        </button>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg px-6 py-4 flex items-center gap-3">
            <svg className="w-6 h-6 animate-spin text-cyan-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-cyan-700 font-medium">Đang xử lý...</span>
          </div>
        </div>
      )}
    </div>
  );
}
