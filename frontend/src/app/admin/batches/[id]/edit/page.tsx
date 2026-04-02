'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

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
  'Mới tạo',
  'Đang vận chuyển',
  'Đã về kho',
  'Đã giao hàng',
  'Hủy',
];

const loaiTienOptions = ['USD', 'VND', 'CNY', 'EUR'];

const getBatch = async (id: number) => {
  const response = await axios.get<Batch>(`${API_URL}/admin/batches/${id}`);
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
    mutationFn: (data: any) => axios.put(`${API_URL}/admin/batches/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', id] });
      router.push(`/admin/batches/${id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Có lỗi xảy ra');
    },
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
      <div className="container mx-auto p-4">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sửa lô hàng: {batch?.TenLoHang}</h1>

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
            onClick={() => router.push(`/admin/batches/${id}`)}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
