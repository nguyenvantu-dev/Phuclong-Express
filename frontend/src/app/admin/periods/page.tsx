'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  FiCalendar,
  FiPlus,
  FiLock,
  FiUnlock,
  FiTrash2,
  FiEye,
  FiEdit2,
  FiRefreshCw,
  FiAlertCircle,
} from 'react-icons/fi';
import apiClient from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth-context';

interface Period {
  KyID: number;
  Nam: number;
  Thang: number;
  DaDong: boolean;
}

export default function PeriodsPage() {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closingId, setClosingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPeriods = useCallback(async () => {
    setError('');
    try {
      const { data } = await apiClient.get('/periods');
      setPeriods(data.data || []);
    } catch (err) {
      console.error('Failed to fetch periods:', err);
      setError('Không thể tải danh sách kỳ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const handleClosePeriod = async (id: number) => {
    if (!confirm('Bạn có chắc đóng kỳ này không?')) return;
    setClosingId(id);
    try {
      const { data } = await apiClient.post(`/periods/${id}/close`, {}, {
        headers: { 'x-username': user?.username || '' },
      });

      if (data.code === 0) {
        fetchPeriods();
      } else if (data.code === 1) {
        alert('Kỳ trước chưa đóng. Không thực hiện đóng kỳ này');
      } else if (data.code === 2) {
        alert('Không có kỳ liền kề trước. Không thực hiện đóng kỳ này');
      } else if (data.code === 3) {
        alert('Có dữ liệu công nợ trước ngày đóng chưa duyệt. Không thực hiện đóng kỳ này');
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to close period:', err);
      alert('Có lỗi trong quá trình thực hiện');
    } finally {
      setClosingId(null);
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (!confirm(`Bạn có chắc muốn xóa kỳ "${label}"?`)) return;
    setDeletingId(id);
    try {
      const { data } = await apiClient.delete(`/periods/${id}`, {
        headers: { 'x-username': user?.username || '' },
      });

      if (data.code === 0) {
        setPeriods(prev => prev.filter(p => p.KyID !== id));
      } else if (data.code === 1) {
        alert('Kỳ đã phát sinh dữ liệu. Không thực hiện xóa');
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to delete period:', err);
      alert('Có lỗi trong quá trình thực hiện');
    } finally {
      setDeletingId(null);
    }
  };

  const openCount = periods.filter(p => !p.DaDong).length;
  const closedCount = periods.filter(p => p.DaDong).length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14264b]/10">
            <FiCalendar className="h-5 w-5 text-[#14264b]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Danh sách kỳ công nợ</h1>
            {!loading && (
              <p className="text-sm text-slate-500">
                <span className="font-semibold text-slate-700">{openCount}</span> đang mở
                {' · '}
                <span className="font-semibold text-slate-700">{closedCount}</span> đã đóng
              </p>
            )}
          </div>
        </div>

        <Link
          href="/admin/periods/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#14264b] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3db8e4] cursor-pointer"
        >
          <FiPlus className="h-4 w-4" />
          Tạo mới kỳ
        </Link>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
          <button
            onClick={fetchPeriods}
            className="ml-auto inline-flex items-center gap-1 text-xs underline underline-offset-2 hover:no-underline cursor-pointer"
          >
            <FiRefreshCw className="h-3 w-3" />
            Thử lại
          </button>
        </div>
      )}

      {/* Table card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          /* Skeleton */
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                <div className="h-5 w-20 animate-pulse rounded-full bg-slate-100" />
                <div className="ml-auto flex gap-2">
                  <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100" />
                  <div className="h-7 w-20 animate-pulse rounded-lg bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : periods.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FiCalendar className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Chưa có kỳ nào</p>
            <p className="mt-1 text-xs text-slate-400">Tạo kỳ công nợ đầu tiên để bắt đầu</p>
            <Link
              href="/admin/periods/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#14264b] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3db8e4] cursor-pointer"
            >
              <FiPlus className="h-4 w-4" />
              Tạo mới
            </Link>
          </div>
        ) : (
          /* Data table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-20">Năm</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-20">Tháng</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-28">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periods.map((period) => {
                  const label = `Tháng ${period.Thang}/${period.Nam}`;
                  const isClosing = closingId === period.KyID;
                  const isDeleting = deletingId === period.KyID;
                  const isBusy = isClosing || isDeleting;

                  return (
                    <tr key={period.KyID} className="group transition-colors hover:bg-[#14264b]/5">
                      <td className="px-4 py-3 font-medium text-slate-800">{period.Nam}</td>
                      <td className="px-4 py-3 text-slate-600">{period.Thang}</td>
                      <td className="px-4 py-3">
                        {period.DaDong ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            <FiLock className="h-3 w-3" />
                            Đã đóng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <FiUnlock className="h-3 w-3" />
                            Đang mở
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* View / Edit link */}
                          {period.DaDong ? (
                            <Link
                              href={`/admin/periods/${period.KyID}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                            >
                              <FiEye className="h-3.5 w-3.5" />
                              Chi tiết
                            </Link>
                          ) : (
                            <Link
                              href={`/admin/periods/new?id=${period.KyID}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                            >
                              <FiEdit2 className="h-3.5 w-3.5" />
                              Chỉnh sửa
                            </Link>
                          )}

                          {/* Close period button */}
                          {!period.DaDong && (
                            <button
                              onClick={() => handleClosePeriod(period.KyID)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                            >
                              {isClosing ? (
                                <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <FiLock className="h-3.5 w-3.5" />
                              )}
                              {isClosing ? 'Đóng...' : 'Đóng kỳ'}
                            </button>
                          )}

                          {/* Delete button */}
                          <button
                            onClick={() => handleDelete(period.KyID, label)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                          >
                            {isDeleting ? (
                              <FiRefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FiTrash2 className="h-3.5 w-3.5" />
                            )}
                            {isDeleting ? '...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
