'use client';

import { useState, useEffect } from 'react';
import { createQuickOrder, createQuickOrders, getExchangeRates, getCountries } from '@/lib/api';

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
  name: string;
  rate: number;
}

interface Country {
  QuocGiaID: number;
  TenQuocGia: string;
}

export default function QuickOrderPage() {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultTyGia, setDefaultTyGia] = useState(1);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [rates, countryList] = await Promise.all([
        getExchangeRates(),
        getCountries(),
      ]);
      setExchangeRates(rates.map((r) => ({ name: r.Name, rate: r.TyGiaVND })));
      setCountries(countryList);

      // Set default USD rate
      const usdRate = rates.find((r) => r.Name === 'USD');
      if (usdRate) {
        setDefaultTyGia(usdRate.TyGiaVND);
      }

      // Add first order form
      addOrderForm(true);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

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

        // Update tyGia when loaiTien changes
        if (field === 'loaiTien') {
          const rate = exchangeRates.find((r) => r.name === value);
          updated.tyGia = rate ? rate.rate : defaultTyGia;
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
        if (!o.linkHinh && !o.linkHinh) {
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
        return { ...o, error: '' };
      })
    );
    return isValid;
  };

  const handleSubmit = async () => {
    setSubmitMessage(null);
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
        setSubmitMessage({
          type: 'success',
          text: `Đã thêm thành công ${result.success} đơn hàng${result.failed > 0 ? `, ${result.failed} đơn lỗi` : ''}`,
        });
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
        if (result.success === 0) {
          setSubmitMessage({ type: 'error', text: `Có ${result.failed} đơn hàng chưa thêm được` });
        }
      }
    } catch (error) {
      console.error('Error submitting orders:', error);
      setSubmitMessage({ type: 'error', text: 'Có lỗi khi thêm đơn hàng' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (orderId: string, file: File) => {
    // In a real implementation, this would upload the file
    // For now, we'll just simulate it with a placeholder
    const linkHinh = `/imgLink/${file.name}`;
    updateOrder(orderId, 'linkHinh', linkHinh);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Đặt hàng nhanh</h1>

      {submitMessage && (
        <div
          className={`mb-4 rounded border px-4 py-3 text-sm ${
            submitMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className="border border-teal-500 p-4 rounded-lg"
          >
            <div className="flex justify-end mb-2">
              {orders.length > 1 && (
                <button
                  onClick={() => removeOrderForm(order.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <i className="fa fa-times"></i> Xóa
                </button>
              )}
            </div>

            {order.error && (
              <div className="text-red-500 mb-2">{order.error}</div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Link hàng */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Link hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={order.linkWeb}
                  onChange={(e) => updateOrder(order.id, 'linkWeb', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://..."
                />
              </div>

              {/* Link hình */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Link hình <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={order.linkHinh}
                  onChange={(e) => updateOrder(order.id, 'linkHinh', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="https://... or file"
                />
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileChange(order.id, e.target.files[0]);
                    }
                  }}
                  className="w-full mt-1"
                />
              </div>

              {/* Màu sắc */}
              <div>
                <label className="block text-sm font-medium mb-1">Màu sắc</label>
                <input
                  type="text"
                  value={order.color}
                  onChange={(e) => updateOrder(order.id, 'color', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Size */}
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <input
                  type="text"
                  value={order.size}
                  onChange={(e) => updateOrder(order.id, 'size', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Số lượng */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Số lượng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={order.soLuong}
                  onChange={(e) => updateOrder(order.id, 'soLuong', parseInt(e.target.value) || 0)}
                  className="w-full border rounded px-3 py-2"
                  min="1"
                />
              </div>

              {/* Giá website */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Giá website <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={order.donGiaWeb}
                  onChange={(e) => updateOrder(order.id, 'donGiaWeb', parseFloat(e.target.value) || 0)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Sale Off */}
              <div>
                <label className="block text-sm font-medium mb-1">Sale Off (%)</label>
                <input
                  type="number"
                  value={order.saleOff}
                  onChange={(e) => updateOrder(order.id, 'saleOff', parseFloat(e.target.value) || 0)}
                  className="w-full border rounded px-3 py-2"
                  defaultValue={0}
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-sm font-medium mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={order.ghiChu}
                  onChange={(e) => updateOrder(order.id, 'ghiChu', e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              {/* Quốc gia */}
              <div>
                <label className="block text-sm font-medium mb-1">Quốc gia</label>
                <select
                  value={order.quocGiaId}
                  onChange={(e) => updateOrder(order.id, 'quocGiaId', parseInt(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                >
                  {countries.map((c) => (
                    <option key={c.QuocGiaID} value={c.QuocGiaID}>
                      {c.TenQuocGia}
                    </option>
                  ))}
                </select>
              </div>

              {/* Loại tiền */}
              <div>
                <label className="block text-sm font-medium mb-1">Loại tiền</label>
                <div className="flex gap-2">
                  <select
                    value={order.loaiTien}
                    onChange={(e) => updateOrder(order.id, 'loaiTien', e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                  >
                    {exchangeRates.map((r) => (
                      <option key={r.name} value={r.name}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={order.tyGia}
                    onChange={(e) => updateOrder(order.id, 'tyGia', parseFloat(e.target.value) || 0)}
                    className="w-24 border rounded px-3 py-2"
                    placeholder="Tỷ giá"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-4">
        <button
          onClick={() => addOrderForm(false)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <i className="fa fa-plus"></i> Thêm đơn hàng
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </div>

      {/* Loader */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-40 flex items-center justify-center z-50">
          <div className="text-blue-500 text-lg">Đang xử lý...</div>
        </div>
      )}
    </div>
  );
}
