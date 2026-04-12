'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { getTracking, updateTracking, getNhaVanChuyen, getCountries, getTrackingDetails } from '@/lib/api';

interface TrackingDetail {
  id: number;
  trackingNumber: string;
  orderNumber: string;
  username: string;
  ngayDatHang: string;
  nhaVanChuyenId: number;
  quocGiaId: number;
  tinhTrang: string;
  ghiChu: string;
  kien: string;
  mawb: string;
  hawb: string;
  chiTietTracking: ChiTietItem[];
  lichSuTracking: HistoryItem[];
}

interface RawTrackingDetail {
  id?: number;
  TrackingID?: number;
  trackingNumber?: string;
  TrackingNumber?: string;
  orderNumber?: string;
  OrderNumber?: string;
  username?: string;
  UserName?: string;
  ngayDatHang?: string;
  NgayDatHang?: string;
  nhaVanChuyenId?: number;
  NhaVanChuyenID?: number;
  quocGiaId?: number;
  QuocGiaID?: number;
  tinhTrang?: string;
  TinhTrang?: string;
  ghiChu?: string;
  GhiChu?: string;
  kien?: string;
  Kien?: string;
  mawb?: string;
  Mawb?: string;
  hawb?: string;
  Hawb?: string;
  chiTietTracking?: RawChiTietItem[];
  lichSuTracking?: RawHistoryItem[];
}

interface ChiTietItem {
  ID: number;
  linkHinhDaiDien: string;
  soLuong: number;
  gia: number;
  ghiChu: string;
}

interface RawChiTietItem {
  ID?: number;
  ChiTietTrackingID?: number;
  linkHinhDaiDien?: string;
  LinkHinh?: string;
  soLuong?: number;
  SoLuong?: number;
  gia?: number;
  Gia?: number;
  ghiChu?: string;
  GhiChu?: string;
}

interface HistoryItem {
  TinhTrangTrackingID: number;
  nguoiTao: string;
  ngayChuyenTinhTrang: string;
  tinhTrang: string;
  moTaTinhTrang: string;
  ghiChu: string;
}

interface RawHistoryItem {
  TinhTrangTrackingID?: number;
  nguoiTao?: string;
  NguoiTao?: string;
  ngayChuyenTinhTrang?: string;
  NgayChuyenTinhTrang?: string;
  NgayTao?: string;
  tinhTrang?: string;
  TinhTrang?: string;
  moTaTinhTrang?: string;
  MoTaTinhTrang?: string;
  ghiChu?: string;
  GhiChu?: string;
}

interface NhaVanChuyen {
  NhaVanChuyenID: number;
  TenNhaVanChuyen: string;
}

interface Country {
  QuocGiaID: number;
  TenQuocGia: string;
}

const TRACKING_STATUSES = ['Received', 'InTransit', 'InVN', 'VNTransit', 'Completed', 'Cancelled'];

const normalizeTrackingDetail = (data: RawTrackingDetail): TrackingDetail => ({
  id: Number(data.id || data.TrackingID || 0),
  trackingNumber: data.trackingNumber || data.TrackingNumber || '',
  orderNumber: data.orderNumber || data.OrderNumber || '',
  username: data.username || data.UserName || '',
  ngayDatHang: data.ngayDatHang || data.NgayDatHang || '',
  nhaVanChuyenId: Number(data.nhaVanChuyenId || data.NhaVanChuyenID || 0),
  quocGiaId: Number(data.quocGiaId || data.QuocGiaID || 0),
  tinhTrang: data.tinhTrang || data.TinhTrang || 'Received',
  ghiChu: data.ghiChu || data.GhiChu || '',
  kien: data.kien || data.Kien || '',
  mawb: data.mawb || data.Mawb || '',
  hawb: data.hawb || data.Hawb || '',
  chiTietTracking: (data.chiTietTracking || []).map((item) => ({
    ID: Number(item.ID || item.ChiTietTrackingID || 0),
    linkHinhDaiDien: item.linkHinhDaiDien || item.LinkHinh || '',
    soLuong: Number(item.soLuong || item.SoLuong || 0),
    gia: Number(item.gia || item.Gia || 0),
    ghiChu: item.ghiChu || item.GhiChu || '',
  })),
  lichSuTracking: (data.lichSuTracking || []).map((item) => ({
    TinhTrangTrackingID: Number(item.TinhTrangTrackingID || 0),
    nguoiTao: item.nguoiTao || item.NguoiTao || '',
    ngayChuyenTinhTrang: item.ngayChuyenTinhTrang || item.NgayChuyenTinhTrang || item.NgayTao || '',
    tinhTrang: item.tinhTrang || item.TinhTrang || '',
    moTaTinhTrang: item.moTaTinhTrang || item.MoTaTinhTrang || '',
    ghiChu: item.ghiChu || item.GhiChu || '',
  })),
});

