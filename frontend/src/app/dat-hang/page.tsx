'use client';

import { useState, useEffect, useRef } from 'react';
import { createQuickOrders, getExchangeRates, getCountries, uploadImage } from '@/lib/api';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10MB, matches backend multer limit

// Currency → keyword match for TenQuocGia (lowercase, includes).
// Mirrors admin/orders/new so Loại tiền chọn đến đâu Quốc gia auto theo đó.
const CURRENCY_COUNTRY_MAP: Record<string, string[]> = {
  USD: ['mỹ', 'hoa kỳ', 'usa'],
  VND: ['việt nam', 'viet nam', 'vietnam'],
  PLN: ['ba lan', 'balan', 'poland'],
  EUR: ['tây ban nha', 'spain'],
  GBP: ['anh', 'uk', 'britain'],
  JPY: ['nhật', 'japan'],
  CNY: ['trung', 'china'],
  KRW: ['hàn', 'korea'],
  AUD: ['úc', 'australia'],
  CAD: ['canada'],
  SGD: ['singapore'],
  THB: ['thái', 'thailand'],
  HKD: ['hồng kông', 'hong kong'],
};

function findCountryIdByCurrency(currency: string, countries: Country[]): number | null {
  const keywords = CURRENCY_COUNTRY_MAP[currency.toUpperCase()] || [];
  if (keywords.length === 0) return null;
  const matched = countries.find((c) =>
    keywords.some((kw) => c.TenQuocGia.toLowerCase().includes(kw)),
  );
  return matched ? matched.QuocGiaID : null;
}

