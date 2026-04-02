'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface InStockItem {
  id: number;
  maSoHang: string;
  tenHinh: string;
  tenHang: string;
  linkHang: string;
  giaTien: number;
  moTa: string;
  soSao: number;
  thuTu: number;
}

interface FormData {
  maSoHang: string;
  tenHang: string;
  linkHang: string;
  giaTien: string;
  moTa: string;
  soSao: string;
  thuTu: string;
}

const API_BASE = '/api/admin/in-stock-items';

/**
 * Edit In-Stock Item Page
 *
 * Converted from admin/HangCoSan_Them.aspx?id={id}
 */
export default function EditInStockItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [formData, setFormData] = useState<FormData>({
    maSoHang: '',
    tenHang: '',
    linkHang: '',
    giaTien: '',
    moTa: '',
    soSao: '0',
    thuTu: '0',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchItem = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch item');
        const data: InStockItem = await response.json();

        setFormData({
          maSoHang: data.maSoHang,
          tenHang: data.tenHang,
          linkHang: data.linkHang || '',
          giaTien: data.giaTien?.toString() || '',
          moTa: data.moTa || '',
          soSao: (data.soSao || 0).toString(),
          thuTu: (data.thuTu || 0).toString(),
        });
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.tenHang || !formData.maSoHang) {
      setError('Vui lòng nhập đủ thông tin');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maSoHang: formData.maSoHang,
          tenHang: formData.tenHang,
          linkHang: formData.linkHang,
          giaTien: formData.giaTien ? Number(formData.giaTien) : 0,
          moTa: formData.moTa,
          soSao: formData.soSao ? Number(formData.soSao) : 0,
          thuTu: formData.thuTu ? Number(formData.thuTu) : 0,
          noiDungTimKiem: `${formData.tenHang} ${formData.moTa}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      router.push('/admin/in-stock-items');
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
      <h1 className="text-2xl font-bold">Chỉnh sửa hàng có sẵn</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mã số hàng *</label>
          <input
            type="text"
            name="maSoHang"
            value={formData.maSoHang}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Tên hàng *</label>
          <input
            type="text"
            name="tenHang"
            value={formData.tenHang}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Link hàng</label>
          <input
            type="text"
            name="linkHang"
            value={formData.linkHang}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Giá tiền</label>
          <input
            type="number"
            name="giaTien"
            value={formData.giaTien}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            name="moTa"
            value={formData.moTa}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Số sao</label>
          <select
            name="soSao"
            value={formData.soSao}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Thứ tự</label>
          <input
            type="number"
            name="thuTu"
            value={formData.thuTu}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
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
            onClick={() => router.push('/admin/in-stock-items')}
            className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