/**
 * SuaTracking Page - Edit Tracking
 * Converted from: UF/SuaTracking.aspx
 * Uses backend: tracking service
 */
export default function SuaTrackingPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto p-4 md:p-6">Đang tải...</div>}>
      <SuaTrackingContent />
    </Suspense>
  );
}

function SuaTrackingContent() {
  const searchParams = useSearchParams();
  const [tracking, setTracking] = useState<TrackingDetail | null>(null);
  const [nhaVanChuyen, setNhaVanChuyen] = useState<NhaVanChuyen[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [trackingNumber, setTrackingNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [ngayDatHang, setNgayDatHang] = useState('');
  const [nhaVanChuyenId, setNhaVanChuyenId] = useState(0);
  const [quocGiaId, setQuocGiaId] = useState(0);
  const [kien, setKien] = useState('');
  const [mawb, setMawb] = useState('');
  const [hawb, setHawb] = useState('');
  const [tinhTrang, setTinhTrang] = useState('Received');
  const [ghiChu, setGhiChu] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [nhaVanChuyenList, countryList] = await Promise.all([
        getNhaVanChuyen(),
        getCountries(),
      ]);
      setNhaVanChuyen(nhaVanChuyenList);
      setCountries(countryList);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      setError('Vui lòng nhập mã tracking');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Search tracking by tracking number
      const trackingList = await getTracking({ search: trackingNumber, limit: 1 });
      if (trackingList && trackingList.length > 0) {
        const trackingData = trackingList[0];
        const trackingId = Number(trackingData.id || trackingData.TrackingID);
        if (!trackingId) {
          setError('Không tìm thấy tracking');
          return;
        }
        // Get full details
        const details = normalizeTrackingDetail(await getTrackingDetails(trackingId));
        setTracking(details);
        fillForm(details);
      } else {
        setError('Không tìm thấy tracking');
      }
    } catch (err) {
      console.error('Error searching tracking:', err);
      setError('Có lỗi khi tìm kiếm');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrackingById = useCallback(async (id: number) => {
    setIsLoading(true);
    setError('');
    try {
      const details = normalizeTrackingDetail(await getTrackingDetails(id));
      if (details.tinhTrang !== 'Received') {
        setError('Chỉ được sửa những tracking ở trạng thái Received');
      }
      setTracking(details);
      fillForm(details);
    } catch (err) {
      console.error('Error loading tracking details:', err);
      setError('Không tìm thấy tracking');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = Number(searchParams.get('id'));
    if (id > 0) {
      loadTrackingById(id);
    }
  }, [loadTrackingById, searchParams]);

  const fillForm = (data: TrackingDetail) => {
    setTrackingNumber(data.trackingNumber || '');
    setOrderNumber(data.orderNumber || '');
    setNgayDatHang(data.ngayDatHang ? data.ngayDatHang.split('T')[0] : '');
    setNhaVanChuyenId(data.nhaVanChuyenId || 0);
    setQuocGiaId(data.quocGiaId || 0);
    setKien(data.kien || '');
    setMawb(data.mawb || '');
    setHawb(data.hawb || '');
    setTinhTrang(data.tinhTrang || 'Received');
    setGhiChu(data.ghiChu || '');
  };

  const handleUpdate = async () => {
    if (!tracking) return;

    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await updateTracking(tracking.id, {
        trackingNumber,
        orderNumber,
        ngayDatHang,
        nhaVanChuyenId,
        quocGiaId,
        tinhTrang,
        ghiChu,
        kien,
        mawb,
        hawb,
      });
      setSuccess('Cập nhật thành công');
    } catch (err) {
      console.error('Error updating tracking:', err);
      setError('Có lỗi khi cập nhật');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">THÊM/SỬA TRACKING</h2>

      {error && <div className="text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="text-emerald-500 mb-4 bg-emerald-50 px-4 py-3 rounded-lg">{success}</div>}

      {/* Search */}
      <div className="mb-6 p-4 bg-cyan-50 rounded-xl">
        <label className="mr-2 text-slate-700 font-medium">Tìm tracking:</label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 mr-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
          placeholder="Nhập mã tracking..."
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50"
        >
          Tìm
        </button>
      </div>

      {tracking && (
        <>
          {/* Form */}
          <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-4 md:p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Tracking number</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Order number</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Ngày đặt hàng</label>
                <input
                  type="date"
                  value={ngayDatHang}
                  onChange={(e) => setNgayDatHang(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Nhà vận chuyển</label>
                <select
                  value={nhaVanChuyenId}
                  onChange={(e) => setNhaVanChuyenId(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                >
                  <option value={0}>Chọn...</option>
                  {nhaVanChuyen.map((item) => (
                    <option key={item.NhaVanChuyenID} value={item.NhaVanChuyenID}>
                      {item.TenNhaVanChuyen}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Quốc gia</label>
                <select
                  value={quocGiaId}
                  onChange={(e) => setQuocGiaId(Number(e.target.value))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                >
                  <option value={0}>Chọn...</option>
                  {countries.map((c) => (
                    <option key={c.QuocGiaID} value={c.QuocGiaID}>
                      {c.TenQuocGia}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Kiện</label>
                <input
                  type="text"
                  value={kien}
                  onChange={(e) => setKien(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Mawb</label>
                <input
                  type="text"
                  value={mawb}
                  onChange={(e) => setMawb(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Hawb</label>
                <input
                  type="text"
                  value={hawb}
                  onChange={(e) => setHawb(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-700">Tình trạng</label>
                <select
                  value={tinhTrang}
                  onChange={(e) => setTinhTrang(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                  disabled
                >
                  {TRACKING_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1.5 text-slate-700">Ghi chú:</label>
              <textarea
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
                rows={3}
              />
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className="px-6 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50"
              >
                Cập nhật
              </button>
            </div>
          </div>

          {/* Chi tiết tracking */}
          <h3 className="text-xl font-bold mb-3 text-cyan-700">Chi tiết</h3>
          <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm mb-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Hình đại diện</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Số lượng</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Giá</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {(tracking.chiTietTracking || []).map((item) => (
                  <tr key={item.ID} className="bg-white">
                    <td className="border-b border-cyan-100 px-3 py-2.5">
                      {item.linkHinhDaiDien && (
                        <img src={item.linkHinhDaiDien} alt="" height="30" className="rounded-lg" />
                      )}
                    </td>
                    <td className="border-b border-cyan-100 px-3 py-2.5 text-right font-medium text-slate-700">
                      {item.soLuong}
                    </td>
                    <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-700">
                      {item.gia?.toLocaleString('vi-VN')}
                    </td>
                    <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{item.ghiChu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lịch sử tình trạng */}
          <h3 className="text-xl font-bold mb-3 text-cyan-700">LỊCH SỬ TÌNH TRẠNG</h3>
          <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-cyan-100">
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Người thao tác</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Thời gian</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tình trạng</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Mô tả</th>
                  <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {(tracking.lichSuTracking || []).map((item) => (
                  <tr key={item.TinhTrangTrackingID} className="bg-white">
                    <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{item.nguoiTao}</td>
                    <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">
                      {item.ngayChuyenTinhTrang
                        ? new Date(item.ngayChuyenTinhTrang).toLocaleString('vi-VN')
                        : ''}
                    </td>
                    <td className="border-b border-cyan-100 px-3 py-2.5">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700">
                        {item.tinhTrang}
                      </span>
                    </td>
                    <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">{item.moTaTinhTrang}</td>
                    <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-500">{item.ghiChu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
