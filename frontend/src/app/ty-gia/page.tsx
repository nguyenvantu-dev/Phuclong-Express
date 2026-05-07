'use client';

import { useEffect, useState } from 'react';
import { FiRefreshCw, FiTrendingUp, FiClock } from 'react-icons/fi';
import { getTyGia, TyGiaItem } from '@/lib/api';
import apiClient from '@/lib/api-client';
import {
  ExchangeRateHistoryModal,
  type ExchangeRateHistory,
} from './components/exchange-rate-history-modal';
import { ExchangeRateDailyRatesTable } from './components/exchange-rate-daily-rates-table';

function formatNumber(value: number) {
  if (value !== 0 && !value) return '-';
  return value.toLocaleString('vi-VN');
}

function RateCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 h-6 w-14 animate-pulse rounded-lg bg-slate-100" />
      <div className="mb-1.5 h-7 w-32 animate-pulse rounded bg-slate-100" />
      <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
    </div>
  );
}

export default function TyGiaPage() {
  const [rates, setRates] = useState<TyGiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [historyName, setHistoryName] = useState<string | null>(null);
  const [history, setHistory] = useState<ExchangeRateHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => { loadTyGia(); }, []);

  const loadTyGia = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getTyGia();
      setRates(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading ty gia:', err);
      setError('Không thể tải dữ liệu tỷ giá');
    } finally {
      setLoading(false);
    }
  };

  const openHistory = async (name: string) => {
    setHistoryName(name);
    setHistory([]);
    setHistoryLoading(true);
    try {
      const { data } = await apiClient.get<{ data: ExchangeRateHistory[] }>(`/exchange-rates/${name}/history`);
      setHistory(data.data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:py-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14264b]/10">
            <FiTrendingUp className="h-5 w-5 text-[#14264b]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 md:text-2xl">Tỷ giá</h1>
            <p className="text-xs text-slate-400">
              {lastUpdated
                ? `Cập nhật ${lastUpdated.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                : 'Đang tải...'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadTyGia}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#14264b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#1f3a6d] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiRefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Currency cards */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <RateCardSkeleton key={i} />)}
        </div>
      ) : rates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 py-12 text-center text-sm text-slate-400">
          Không có dữ liệu tỷ giá
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {rates.map((rate, i) => {
            // Make last card span full row if it would be alone
            const n = rates.length;
            const isLast = i === n - 1;
            const spanClass = isLast ? [
              n % 2 === 1 ? 'col-span-2' : '',
              n % 3 === 1 ? 'sm:col-span-3' : n % 2 === 1 ? 'sm:col-span-1' : '',
              n % 4 === 1 ? 'lg:col-span-4' : n % 3 === 1 ? 'lg:col-span-1' : '',
            ].filter(Boolean).join(' ') : '';
            return (
            <div
              key={rate.Name}
              className={`group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow duration-150 hover:shadow-md ${spanClass}`}
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="rounded-lg bg-[#14264b]/10 px-2.5 py-1 text-xs font-bold tracking-wide text-[#14264b]">
                  {rate.Name}
                </span>
                <button
                  onClick={() => openHistory(rate.Name)}
                  title="Xem lịch sử"
                  className="cursor-pointer rounded-lg p-1 text-slate-300 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
                >
                  <FiClock className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-lg font-bold tabular-nums text-slate-800">
                {formatNumber(rate.TyGiaVND)}
                <span className="ml-1 text-xs font-normal text-slate-400">₫</span>
              </p>
              {rate.CongShipVeVN > 0 && (
                <p className="mt-1 text-xs tabular-nums text-slate-500">
                  Ship VN: <span className="font-medium">{formatNumber(rate.CongShipVeVN)}</span>
                </p>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Daily rates history */}
      <ExchangeRateDailyRatesTable />

      {/* Per-currency history modal */}
      {historyName && (
        <ExchangeRateHistoryModal
          name={historyName}
          history={history}
          loading={historyLoading}
          onClose={() => setHistoryName(null)}
        />
      )}
    </div>
  );
}
