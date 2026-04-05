'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getShipperById, Shipper } from '@/lib/api';

function ShipperDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [shipper, setShipper] = useState<Shipper | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadShipper();
    }
  }, [id]);

  const loadShipper = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const data = await getShipperById(Number(id));
      setShipper(data);
    } catch (err) {
      console.error('Error loading shipper:', err);
      setError('Không tìm thấy thông tin shipper');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <svg className="w-8 h-8 animate-spin text-cyan-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-2 text-slate-600">Đang tải...</p>
      </div>
    );
  }

  if (error || !shipper) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <div className="text-red-500 text-center py-8">{error || 'Không tìm thấy thông tin shipper'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">Thông tin shipper</h2>

      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <tbody>
            <tr className="border-b border-cyan-100">
              <td className="px-4 py-3 text-right font-bold text-slate-700 w-1/3">Tên shipper:</td>
              <td className="px-4 py-3 text-slate-600">{shipper.ShipperName}</td>
            </tr>
            <tr className="border-b border-cyan-100">
              <td className="px-4 py-3 text-right font-bold text-slate-700">Số điện thoại:</td>
              <td className="px-4 py-3 text-slate-600">{shipper.ShipperPhone}</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-right font-bold text-slate-700">Địa chỉ:</td>
              <td className="px-4 py-3 text-slate-600">{shipper.ShipperAddress}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ShipperDetailPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <svg className="w-8 h-8 animate-spin text-cyan-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <ShipperDetailContent />
    </Suspense>
  );
}
