'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiTrendingUp, FiEdit2, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';
import apiClient from '@/lib/api-client';

interface ExchangeRate {
  Name: string;
  TyGiaVND: number;
  CongShipVeVN: number;
}

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline edit state
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editTyGiaVND, setEditTyGiaVND] = useState('');
  const [editCongShipVeVN, setEditCongShipVeVN] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchRates = useCallback(async () => {
    setError('');
    try {
      const { data } = await apiClient.get<{ data: ExchangeRate[] }>('/exchange-rates');
      setRates(data.data || []);
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
      setError('Không thể tải danh sách tỷ giá');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const startEdit = (rate: ExchangeRate) => {
    setEditingName(rate.Name);
    setEditTyGiaVND(rate.TyGiaVND?.toString() || '');
    setEditCongShipVeVN(rate.CongShipVeVN?.toString() || '');
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingName(null);
    setEditTyGiaVND('');
    setEditCongShipVeVN('');
    setEditError('');
  };

  const handleSave = async () => {
    if (!editingName) return;

    const tyGia = parseFloat(editTyGiaVND);
    const congShip = parseFloat(editCongShipVeVN);

    if (isNaN(tyGia)) {
      setEditError('Tỷ giá phải là kiểu số');
      return;
    }
    if (isNaN(congShip)) {
      setEditError('Công ship về VN phải là kiểu số');
      return;
    }

    setSaving(true);
    setEditError('');
    try {
      await apiClient.put(`/exchange-rates/${editingName}`, {
        name: editingName,
        tyGiaVND: tyGia,
        congShipVeVN: congShip,
      });
      setRates(prev =>
        prev.map(r =>
          r.Name === editingName ? { ...r, TyGiaVND: tyGia, CongShipVeVN: congShip } : r,
        ),
      );
      cancelEdit();
    } catch (err) {
      console.error('Failed to update exchange rate:', err);
      setEditError('Cập nhật thất bại, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  const formatNumber = (num: number) => {
    if (!num && num !== 0) return '—';
    return num.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14264b]/10">
            <FiTrendingUp className="h-5 w-5 text-[#14264b]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Danh mục tỷ giá</h1>
            {!loading && (
              <p className="text-sm text-slate-500">
                Tổng <span className="font-semibold text-slate-700">{rates.length}</span> loại tiền
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
          {error}
        </div>
      )}

      {/* Edit error */}
      {editError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
          {editError}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-32 animate-pulse rounded bg-slate-100 ml-8" />
                <div className="h-4 w-28 animate-pulse rounded bg-slate-100 ml-8" />
                <div className="h-6 w-14 animate-pulse rounded bg-slate-100 ml-auto" />
              </div>
            ))}
          </div>
        ) : rates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FiTrendingUp className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Chưa có dữ liệu tỷ giá</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Loại tiền
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tỷ giá VND
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Công ship về VN
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rates.map(rate => (
                <tr key={rate.Name} className="group transition-colors hover:bg-[#14264b]/5">
                  {/* Loại tiền */}
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {rate.Name}
                    </span>
                  </td>

                  {/* Tỷ giá VND */}
                  <td className="px-6 py-3 text-right">
                    {editingName === rate.Name ? (
                      <input
                        type="text"
                        value={editTyGiaVND}
                        onChange={e => setEditTyGiaVND(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSave();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        className="w-36 rounded-lg border border-[#14264b] px-3 py-1.5 text-right text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14264b]/20"
                      />
                    ) : (
                      <span className="font-medium tabular-nums text-slate-800">
                        {formatNumber(rate.TyGiaVND)}
                      </span>
                    )}
                  </td>

                  {/* Công ship về VN */}
                  <td className="px-6 py-3 text-right">
                    {editingName === rate.Name ? (
                      <input
                        type="text"
                        value={editCongShipVeVN}
                        onChange={e => setEditCongShipVeVN(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSave();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        className="w-36 rounded-lg border border-[#14264b] px-3 py-1.5 text-right text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14264b]/20"
                      />
                    ) : (
                      <span className="font-medium tabular-nums text-slate-800">
                        {formatNumber(rate.CongShipVeVN)}
                      </span>
                    )}
                  </td>

                  {/* Thao tác */}
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {editingName === rate.Name ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                          >
                            {saving ? (
                              <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FiCheck className="h-3.5 w-3.5" />
                            )}
                            Lưu
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100"
                          >
                            <FiX className="h-3.5 w-3.5" />
                            Huỷ
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(rate)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <FiEdit2 className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
