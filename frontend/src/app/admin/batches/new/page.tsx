'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { FormInput, FormSelect, FormTextarea } from '@/app/components/admin';

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
  { value: 'Mới tạo', label: 'Mới tạo' },
  { value: 'Đang vận chuyển', label: 'Đang vận chuyển' },
  { value: 'Đã về kho', label: 'Đã về kho' },
  { value: 'Đã giao hàng', label: 'Đã giao hàng' },
  { value: 'Hủy', label: 'Hủy' },
];

const loaiTienOptions = [
  { value: 'USD', label: 'USD' },
  { value: 'VND', label: 'VND' },
  { value: 'CNY', label: 'CNY' },
  { value: 'EUR', label: 'EUR' },
];

const nhaVanChuyenOptions = [
  { value: '', label: '-- Chọn nhà vận chuyển --' },
  { value: '1', label: 'DHL' },
  { value: '2', label: 'UPS' },
  { value: '3', label: 'FedEx' },
  { value: '4', label: 'USPS' },
];

export default function NewBatchPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(`${API_URL}/batches`, {
        ...formData,
        nhaVanChuyenId: formData.nhaVanChuyenId ? Number(formData.nhaVanChuyenId) : undefined,
        tyGia: Number(formData.tyGia),
      });
      setSuccess('Lô hàng đã được tạo thành công!');
      setTimeout(() => router.push('/admin/batches'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo lô hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-900 mb-2">Thêm lô hàng mới</h1>
          <p className="text-gray-600">Điền thông tin chi tiết về lô hàng nhập khẩu</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            <p className="font-semibold mb-1">⚠️ Lỗi</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
            <p className="font-semibold mb-1">✓ Thành công</p>
            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-cyan-200 p-8">
          {/* Section 1: Basic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-cyan-900 mb-6 pb-4 border-b border-cyan-200">
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Nhập username"
                required
              />
              <FormInput
                label="Mã tracking"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                placeholder="Nhập mã tracking"
                required
              />
              <FormInput
                label="Mã đơn hàng"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
                placeholder="(Tùy chọn)"
              />
              <FormInput
                label="Ngày đặt hàng"
                name="ngayDatHang"
                type="date"
                value={formData.ngayDatHang}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Section 2: Shipment Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-cyan-900 mb-6 pb-4 border-b border-cyan-200">
              Chi tiết gửi hàng
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                label="Nhà vận chuyển"
                name="nhaVanChuyenId"
                value={formData.nhaVanChuyenId}
                onChange={handleChange}
                options={nhaVanChuyenOptions}
              />
              <FormInput
                label="Tên lô hàng"
                name="tenLoHang"
                value={formData.tenLoHang}
                onChange={handleChange}
                hint="Để trống sẽ tự sinh theo ngày (yyyyMMdd)"
              />
              <FormInput
                label="Ngày đến dự kiến"
                name="ngayDenDuKien"
                type="date"
                value={formData.ngayDenDuKien}
                onChange={handleChange}
              />
              <FormInput
                label="Ngày đến thực tế"
                name="ngayDenThucTe"
                type="date"
                value={formData.ngayDenThucTe}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Section 3: Financial Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-cyan-900 mb-6 pb-4 border-b border-cyan-200">
              Thông tin tài chính
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormSelect
                label="Loại tiền tệ"
                name="loaiTien"
                value={formData.loaiTien}
                onChange={handleChange}
                options={loaiTienOptions}
              />
              <FormInput
                label="Tỷ giá"
                name="tyGia"
                type="number"
                value={formData.tyGia}
                onChange={handleChange}
                hint="Tỷ giá chuyển đổi (VND)"
              />
              <FormSelect
                label="Tình trạng"
                name="tinhTrang"
                value={formData.tinhTrang}
                onChange={handleChange}
                options={tinhTrangOptions}
              />
            </div>
          </div>

          {/* Section 4: Notes */}
          <div className="mb-8">
            <FormTextarea
              label="Ghi chú"
              name="ghiChu"
              value={formData.ghiChu}
              onChange={handleChange}
              placeholder="Thêm ghi chú hoặc mô tả thêm về lô hàng..."
              rows={4}
              hint="Tùy chọn"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-cyan-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Đang lưu...' : '✓ Tạo lô hàng'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/batches')}
              className="flex-1 px-6 py-3 border border-cyan-300 text-cyan-700 rounded-lg hover:bg-cyan-50 transition-colors font-semibold"
            >
              ✕ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
