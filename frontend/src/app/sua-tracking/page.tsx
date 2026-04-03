'use client';

import { useState, useEffect } from 'react';
import { getTracking, updateTracking, getShippers, getCountries, getTrackingDetails } from '@/lib/api';

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

interface ChiTietItem {
  ID: number;
  linkHinhDaiDien: string;
  soLuong: number;
  gia: number;
  ghiChu: string;
}

interface HistoryItem {
  ID: number;
  nguoiTao: string;
  ngayChuyenTinhTrang: string;
  tinhTrang: string;
  moTaTinhTrang: string;
  ghiChu: string;
}

interface Shipper {
  ID: number;
  ShipperName: string;
}

interface Country {
  QuocGiaID: number;
  TenQuocGia: string;
}

const TRACKING_STATUSES = ['Received', 'InTransit', 'InVN', 'VNTransit', 'Completed', 'Cancelled'];

/**
 * SuaTracking Page - Edit Tracking
 * Converted from: UF/SuaTracking.aspx
 * Uses backend: tracking service
 */
export default function SuaTrackingPage() {
  const [tracking, setTracking] = useState<TrackingDetail | null>(null);
  const [shippers, setShippers] = useState<Shipper[]>([]);
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
      const [shipperList, countryList] = await Promise.all([
        getShippers(),
        getCountries(),
      ]);
      setShippers(shipperList);
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
        // Get full details
        const details = await getTrackingDetails(trackingData.id);
        setTracking(details);
        fillForm(details);
      } else {
        setError('Không tìm thấy tracking');
      }
    } catch (err) {
      setError('Có lỗi khi tìm kiếm');
    } finally {
      setIsLoading(false);
    }
  };

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
                  {shippers.map((s) => (
                    <option key={s.ID} value={s.ID}>
                      {s.ShipperName}
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
                  <tr key={item.ID} className="bg-white">
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
