'use client';

import { useState, useEffect } from 'react';
import { getBatches } from '@/lib/api';

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
      // Call API to get batch info (mock for now - would need backend endpoint)
      // For now just set placeholder data
      setTyGia(24500);
      setLoaiTien('USD');
      setNgayDenDuKien('');
      setNgayDenThucTe('');

      // Clear related data
      setShipFees([]);
      setTaxes([]);
      setTrackings([]);
    } catch (error) {
      console.error('Error loading batch info:', error);
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
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">THÔNG TIN LÔ HÀNG</h2>

      {/* Batch selector */}
      <div className="mb-4 text-center">
        <label className="mr-2">Lô hàng:</label>
        <select
          value={selectedBatchTen}
          onChange={handleBatchChange}
          className="border rounded px-3 py-2"
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
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Xem
        </button>
      </div>

      {selectedBatchTen && (
        <>
          {/* Thông tin chung */}
          <h4 className="text-xl font-bold mb-2">THÔNG TIN CHUNG</h4>
          <table className="mb-4 border">
            <tbody>
              <tr>
                <td className="py-1 px-2 text-right font-bold">Tỷ giá:</td>
                <td className="py-1 px-2">
                  {formatNumber(tyGia)} ({loaiTien})
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-right font-bold">Ngày đến dự kiến:</td>
                <td className="py-1 px-2">
                  {ngayDenDuKien
                    ? new Date(ngayDenDuKien).toLocaleDateString('vi-VN')
                    : ''}
                </td>
              </tr>
              <tr>
                <td className="py-1 px-2 text-right font-bold">Ngày đến thực tế:</td>
                <td className="py-1 px-2">
                  {ngayDenThucTe
                    ? new Date(ngayDenThucTe).toLocaleDateString('vi-VN')
                    : ''}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Phí ship về VN */}
          {shipFees.length > 0 && (
            <>
              <h4 className="text-xl font-bold mb-2">PHÍ SHIP VỀ VN</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1">Loại hàng</th>
                      <th className="border border-gray-300 px-2 py-1">Cân nặng</th>
                      <th className="border border-gray-300 px-2 py-1">Đơn giá</th>
                      <th className="border border-gray-300 px-2 py-1">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shipFees.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-2 py-1">
                          {item.TenLoaiHangShip}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          {item.CanNang}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          {item.DonGia_NgoaiTe?.toLocaleString('vi-VN')}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
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
              <h4 className="text-xl font-bold mb-2">THUẾ HẢI QUAN</h4>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1">Loại hàng</th>
                      <th className="border border-gray-300 px-2 py-1">Số lượng</th>
                      <th className="border border-gray-300 px-2 py-1">Đơn giá</th>
                      <th className="border border-gray-300 px-2 py-1">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {taxes.map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 px-2 py-1">
                          {item.TenLoaiHangThueHaiQuan}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          {item.SoLuong}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
                          {item.DonGia_NgoaiTe?.toLocaleString('vi-VN')}
                        </td>
                        <td className="border border-gray-300 px-2 py-1 text-right">
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
              <h4 className="text-xl font-bold mb-2">TRACKING</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-2 py-1">Tracking Number</th>
                      <th className="border border-gray-300 px-2 py-1">Order Number</th>
                      <th className="border border-gray-300 px-2 py-1">Ngày ĐH</th>
                      <th className="border border-gray-300 px-2 py-1">Nhà vận chuyển</th>
                      <th className="border border-gray-300 px-2 py-1">Tình trạng</th>
                      <th className="border border-gray-300 px-2 py-1">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackings.map((item) => (
                      <tr key={item.TrackingID}>
                        <td className="border border-gray-300 px-2 py-1">
                          {item.TrackingNumber}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {item.OrderNumber}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {item.NgayDatHang
                            ? new Date(item.NgayDatHang).toLocaleDateString('vi-VN')
                            : ''}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {item.TenNhaVanChuyen}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">
                          {item.TinhTrang}
                        </td>
                        <td className="border border-gray-300 px-2 py-1">{item.GhiChu}</td>
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
