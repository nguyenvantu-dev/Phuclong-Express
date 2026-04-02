'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface FormData {
  username: string;
  trackingNumber: string;
  orderNumber: string;
  ngayDatHang: string;
  nhaVanChuyenId: string;
  tenLoHang: string;
  tinhTrang: string;
  ghiChu: string;
  loaiTien: string;
  tyGia: string;
  ngayDenDuKien: string;
  ngayDenThucTe: string;
}

const tinhTrangOptions = [
  'Mới tạo',
  'Đang vận chuyển',
  'Đã về kho',
  'Đã giao hàng',
  'Hủy',
];

const loaiTienOptions = ['USD', 'VND', 'CNY', 'EUR'];

export default function NewBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    username: '',
    trackingNumber: '',
    orderNumber: '',
    ngayDatHang: new Date().toISOString().split('T')[0],
    nhaVanChuyenId: '',
    tenLoHang: '',
    tinhTrang: 'Mới tạo',
    ghiChu: '',
    loaiTien: 'USD',
    tyGia: '23500',
    ngayDenDuKien: '',
    ngayDenThucTe: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/admin/batches`, {
        ...formData,
        nhaVanChuyenId: formData.nhaVanChuyenId ? Number(formData.nhaVanChuyenId) : undefined,
        tyGia: Number(formData.tyGia),
      });
      router.push('/admin/batches');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Thêm mới lô hàng</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tracking Number *</label>
            <input
              type="text"
              name="trackingNumber"
              value={formData.trackingNumber}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Order Number</label>
            <input
              type="text"
              name="orderNumber"
              value={formData.orderNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ngày đặt hàng *</label>
            <input
              type="date"
              name="ngayDatHang"
              value={formData.ngayDatHang}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nhà vận chuyển</label>
            <select
              name="nhaVanChuyenId"
              value={formData.nhaVanChuyenId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">-- Chọn nhà vận chuyển --</option>
              <option value="1">DHL</option>
              <option value="2">UPS</option>
              <option value="3">FedEx</option>
              <option value="4">USPS</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tên lô hàng</label>
            <input
              type="text"
              name="tenLoHang"
              value={formData.tenLoHang}
              onChange={handleChange}
              placeholder="Để trống sẽ tự sinh theo ngày"
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tình trạng</label>
            <select
              name="tinhTrang"
              value={formData.tinhTrang}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              {tinhTrangOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Loại tiền</label>
            <select
              name="loaiTien"
              value={formData.loaiTien}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              {loaiTienOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Tỷ giá</label>
            <input
              type="number"
              name="tyGia"
              value={formData.tyGia}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ngày đến dự kiến</label>
            <input
              type="date"
              name="ngayDenDuKien"
              value={formData.ngayDenDuKien}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ngày đến thực tế</label>
            <input
              type="date"
              name="ngayDenThucTe"
              value={formData.ngayDenThucTe}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Ghi chú</label>
            <textarea
              name="ghiChu"
              value={formData.ghiChu}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/batches')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
