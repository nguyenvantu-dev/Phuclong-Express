'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface ServiceFee {
  id: number;
  loaiTien: string;
  tuGia: number;
  denGia: number;
  tienCong1Mon: number;
  tinhTheoPhanTram: boolean;
  khachBuon: boolean;
}

interface FormData {
  loaiTien: string;
  tuGia: string;
  denGia: string;
  tienCong1Mon: string;
  tinhTheoPhanTram: boolean;
  khachBuon: boolean;
}

/**
 * Edit Service Fee Page
 *
 * Converted from admin/GiaTienCong_Them.aspx?id={id}
 */
export default function EditServiceFeePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = Number(params.id);

  const [formData, setFormData] = useState<FormData>({
    loaiTien: 'VND',
    tuGia: '',
    denGia: '',
    tienCong1Mon: '',
    tinhTheoPhanTram: false,
    khachBuon: false,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchServiceFee = async () => {
      setIsLoading(true);
      try {
        const { data } = await apiClient.get<ServiceFee>(`/service-fees/${id}`);

        setFormData({
          loaiTien: data.loaiTien,
          tuGia: data.tuGia.toString(),
          denGia: data.denGia.toString(),
          tienCong1Mon: data.tienCong1Mon.toString(),
          tinhTheoPhanTram: data.tinhTheoPhanTram,
          khachBuon: data.khachBuon,
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceFee();
  }, [id]);

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
      await apiClient.put(`/service-fees/${id}`, {
        loaiTien: formData.loaiTien,
        tuGia: Number(formData.tuGia),
        denGia: Number(formData.denGia),
        tienCong1Mon: Number(formData.tienCong1Mon),
        tinhTheoPhanTram: formData.tinhTheoPhanTram,
        khachBuon: formData.khachBuon,
      });

      await queryClient.invalidateQueries({ queryKey: ['service-fees'] });
      router.push('/admin/service-fees');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Chỉnh sửa giá tiền công</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Loại tiền</label>
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

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Từ giá</label>
          <input
            type="number"
            name="tuGia"
            value={formData.tuGia}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Đến giá</label>
          <input
            type="number"
            name="denGia"
            value={formData.denGia}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tiền công 1 món</label>
          <input
            type="number"
            name="tienCong1Mon"
            value={formData.tienCong1Mon}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

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
