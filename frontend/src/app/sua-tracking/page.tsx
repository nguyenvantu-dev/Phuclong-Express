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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">THÊM/SỬA TRACKING</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

      {/* Search */}
      <div className="mb-4">
        <label className="mr-2">Tìm tracking:</label>
        <input
          type="text"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          className="border rounded px-3 py-2"
          placeholder="Nhập mã tracking..."
        />
        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Tìm
        </button>
      </div>

      {tracking && (
        <>
          {/* Form */}
          <table className="mb-4">
            <tbody>
              <tr>
                <td className="py-1">Tracking number</td>
                <td className="py-1">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="border rounded px-3 py-1"
                  />
                </td>
                <td className="py-1"></td>
                <td className="py-1">Order number</td>
                <td className="py-1">
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="border rounded px-3 py-1"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-1">Ngày đặt hàng</td>
                <td className="py-1">
                  <input
                    type="date"
                    value={ngayDatHang}
                    onChange={(e) => setNgayDatHang(e.target.value)}
                    className="border rounded px-3 py-1"
                  />
                </td>
                <td className="py-1"></td>
                <td className="py-1">Nhà vận chuyển</td>
                <td className="py-1">
                  <select
                    value={nhaVanChuyenId}
                    onChange={(e) => setNhaVanChuyenId(Number(e.target.value))}
                    className="border rounded px-3 py-1"
                  >
                    <option value={0}>Chọn...</option>
                    {shippers.map((s) => (
                      <option key={s.ID} value={s.ID}>
                        {s.ShipperName}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
              <tr>
                <td className="py-1">Quốc gia</td>
                <td className="py-1">
                  <select
                    value={quocGiaId}
                    onChange={(e) => setQuocGiaId(Number(e.target.value))}
                    className="border rounded px-3 py-1"
                  >
                    <option value={0}>Chọn...</option>
                    {countries.map((c) => (
                      <option key={c.QuocGiaID} value={c.QuocGiaID}>
                        {c.TenQuocGia}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1"></td>
                <td className="py-1">Kiện</td>
                <td className="py-1">
                  <input
                    type="text"
                    value={kien}
                    onChange={(e) => setKien(e.target.value)}
                    className="border rounded px-3 py-1"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-1">Mawb</td>
                <td className="py-1">
                  <input
                    type="text"
                    value={mawb}
                    onChange={(e) => setMawb(e.target.value)}
                    className="border rounded px-3 py-1"
                  />
                </td>
                <td className="py-1"></td>
                <td className="py-1">Hawb</td>
                <td className="py-1">
                  <input
                    type="text"
                    value={hawb}
                    onChange={(e) => setHawb(e.target.value)}
                    className="border rounded px-3 py-1"
                  />
                </td>
              </tr>
              <tr>
                <td className="py-1">Tình trạng</td>
                <td className="py-1">
                  <select
                    value={tinhTrang}
                    onChange={(e) => setTinhTrang(e.target.value)}
                    className="border rounded px-3 py-1"
                    disabled
                  >
                    {TRACKING_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-1"></td>
                <td className="py-1"></td>
                <td className="py-1"></td>
              </tr>
              <tr>
                <td className="py-1">Ghi chú:</td>
                <td className="py-1" colSpan={4}>
                  <textarea
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    className="border rounded px-3 py-1 w-full"
                    rows={4}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={5} className="text-center py-2">
                  <button
                    onClick={handleUpdate}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Cập nhật
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Chi tiết tracking */}
          <h3 className="text-xl font-bold mb-2">Chi tiết</h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">Hình đại diện</th>
                  <th className="border border-gray-300 px-2 py-1">Số lượng</th>
                  <th className="border border-gray-300 px-2 py-1">Giá</th>
                  <th className="border border-gray-300 px-2 py-1">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {(tracking.chiTietTracking || []).map((item) => (
                  <tr key={item.ID}>
                    <td className="border border-gray-300 px-2 py-1">
                      {item.linkHinhDaiDien && (
                        <img src={item.linkHinhDaiDien} alt="" height="30" />
                      )}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-right">
                      {item.soLuong}
                    </td>
                    <td className="border border-gray-300 px-2 py-1 text-right">
                      {item.gia?.toLocaleString('vi-VN')}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">{item.ghiChu}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Lịch sử tình trạng */}
          <h3 className="text-xl font-bold mb-2">LỊCH SỬ TÌNH TRẠNG</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">Người thao tác</th>
                  <th className="border border-gray-300 px-2 py-1">Thời gian</th>
                  <th className="border border-gray-300 px-2 py-1">Tình trạng</th>
                  <th className="border border-gray-300 px-2 py-1">Mô tả</th>
                  <th className="border border-gray-300 px-2 py-1">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {(tracking.lichSuTracking || []).map((item) => (
                  <tr key={item.ID}>
                    <td className="border border-gray-300 px-2 py-1">{item.nguoiTao}</td>
                    <td className="border border-gray-300 px-2 py-1">
                      {item.ngayChuyenTinhTrang
                        ? new Date(item.ngayChuyenTinhTrang).toLocaleString('vi-VN')
                        : ''}
                    </td>
                    <td className="border border-gray-300 px-2 py-1">{item.tinhTrang}</td>
                    <td className="border border-gray-300 px-2 py-1">{item.moTaTinhTrang}</td>
                    <td className="border border-gray-300 px-2 py-1">{item.ghiChu}</td>
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
