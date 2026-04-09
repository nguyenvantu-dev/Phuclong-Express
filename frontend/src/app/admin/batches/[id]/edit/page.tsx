'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FormInput, FormSelect, FormTextarea } from '@/app/components/admin';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Batch {
  ID: number;
  UserName: string;
  TrackingNumber: string;
  OrderNumber: string;
  NgayDatHang: string;
  TenLoHang: string;
  TinhTrang: string;
  LoaiTien: string;
  TyGia: number;
  NgayDenDuKien: string;
  NgayDenThucTe: string;
  GhiChu: string;
  NhaVanChuyenID: number;
}

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

const getBatch = async (id: number) => {
  const response = await axios.get<Batch>(`${API_URL}/batches/${id}`);
  return response.data;
};

export default function EditBatchPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(params.id);

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatch(id),
  });

  const [formData, setFormData] = useState<FormData>({
    username: '',
    trackingNumber: '',
    orderNumber: '',
    ngayDatHang: '',
    nhaVanChuyenId: '',
    tenLoHang: '',
    tinhTrang: 'Mới tạo',
    ghiChu: '',
    loaiTien: 'USD',
    tyGia: '23500',
    ngayDenDuKien: '',
    ngayDenThucTe: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form data when batch loads
  if (batch && !formData.ngayDatHang) {
    setFormData({
      username: batch.UserName || '',
      trackingNumber: batch.TrackingNumber || '',
      orderNumber: batch.OrderNumber || '',
      ngayDatHang: batch.NgayDatHang ? batch.NgayDatHang.split('T')[0] : '',
      nhaVanChuyenId: batch.NhaVanChuyenID?.toString() || '',
      tenLoHang: batch.TenLoHang || '',
      tinhTrang: batch.TinhTrang || 'Mới tạo',
      ghiChu: batch.GhiChu || '',
      loaiTien: batch.LoaiTien || 'USD',
      tyGia: batch.TyGia?.toString() || '23500',
      ngayDenDuKien: batch.NgayDenDuKien ? batch.NgayDenDuKien.split('T')[0] : '',
      ngayDenThucTe: batch.NgayDenThucTe ? batch.NgayDenThucTe.split('T')[0] : '',
    });
  }

  const updateMutation = useMutation({
    mutationFn: (data: any) => axios.put(`${API_URL}/batches/${id}`, data),
    onSuccess: () => {
      setSuccess('Lô hàng đã được cập nhật thành công!');
      queryClient.invalidateQueries({ queryKey: ['batch', id] });
      setTimeout(() => router.push(`/admin/batches/${id}`), 1500);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    },
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
      await updateMutation.mutateAsync({
        ...formData,
        nhaVanChuyenId: formData.nhaVanChuyenId ? Number(formData.nhaVanChuyenId) : undefined,
        tyGia: Number(formData.tyGia),
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-cyan-600 hover:text-cyan-700 font-medium mb-4 flex items-center gap-2"
          >
            ← Quay lại
          </button>
          <h1 className="text-4xl font-bold text-cyan-900 mb-2">Sửa lô hàng</h1>
          <p className="text-gray-600">Cập nhật thông tin lô hàng: <span className="font-semibold">{batch?.TenLoHang}</span></p>
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
                required
              />
              <FormInput
                label="Mã tracking"
                name="trackingNumber"
                value={formData.trackingNumber}
                onChange={handleChange}
                required
              />
              <FormInput
                label="Mã đơn hàng"
                name="orderNumber"
                value={formData.orderNumber}
                onChange={handleChange}
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
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-cyan-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Đang lưu...' : '✓ Cập nhật'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/admin/batches/${id}`)}
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
