'use client';

import { useEffect, useState } from 'react';
import { FiRefreshCw, FiTrendingUp } from 'react-icons/fi';
import { getTyGia, TyGiaItem } from '@/lib/api';

export default function TyGiaPage() {
  const [rates, setRates] = useState<TyGiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTyGia();
  }, []);

  const loadTyGia = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTyGia();
      setRates(data);
    } catch (err) {
      console.error('Error loading ty gia:', err);
      setError('Không thể tải dữ liệu tỷ giá');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: number) => {
    if (value !== 0 && !value) return '-';
    return value.toLocaleString('vi-VN');
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#14264b]/10 text-[#14264b]">
            <FiTrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Tỷ giá</h1>
            <p className="mt-1 text-sm text-slate-500">Cập nhật từ hệ thống Phuc Long Express</p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadTyGia}
          disabled={loading}
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#14264b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#1f3a6d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#14264b]/20 bg-white shadow-sm">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 px-4 py-4">
                <div className="h-4 animate-pulse rounded bg-slate-100" />
                <div className="h-4 animate-pulse rounded bg-slate-100" />
                <div className="h-4 animate-pulse rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : rates.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-500">Không có dữ liệu tỷ giá</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#14264b]/10">
                  <th className="border-b border-[#14264b]/20 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#14264b]">
                    Loại tiền
                  </th>
                  <th className="border-b border-[#14264b]/20 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#14264b]">
                    Tỷ giá VND
                  </th>
                  <th className="border-b border-[#14264b]/20 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-[#14264b]">
                    Công ship về VN
                  </th>
                </tr>
              </thead>
              <tbody>
                {rates.map((rate) => (
                  <tr key={rate.Name} className="bg-white transition-colors hover:bg-[#14264b]/5">
                    <td className="border-b border-[#14264b]/10 px-4 py-3">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {rate.Name}
                      </span>
                    </td>
                    <td className="border-b border-[#14264b]/10 px-4 py-3 text-right font-medium tabular-nums text-slate-800">
                      {formatNumber(rate.TyGiaVND)}
                    </td>
                    <td className="border-b border-[#14264b]/10 px-4 py-3 text-right font-medium tabular-nums text-slate-700">
                      {formatNumber(rate.CongShipVeVN)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
