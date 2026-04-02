'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface CreateServiceFeeDto {
  loaiTien: string;
  tuGia: string;
  denGia: string;
  tienCong1Mon: string;
  tinhTheoPhanTram: boolean;
  khachBuon: boolean;
}

const API_BASE = '/api/admin/service-fees';

/**
 * Create Service Fee Page
 *
 * Converted from admin/GiaTienCong_Them.aspx
 * Features:
 * - Create new service fee
 * - Form fields: LoaiTien, TuGia, DenGia, TienCong1Mon, TinhTheoPhanTram, KhachBuon
 */
export default function NewServiceFeePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateServiceFeeDto>({
    loaiTien: 'VND',
    tuGia: '',
    denGia: '',
    tienCong1Mon: '',
    tinhTheoPhanTram: false,
    khachBuon: false,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.tuGia || !formData.denGia || !formData.tienCong1Mon) {
      setError('Vui lòng nhập đủ thông tin');
      return;
    }

    if (isNaN(Number(formData.tuGia)) || isNaN(Number(formData.denGia)) || isNaN(Number(formData.tienCong1Mon))) {
      setError('Giá trị phải là kiểu số');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loaiTien: formData.loaiTien,
          tuGia: Number(formData.tuGia),
          denGia: Number(formData.denGia),
          tienCong1Mon: Number(formData.tienCong1Mon),
          tinhTheoPhanTram: formData.tinhTheoPhanTram,
          khachBuon: formData.khachBuon,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create service fee');
      }

      router.push('/admin/service-fees');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Tạo mới giá tiền công</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
        {/* Loại tiền */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Loại tiền
          </label>
          <select
            name="loaiTien"
            value={formData.loaiTien}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
            <option value="CNY">CNY</option>
            <option value="EUR">EUR</option>
          </select>
        </div>

        {/* Từ giá */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Từ giá
          </label>
          <input
            type="number"
            name="tuGia"
            value={formData.tuGia}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="0"
          />
        </div>

        {/* Đến giá */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Đến giá
          </label>
          <input
            type="number"
            name="denGia"
            value={formData.denGia}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="0"
          />
        </div>

        {/* Tiền công 1 món */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Tiền công 1 món
          </label>
          <input
            type="number"
            name="tienCong1Mon"
            value={formData.tienCong1Mon}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="0"
          />
        </div>

        {/* Tính theo phần trăm */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="tinhTheoPhanTram"
            id="tinhTheoPhanTram"
            checked={formData.tinhTheoPhanTram}
            onChange={handleChange}
            className="mr-2 h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="tinhTheoPhanTram" className="text-sm font-medium text-gray-700">
            Tính theo phần trăm
          </label>
        </div>

        {/* Khách buôn */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="khachBuon"
            id="khachBuon"
            checked={formData.khachBuon}
            onChange={handleChange}
            className="mr-2 h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="khachBuon" className="text-sm font-medium text-gray-700">
            Khách buôn
          </label>
        </div>

        {/* Submit buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/service-fees')}
            className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
