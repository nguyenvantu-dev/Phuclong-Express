'use client';

import { FiClock, FiX, FiRefreshCw } from 'react-icons/fi';

export interface ExchangeRateHistory {
  Id: number;
  Name: string;
  TyGiaVND: number;
  CongShipVeVN: number;
  NguoiCapNhat: string | null;
  NgayCapNhat: string;
}

interface Props {
  name: string;
  history: ExchangeRateHistory[];
  loading: boolean;
  onClose: () => void;
}

function formatNumber(value: number) {
  if (value !== 0 && !value) return '-';
  return value.toLocaleString('vi-VN');
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
}

export function ExchangeRateHistoryModal({ name, history, loading, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#14264b]/10">
              <FiClock className="h-3.5 w-3.5 text-[#14264b]" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Lịch sử thay đổi</p>
              <p className="text-sm font-semibold text-slate-800">{name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-600"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiRefreshCw className="h-5 w-5 animate-spin text-slate-300" />
            </div>
          ) : history.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">Chưa có lịch sử thay đổi</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Thời gian</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Tỷ giá</th>
                  <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Ship VN</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr
                    key={h.Id}
                    className={i === 0 ? 'bg-[#14264b]/5' : 'border-t border-slate-50 hover:bg-slate-50'}
                  >
                    <td className="px-5 py-2.5">
                      <p className="text-xs text-slate-600">{formatDateTime(h.NgayCapNhat)}</p>
                      </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      <span className="font-medium text-slate-800">{formatNumber(h.TyGiaVND)}</span>
                      <span className="ml-0.5 text-xs text-slate-400">₫</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                      {formatNumber(h.CongShipVeVN)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
