'use client';

import { useState, useEffect } from 'react';
import { FiRefreshCw, FiCalendar } from 'react-icons/fi';
import apiClient from '@/lib/api-client';

interface DailyRateRow {
  NgayDate: string;
  Name: string;
  TyGiaVND: number;
  CongShipVeVN: number;
}

interface DailyEntry {
  date: string;
  rates: Record<string, { TyGiaVND: number; CongShipVeVN: number }>;
}

function formatDate(iso: string) {
  const [y, m, d] = iso.substring(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

function formatNumber(value: number) {
  if (value !== 0 && !value) return '-';
  return value.toLocaleString('vi-VN');
}

function pivotByDate(rows: DailyRateRow[]): DailyEntry[] {
  const map = new Map<string, DailyEntry>();
  for (const row of rows) {
    const key = String(row.NgayDate).substring(0, 10);
    if (!map.has(key)) map.set(key, { date: key, rates: {} });
    map.get(key)!.rates[row.Name] = { TyGiaVND: row.TyGiaVND, CongShipVeVN: row.CongShipVeVN };
  }
  return Array.from(map.values());
}

export function ExchangeRateDailyRatesTable() {
  const [days, setDays] = useState(30);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiClient
      .get<{ data: DailyRateRow[] }>(`/exchange-rates/daily-rates?days=${days}`)
      .then(({ data }) => {
        if (cancelled) return;
        const rows = data.data || [];
        const pivoted = pivotByDate(rows);
        const names = Array.from(new Set(rows.map(r => r.Name))).sort();
        setEntries(pivoted);
        setCurrencies(names);
      })
      .catch(() => {
        if (!cancelled) { setEntries([]); setCurrencies([]); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [days]);

  return (
    <div className="rounded-xl border border-[#14264b]/20 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#14264b]/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <FiCalendar className="h-4 w-4 text-[#14264b]" />
          <span className="text-sm font-semibold text-slate-700">Tỷ giá theo ngày</span>
          {!loading && entries.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
              {entries.length} ngày
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {[30, 60].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`cursor-pointer rounded-lg px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                days === d
                  ? 'bg-[#14264b] text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {d} ngày
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <FiRefreshCw className="h-5 w-5 animate-spin text-slate-300" />
        </div>
      ) : entries.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-400">Chưa có dữ liệu lịch sử</div>
      ) : (
        <div className="max-h-[460px] overflow-y-auto">
          <table className="w-full table-fixed text-sm">
            <thead className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_rgba(20,38,75,0.1)]">
              <tr>
                <th className="w-28 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-[#14264b]">
                  Ngày
                </th>
                {currencies.map(cur => (
                  <th key={cur} className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-[#14264b]">
                    {cur}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.date}
                  className={
                    i === 0
                      ? 'bg-[#14264b]/5'
                      : i % 2 === 0
                        ? 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50/40 hover:bg-slate-50/80'
                  }
                >
                  <td className="px-4 py-2 text-xs font-medium text-slate-600">
                    <span className="whitespace-nowrap">{formatDate(entry.date)}</span>
                    {i === 0 && (
                      <span className="ml-1.5 rounded-full bg-[#14264b] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        mới
                      </span>
                    )}
                  </td>
                  {currencies.map(cur => {
                    const rate = entry.rates[cur];
                    return (
                      <td key={cur} className="px-3 py-2 text-right tabular-nums text-slate-700">
                        {rate ? (
                          <span className="text-xs">
                            {formatNumber(rate.TyGiaVND)}
                            <span className="ml-0.5 text-slate-400">₫</span>
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
