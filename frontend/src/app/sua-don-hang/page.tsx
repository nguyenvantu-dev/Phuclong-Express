'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-context';
import { getOrderById, updateOrderForUser } from '@/lib/api';
import { getExchangeRates } from '@/lib/api';

interface Order {
  id: number;
  linkWeb: string;
  linkHinh: string;
  color: string;
  size: string;
  soLuong: number;
  donGiaWeb: number;
  saleOff: number;
  ghiChu: string;
  trangThaiOrder: string;
  loaiTien: string;
  tyGia: number;
  username: string;
  websiteName: string;
  loaiHangId: number | null;
  maSoHang: string;
  quocGiaId: number | null;
}

interface ExchangeRate {
  Name: string;
  TyGiaVND: number;
}

function SuaDonHangContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const id = searchParams.get('id');

  const [order, setOrder] = useState<Order | null>(null);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [linkHang, setLinkHang] = useState('');
  const [linkHinh, setLinkHinh] = useState('');
  const [mauSac, setMauSac] = useState('');
  const [size, setSize] = useState('');
  const [soLuong, setSoLuong] = useState(1);
  const [giaWeb, setGiaWeb] = useState(0);
  const [saleOff, setSaleOff] = useState(0);
  const [ghiChu, setGhiChu] = useState('');
  const [loaiTien, setLoaiTien] = useState('USD');
  const [tyGia, setTyGia] = useState(1);

  useEffect(() => {
    if (id) {
      loadInitialData();
    }
  }, [id]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [orderData, rates] = await Promise.all([
        getOrderById(Number(id)),
        getExchangeRates(),
      ]);

      setExchangeRates(rates || []);

      if (orderData.trangThaiOrder !== 'Received') {
        setError('Chỉ được sửa những đơn hàng ở trạng thái Received');
        setTimeout(() => router.push('/danh-sach-don-hang'), 2000);
        return;
      }

      setOrder(orderData);
      setLinkHang(orderData.linkWeb || '');
      setLinkHinh(orderData.linkHinh || '');
      setMauSac(orderData.color || '');
      setSize(orderData.size || '');
      setSoLuong(orderData.soLuong || 1);
      setGiaWeb(orderData.donGiaWeb || 0);
      setSaleOff(orderData.saleOff || 0);
      setGhiChu(orderData.ghiChu || '');
      setLoaiTien(orderData.loaiTien || 'USD');
      setTyGia(orderData.tyGia || 1);
    } catch (err) {
      console.error('Error loading order:', err);
      setError('Không tìm thấy đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoaiTienChange = (value: string) => {
    setLoaiTien(value);
    const rate = exchangeRates.find(r => r.Name === value);
    if (rate) {
      setTyGia(rate.TyGiaVND);
    }
  };

  const handleSubmit = async () => {
    if (!linkHang || !linkHinh || !soLuong || !giaWeb) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!order || !user?.username) {
        setError('Không tìm thấy thông tin đơn hàng');
        return;
      }

      const result = await updateOrderForUser(Number(id), {
        websiteName: order.websiteName || '',
        username: order.username || '',
        linkWeb: linkHang,
        linkHinh: linkHinh,
        color: mauSac,
        size: size,
        soLuong: soLuong,
        donGiaWeb: giaWeb,
        saleOff: saleOff,
        ghiChu: ghiChu,
        loaiTien: loaiTien,
        tyGia: tyGia,
        loaiHangId: order.loaiHangId ?? null,
        maSoHang: order.maSoHang || '',
        quocGiaId: order.quocGiaId ?? null,
        nguoiTao: user.username,
      });

      if (!result.success) {
        setError('Có lỗi khi cập nhật đơn hàng');
        return;
      }

      setSuccess('Cập nhật đơn hàng thành công');
      setTimeout(() => router.push('/danh-sach-don-hang'), 1500);
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Có lỗi khi cập nhật đơn hàng');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !order) {
    return (
      <div className="text-center py-12">
        <svg className="w-8 h-8 animate-spin text-cyan-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-2 text-slate-600">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">Sửa đơn hàng - Vui lòng đọc kỹ thông tin trước khi đặt hàng</h2>

      {error && <div className="text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="text-emerald-500 mb-4 bg-emerald-50 px-4 py-3 rounded-lg">{success}</div>}

      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Link Hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={linkHang}
              onChange={(e) => setLinkHang(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Link Hình <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={linkHinh}
              onChange={(e) => setLinkHinh(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Màu sắc</label>
            <input
              type="text"
              value={mauSac}
              onChange={(e) => setMauSac(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Size</label>
            <input
              type="text"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Số lượng <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={soLuong}
              onChange={(e) => setSoLuong(Number(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Giá website <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={giaWeb}
              onChange={(e) => setGiaWeb(Number(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Sale Off (%)</label>
            <input
              type="number"
              value={saleOff}
              onChange={(e) => setSaleOff(Number(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Ghi chú</label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Loại tiền</label>
            <select
              value={loaiTien}
              onChange={(e) => handleLoaiTienChange(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              {exchangeRates.map((r) => (
                <option key={r.Name} value={r.Name}>{r.Name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Tỷ giá</label>
            <input
              type="number"
              value={tyGia}
              onChange={(e) => setTyGia(Number(e.target.value) || 1)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              disabled
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50"
          >
            {isLoading ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuaDonHangPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <svg className="w-8 h-8 animate-spin text-cyan-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <SuaDonHangContent />
    </Suspense>
  );
}