interface OrderItem {
  id: string;
  linkWeb: string;
  linkHinh: string;
  color: string;
  size: string;
  soLuong: number;
  donGiaWeb: number;
  saleOff: number;
  saleOffStr: string;
  ghiChu: string;
  loaiTien: string;
  tyGia: number;
  quocGiaId: number;
  error: string;
  saleOffError: string;
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
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

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
    const defaultCountryId = findCountryIdByCurrency('USD', countries) ?? 1;
    const newOrder: OrderItem = {
      id: generateId(),
      linkWeb: '',
      linkHinh: '',
      color: '',
      size: '',
      soLuong: 1,
      donGiaWeb: 0,
      saleOff: 0,
      saleOffStr: '',
      ghiChu: '',
      loaiTien: 'USD',
      tyGia: defaultTyGia,
      quocGiaId: defaultCountryId,
      error: '',
      saleOffError: '',
    };
    setOrders((prev) => (isFirst ? [newOrder] : [...prev, newOrder]));
  };

  const removeOrderForm = (id: string) => {
    if (orders.length > 1) {
      setOrders((prev) => prev.filter((o) => o.id !== id));
    }
  };

  const updateOrder = <K extends keyof OrderItem>(id: string, field: K, value: OrderItem[K]) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const updated = { ...o, [field]: value, error: '' };

        if (field === 'loaiTien') {
          const rate = exchangeRates.find((r) => r.Name === value);
          updated.tyGia = rate ? rate.TyGiaVND : defaultTyGia;
          const matchedCountryId = findCountryIdByCurrency(String(value), countries);
          if (matchedCountryId !== null) {
            updated.quocGiaId = matchedCountryId;
          }
        }

        if (field === 'saleOff') {
          const n = value as number;
          if (!Number.isFinite(n) || n < 0 || n > 100) {
            updated.saleOffError = 'Sale Off phải từ 0 đến 100';
          } else {
            updated.saleOffError = '';
          }
        }

        return updated;
      })
    );
  };

  const isValidHttpUrl = (value: string): boolean => {
    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Image link can be either a remote http(s) URL or a server-relative path
  // produced by /upload/image (e.g. "/imgLink/YYYYMM/<uuid>.jpg").
  const isValidImageLink = (value: string): boolean => {
    const v = value.trim();
    if (!v) return false;
    if (v.startsWith('/imgLink/')) return true;
    return isValidHttpUrl(v);
  };

  const handleFileUpload = async (id: string, file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      updateOrder(id, 'error', 'Chỉ chấp nhận file hình ảnh');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      updateOrder(id, 'error', 'Kích thước file tối đa 10MB');
      return;
    }

    try {
      setUploadingId(id);
      const result = await uploadImage(file);
      updateOrder(id, 'linkHinh', result.linkHinh || '');
    } catch (err) {
      console.error('Upload image failed:', err);
      updateOrder(id, 'error', 'Tải hình lên thất bại, vui lòng thử lại');
    } finally {
      setUploadingId(null);
      const input = fileInputs.current[id];
      if (input) input.value = '';
    }
  };

  const validateOrders = (): boolean => {
    let firstError = '';
    const nextOrders = orders.map((o, index) => {
      const linkWeb = o.linkWeb.trim();
      const linkHinh = o.linkHinh.trim();
      let error = '';

      if (!linkWeb) {
        error = 'Vui lòng nhập link hàng';
      } else if (!isValidHttpUrl(linkWeb)) {
        error = 'Link hàng phải bắt đầu bằng http:// hoặc https://';
      } else if (!linkHinh) {
        error = 'Vui lòng nhập link hình hoặc tải hình lên';
      } else if (!isValidImageLink(linkHinh)) {
        error = 'Link hình phải bắt đầu bằng http:// hoặc https://';
      } else if (!Number.isInteger(o.soLuong) || o.soLuong < 1) {
        error = 'Số lượng phải là số nguyên lớn hơn 0';
      } else if (!Number.isFinite(o.donGiaWeb) || o.donGiaWeb <= 0) {
        error = 'Giá website phải lớn hơn 0';
      } else if (!Number.isFinite(o.saleOff) || o.saleOff < 0 || o.saleOff > 100) {
        error = 'Sale Off phải từ 0 đến 100';
      } else if (!Number.isFinite(o.tyGia) || o.tyGia <= 0) {
        error = 'Tỷ giá phải lớn hơn 0';
      } else if (!o.quocGiaId) {
        error = 'Vui lòng chọn quốc gia';
      }

      if (error && !firstError) {
        firstError = orders.length > 1 ? `Đơn ${index + 1}: ${error}` : error;
      }

      return { ...o, linkWeb, linkHinh, error };
    });

    setOrders(nextOrders);

    if (firstError) {
      setSubmitMessage({ type: 'error', text: firstError });
      return false;
    }

    return true;
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
            saleOffStr: '',
            ghiChu: '',
            loaiTien: 'USD',
            tyGia: defaultTyGia,
            quocGiaId: findCountryIdByCurrency('USD', countries) ?? 1,
            error: '',
            saleOffError: '',
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

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#14264b]">Đặt hàng</h1>

      {submitMessage && (
        <div
          className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            submitMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-xl shadow-sm border border-[#14264b]/20 p-4 md:p-5 hover:shadow-md transition-shadow duration-200">
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Link hình <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={order.linkHinh}
                    onChange={(e) => updateOrder(order.id, 'linkHinh', e.target.value)}
                    className="flex-1 min-w-0 border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
                    placeholder="https://... hoặc tải hình"
                  />
                  <input
                    ref={(el) => {
                      fileInputs.current[order.id] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(order.id, e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputs.current[order.id]?.click()}
                    disabled={uploadingId === order.id}
                    title="Tải hình từ máy"
                    className="shrink-0 px-3 py-2.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
                  >
                    {uploadingId === order.id ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" />
                      </svg>
                    )}
                  </button>
                </div>
                {order.linkHinh && (isValidImageLink(order.linkHinh)) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={order.linkHinh}
                    alt="Preview"
                    className="mt-2 h-16 w-auto rounded border border-slate-200 object-cover"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Màu sắc</label>
                <input
                  type="text"
                  value={order.color}
                  onChange={(e) => updateOrder(order.id, 'color', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
                  placeholder="Đen, Trắng,..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Size</label>
                <input
                  type="text"
                  value={order.size}
                  onChange={(e) => updateOrder(order.id, 'size', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
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
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">
                  Giá website <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={order.donGiaWeb || ''}
                  onChange={(e) => updateOrder(order.id, 'donGiaWeb', parseFloat(e.target.value) || 0)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
                  placeholder="0.00"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Sale Off (%)</label>
                  <input
                    type="number"
                    value={order.saleOffStr}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setOrders((prev) =>
                        prev.map((o) => {
                          if (o.id !== order.id) return o;
                          const n = raw === '' ? 0 : parseFloat(raw);
                          const invalid = raw !== '' && (!Number.isFinite(n) || n < 0 || n > 100);
                          return {
                            ...o,
                            saleOffStr: raw,
                            saleOff: Number.isFinite(n) ? n : 0,
                            saleOffError: invalid ? 'Sale Off phải từ 0 đến 100' : '',
                            error: '',
                          };
                        })
                      );
                    }}
                    min={0}
                    max={100}
                    step="0.01"
                    placeholder="0"
                    aria-invalid={!!order.saleOffError}
                    className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 transition-colors duration-150 ${
                      order.saleOffError
                        ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                        : 'border-slate-300 focus:ring-[#14264b] focus:border-[#14264b]'
                    }`}
                  />
                  {order.saleOffError && (
                    <p className="mt-1 text-xs text-red-500">{order.saleOffError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Loại tiền</label>
                  <select
                    value={order.loaiTien}
                    onChange={(e) => updateOrder(order.id, 'loaiTien', e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
                  >
                    {exchangeRates.map((r) => (
                      <option key={r.Name} value={r.Name}>
                        {r.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Quốc gia</label>
                  <select
                    value={order.quocGiaId}
                    onChange={(e) => updateOrder(order.id, 'quocGiaId', parseInt(e.target.value))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
                  >
                    {countries.map((c) => (
                      <option key={c.QuocGiaID} value={c.QuocGiaID}>
                        {c.TenQuocGia}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5 text-slate-700">Tỷ giá</label>
                  <input
                    type="number"
                    value={order.tyGia}
                    onChange={(e) => updateOrder(order.id, 'tyGia', parseFloat(e.target.value) || 0)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
                    placeholder="Tỷ giá VND"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Ghi chú</label>
                <input
                  type="text"
                  value={order.ghiChu}
                  onChange={(e) => updateOrder(order.id, 'ghiChu', e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
                  placeholder="Ghi chú thêm..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => addOrderForm(false)}
          className="px-5 py-2.5 bg-[#eb7325] text-white rounded-lg hover:bg-[#d65f15] flex items-center gap-2 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm đơn hàng
        </button>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-5 py-2.5 bg-[#14264b] text-white rounded-lg hover:bg-[#1f3a6d] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow"
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
            <svg className="w-6 h-6 animate-spin text-[#14264b]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-[#14264b] font-medium">Đang xử lý...</span>
          </div>
        </div>
      )}
    </div>
  );
}
