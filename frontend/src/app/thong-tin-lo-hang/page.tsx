'use client';

import { useState, useEffect } from 'react';
import { getBatches, getBatchByTenLoHang } from '@/lib/api';

interface BatchItem {
  tenDotHang: string;
}

interface ShipFeeItem {
  TenLoaiHangShip: string;
  CanNang: number;
  DonGia_NgoaiTe: number;
  TongTienShipVeVN_VND: number;
}

interface TaxItem {
  TenLoaiHangThueHaiQuan: string;
  SoLuong: number;
  DonGia_NgoaiTe: number;
  TongTienThueHaiQuan_VND: number;
}

interface TrackingItem {
  TrackingID: number;
  TrackingNumber: string;
  OrderNumber: string;
  NgayDatHang: string;
  TenNhaVanChuyen: string;
  TinhTrang: string;
  GhiChu: string;
}

/**
 * ThongTinLoHang Page - Shipment Information
 * Converted from: UF/ThongTinLoHang.aspx
 * Uses backend: batches service
 */
export default function ThongTinLoHangPage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatchTen, setSelectedBatchTen] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Info
  const [tyGia, setTyGia] = useState<number>(0);
  const [loaiTien, setLoaiTien] = useState<string>('');
  const [ngayDenDuKien, setNgayDenDuKien] = useState<string>('');
  const [ngayDenThucTe, setNgayDenThucTe] = useState<string>('');

  // Data
  const [shipFees, setShipFees] = useState<ShipFeeItem[]>([]);
  const [taxes, setTaxes] = useState<TaxItem[]>([]);
  const [trackings, setTrackings] = useState<TrackingItem[]>([]);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const data = await getBatches();
      setBatches(data || []);
      if (data && data.length > 0) {
        setSelectedBatchTen(data[0].tenDotHang);
        loadBatchInfo(data[0].tenDotHang);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  };

  const loadBatchInfo = async (batchTen: string) => {
    setIsLoading(true);
    try {
      const data = await getBatchByTenLoHang(batchTen);

      // Set batch info
      setTyGia(data.tyGia || data.TyGia || 0);
      setLoaiTien(data.loaiTien || data.LoaiTien || 'USD');
      setNgayDenDuKien(data.ngayDenDuKien || data.NgayDenDuKien || '');
      setNgayDenThucTe(data.ngayDenThucTe || data.NgayDenThucTe || '');

      // Set related data
      setShipFees(data.shipCosts || data.shipFees || []);
      setTaxes(data.customs || []);
      setTrackings(data.trackings || []);
    } catch (error) {
      console.error('Error loading batch info:', error);
      // Clear data on error
      setShipFees([]);
      setTaxes([]);
      setTrackings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const batchTen = e.target.value;
    setSelectedBatchTen(batchTen);
    if (batchTen) {
      loadBatchInfo(batchTen);
    }
  };

  const formatNumber = (num: number) => {
    if (!num && num !== 0) return '';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">THÔNG TIN LÔ HÀNG</h2>

      {/* Batch selector */}
      <div className="mb-6 p-4 bg-cyan-50 rounded-xl flex flex-wrap items-center gap-3">
        <label className="mr-2 text-slate-700 font-medium">Lô hàng:</label>
        <select
          value={selectedBatchTen}
          onChange={handleBatchChange}
          className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
        >
          <option value="">Chọn...</option>
          {batches.map((batch) => (
            <option key={batch.tenDotHang} value={batch.tenDotHang}>
              {batch.tenDotHang}
            </option>
          ))}
        </select>
        <button
          onClick={() => selectedBatchTen && loadBatchInfo(selectedBatchTen)}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow"
        >
          Xem
        </button>
      </div>

      {selectedBatchTen && (
        <>
          {/* Thông tin chung */}
          <h4 className="text-xl font-bold mb-3 text-cyan-700">THÔNG TIN CHUNG</h4>
          <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex justify-between md:block">
                <span className="text-slate-500 text-sm">Tỷ giá:</span>
                <p className="text-lg font-semibold text-cyan-700">
                  {formatNumber(tyGia)} ({loaiTien})
                </p>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-slate-500 text-sm">Ngày đến dự kiến:</span>
                <p className="text-lg font-medium text-slate-700">
                  {ngayDenDuKien
                    ? new Date(ngayDenDuKien).toLocaleDateString('vi-VN')
                    : '-'}
                </p>
              </div>
              <div className="flex justify-between md:block">
                <span className="text-slate-500 text-sm">Ngày đến thực tế:</span>
                <p className="text-lg font-medium text-emerald-600">
                  {ngayDenThucTe
                    ? new Date(ngayDenThucTe).toLocaleDateString('vi-VN')
                    : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Phí ship về VN */}
          {shipFees.length > 0 && (
            <>
              <h4 className="text-xl font-bold mb-3 text-cyan-700">PHÍ SHIP VỀ VN</h4>
              <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm mb-6">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-cyan-100">
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Loại hàng</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Cân nặng</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Đơn giá</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipFees.map((item, index) => (
                      <tr key={index} className="bg-white">
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-700">
                          {item.TenLoaiHangShip}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-right font-medium text-slate-700">
                          {item.CanNang}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">
                          {item.DonGia_NgoaiTe?.toLocaleString('vi-VN')}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-cyan-700 font-semibold">
                          {formatNumber(item.TongTienShipVeVN_VND)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Thuế hải quan */}
          {taxes.length > 0 && (
            <>
              <h4 className="text-xl font-bold mb-3 text-cyan-700">THUẾ HẢI QUAN</h4>
              <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm mb-6">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-cyan-100">
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Loại hàng</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Số lượng</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Đơn giá</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxes.map((item, index) => (
                      <tr key={index} className="bg-white">
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-700">
                          {item.TenLoaiHangThueHaiQuan}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-right font-medium text-slate-700">
                          {item.SoLuong}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-slate-600">
                          {item.DonGia_NgoaiTe?.toLocaleString('vi-VN')}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-right text-cyan-700 font-semibold">
                          {formatNumber(item.TongTienThueHaiQuan_VND)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Tracking */}
          {trackings.length > 0 && (
            <>
              <h4 className="text-xl font-bold mb-3 text-cyan-700">TRACKING</h4>
              <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-cyan-100">
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tracking Number</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Order Number</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ngày ĐH</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Nhà vận chuyển</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Tình trạng</th>
                      <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackings.map((item) => (
                      <tr key={item.TrackingID} className="bg-white">
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-cyan-600 font-medium">
                          {item.TrackingNumber}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">
                          {item.OrderNumber}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">
                          {item.NgayDatHang
                            ? new Date(item.NgayDatHang).toLocaleDateString('vi-VN')
                            : ''}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">
                          {item.TenNhaVanChuyen}
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.TinhTrang === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : item.TinhTrang === 'Cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {item.TinhTrang}
                          </span>
                        </td>
                        <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-500">{item.GhiChu}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
