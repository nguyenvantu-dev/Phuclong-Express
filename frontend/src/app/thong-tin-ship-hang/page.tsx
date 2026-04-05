'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getShipmentGroupByUsernameAndTenDotHang } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth-context';

interface ShipInfo {
  ngayGuiHang?: string;
  shipperName?: string;
  shipperPhone?: string;
  shipperAddress?: string;
}

function ThongTinShipHangContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const id = searchParams.get('id');
  const dotHang = searchParams.get('dotHang');

  const [shipInfo, setShipInfo] = useState<ShipInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if ((id || dotHang) && user?.username) {
      loadShipInfo();
    }
  }, [id, dotHang, user]);

  const loadShipInfo = async () => {
    if (!user?.username) return;

    setIsLoading(true);
    setError('');

    try {
      let data;
      if (dotHang) {
        data = await getShipmentGroupByUsernameAndTenDotHang(user.username, dotHang);
      } else if (id) {
        // Need to find by ID - use the shipment group endpoint
        data = await getShipmentGroupByUsernameAndTenDotHang(user.username, id);
      }

      if (data) {
        setShipInfo({
          ngayGuiHang: data.ngayGuiHang,
          shipperName: data.shipperName,
          shipperPhone: data.shipperPhone,
          shipperAddress: data.shipperAddress,
        });
      }
    } catch (err) {
      console.error('Error loading ship info:', err);
      setError('Không tìm thấy thông tin gửi hàng');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
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

  if (error || !shipInfo) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">Thông tin gửi hàng</h2>
        <div className="text-red-500 text-center py-8">{error || 'Không tìm thấy thông tin gửi hàng'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">Thông tin gửi hàng</h2>

      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-4">
        <div className="mb-4">
          <span className="text-slate-700 font-medium">Ngày gửi:</span>
          <span className="ml-3 text-slate-600">{formatDate(shipInfo.ngayGuiHang)}</span>
        </div>
        <div className="mb-4">
          <span className="text-slate-700 font-medium">Tên shipper:</span>
          <span className="ml-3 text-slate-600">{shipInfo.shipperName || '-'}</span>
        </div>
        <div className="mb-4">
          <span className="text-slate-700 font-medium">Số điện thoại shipper:</span>
          <span className="ml-3 text-slate-600">{shipInfo.shipperPhone || '-'}</span>
        </div>
        <div>
          <span className="text-slate-700 font-medium">Địa chỉ shipper:</span>
          <span className="ml-3 text-slate-600">{shipInfo.shipperAddress || '-'}</span>
        </div>
      </div>
    </div>
  );
}

export default function ThongTinShipHangPage() {
  return (
    <Suspense fallback={
      <div className="text-center py-12">
        <svg className="w-8 h-8 animate-spin text-cyan-600 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <ThongTinShipHangContent />
    </Suspense>
  );
}
