'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface FormData {
  orderNumber: string;
  totalCharged: string;
  totalItem: string;
}

const API_BASE = '/api/admin/purchased-items';

/**
 * Mass Update Purchased Items Page
 *
 * Converted from admin/HangKhoan_MassUpdate.aspx
 */
function MassUpdatePurchasedItemsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ids = searchParams.get('id') || '';
  const ws = searchParams.get('ws') || '';

  const [formData, setFormData] = useState<FormData>({
    orderNumber: '',
    totalCharged: '',
    totalItem: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.totalCharged) {
      setError('Phải nhập Total charged');
      return;
    }

    if (isNaN(Number(formData.totalCharged))) {
      setError('Total charged phải là kiểu số');
      return;
    }

    if (!formData.totalItem) {
      setError('Phải nhập Total item');
      return;
    }

    if (isNaN(Number(formData.totalItem))) {
      setError('Total item phải là kiểu số');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids,
          orderNumber: formData.orderNumber,
          totalCharged: Number(formData.totalCharged),
          totalItem: Number(formData.totalItem),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update items');
      }

      router.push('/admin/purchased-items');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ids) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Không có items được chọn. Vui lòng chọn items từ danh sách hàng khoán.
        </div>
        <button
          onClick={() => router.push('/admin/purchased-items')}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Cập nhật hàng khoán</h1>
      <p className="text-sm text-gray-600">
        Đang xử lý những ID của Website: {ws} - {ids}
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg bg-white p-6 shadow">
        {/* Order Number */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Order Number
          </label>
          <input
            type="text"
            name="orderNumber"
            value={formData.orderNumber}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Nhập order number"
          />
        </div>

        {/* Total Charged */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Total charged *
          </label>
          <input
            type="number"
            name="totalCharged"
            value={formData.totalCharged}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="0"
            required
          />
        </div>

        {/* Total Item */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Total item *
          </label>
          <input
            type="number"
            name="totalItem"
            value={formData.totalItem}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="0"
            required
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

export default function MassUpdatePurchasedItemsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MassUpdatePurchasedItemsPageContent />
    </Suspense>
  );
}
