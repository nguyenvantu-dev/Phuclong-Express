'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface FormData {
  websiteName: string;
  username: string;
  linkWeb: string;
  linkHinh: string;
  color: string;
  size: string;
  soLuong: string;
  donGiaWeb: string;
  ghiChu: string;
}


/**
 * Create Purchased Item Page
 *
 * Converted from admin/HangKhoan_Them.aspx
 */
export default function NewPurchasedItemPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    websiteName: '',
    username: '',
    linkWeb: '',
    linkHinh: '',
    color: '',
    size: '',
    soLuong: '1',
    donGiaWeb: '',
    ghiChu: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const websites = ['Amazon', 'eBay', 'Nike', 'Adidas', 'Apple', 'Target', 'Walmart'];
  const usernames = ['user1', 'user2', 'user3', 'khachhang1', 'khachhang2'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.websiteName || !formData.username) {
      setError('Vui lòng chọn website và username');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiClient.post('/purchased-items', {
        websiteName: formData.websiteName,
        username: formData.username,
        linkWeb: formData.linkWeb,
        linkHinh: formData.linkHinh,
        color: formData.color,
        size: formData.size,
        soLuong: formData.soLuong ? Number(formData.soLuong) : 1,
        donGiaWeb: formData.donGiaWeb ? Number(formData.donGiaWeb) : 0,
        loaiTien: 'VND',
        ghiChu: formData.ghiChu,
        hangKhoan: true,
      });

      router.push('/admin/purchased-items');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Tạo mới hàng khoán</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
        {/* Website */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Website *
          </label>
          <select
            name="websiteName"
            value={formData.websiteName}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">-- Chọn website --</option>
            {websites.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
            <option value="--Web khac--">--Web khac--</option>
          </select>
        </div>

        {/* Username */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Username *
          </label>
          <select
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            required
          >
            <option value="">-- Chọn username --</option>
            {usernames.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Link web */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Link sản phẩm
          </label>
          <input
            type="text"
            name="linkWeb"
            value={formData.linkWeb}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Link hình */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Link hình
          </label>
          <input
            type="text"
            name="linkHinh"
            value={formData.linkHinh}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Màu */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Màu
          </label>
          <input
            type="text"
            name="color"
            value={formData.color}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Size */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Size
          </label>
          <input
            type="text"
            name="size"
            value={formData.size}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Số lượng */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Số lượng
          </label>
          <input
            type="number"
            name="soLuong"
            value={formData.soLuong}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Giá web */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Giá web
          </label>
          <input
            type="number"
            name="donGiaWeb"
            value={formData.donGiaWeb}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Ghi chú */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Ghi chú
          </label>
          <textarea
            name="ghiChu"
            value={formData.ghiChu}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
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
            onClick={() => router.push('/admin/purchased-items')}
            className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
