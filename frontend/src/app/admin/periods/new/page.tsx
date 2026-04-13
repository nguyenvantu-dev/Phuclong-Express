'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import {
  FiCalendar,
  FiChevronRight,
  FiAlertCircle,
  FiSave,
  FiRefreshCw,
  FiLock,
} from 'react-icons/fi';

interface Period {
  KyID: number;
  Nam: number;
  Thang: number;
  DaDong: boolean;
}

const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `Tháng ${i + 1}` }));

function NewPeriodPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');
  const isEdit = !!editId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<Period | null>(null);

  const [nam, setNam] = useState(new Date().getFullYear().toString());
  const [thang, setThang] = useState('1');

  useEffect(() => {
    if (!editId) return;
    apiClient.get(`/periods/${editId}`)
      .then(({ data }) => {
        if (data.data) {
          setPeriod(data.data);
          setNam(data.data.Nam.toString());
          setThang(data.data.Thang.toString());
        }
      })
      .catch((err) => console.error('Failed to load period:', err))
      .finally(() => setInitialLoading(false));
  }, [editId]);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');

    if (!nam.trim()) {
      setError('Vui lòng nhập đủ thông tin');
      return;
    }

    const namNum = parseInt(nam);
    if (isNaN(namNum)) {
      setError('Năm phải là kiểu số');
      return;
    }

    setLoading(true);
    try {
      const payload = { nam: namNum, thang: parseInt(thang) };
      const { data } = editId
        ? await apiClient.put(`/periods/${editId}`, payload)
        : await apiClient.post('/periods', payload);

      if (data.code === 0 || data.success) {
        router.push('/admin/periods');
      } else if (data.code === 1) {
        setError('Đã có kỳ này rồi');
      } else if (data.code === 2) {
        setError('Kỳ đã phát sinh dữ liệu. Không thể chỉnh sửa');
      } else {
        setError('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to save period:', err);
      setError('Có lỗi trong quá trình thực hiện');
    } finally {
      setLoading(false);
    }
  };

  const isClosed = !!period?.DaDong;
  const pageTitle = isEdit ? 'Chỉnh sửa kỳ' : 'Tạo mới kỳ';

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link href="/admin/periods" className="hover:text-slate-700 transition-colors cursor-pointer">
          Danh sách kỳ
        </Link>
        <FiChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="text-slate-800 font-medium">{pageTitle}</span>
      </nav>

      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14264b]/10">
          <FiCalendar className="h-5 w-5 text-[#14264b]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">{pageTitle}</h1>
          <p className="text-sm text-slate-500">
            {isEdit
              ? `Cập nhật thông tin kỳ Tháng ${thang}/${nam}`
              : 'Thêm kỳ công nợ mới vào hệ thống'}
          </p>
        </div>
      </div>

      {/* Loading skeleton */}
      {initialLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Closed period banner */}
          {isClosed && (
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-6 py-3 text-sm text-slate-600">
              <FiLock className="h-4 w-4 flex-shrink-0 text-slate-400" />
              Kỳ này đã đóng, không thể chỉnh sửa
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Year field */}
            <div className="space-y-1.5">
              <label htmlFor="nam" className="block text-sm font-medium text-slate-700">
                Năm <span className="text-red-500">*</span>
              </label>
              <input
                id="nam"
                type="text"
                value={nam}
                onChange={(e) => setNam(e.target.value)}
                disabled={isClosed}
                placeholder="Ví dụ: 2024"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400
                  focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/20
                  disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
                  transition-colors"
              />
            </div>

            {/* Month field */}
            <div className="space-y-1.5">
              <label htmlFor="thang" className="block text-sm font-medium text-slate-700">
                Tháng <span className="text-red-500">*</span>
              </label>
              <select
                id="thang"
                value={thang}
                onChange={(e) => setThang(e.target.value)}
                disabled={isClosed}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800
                  focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/20
                  disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400
                  transition-colors cursor-pointer"
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading || isClosed}
                className="inline-flex items-center gap-2 rounded-xl bg-[#14264b] px-4 py-2.5 text-sm font-semibold text-white shadow-sm
                  hover:bg-[#3db8e4] transition-colors
                  disabled:cursor-not-allowed disabled:opacity-50
                  focus:outline-none focus:ring-2 focus:ring-[#14264b]/40
                  cursor-pointer"
              >
                {loading ? (
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <FiSave className="h-4 w-4" />
                )}
                {loading ? 'Đang lưu...' : 'Lưu'}
              </button>

              <Link
                href="/admin/periods"
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600
                  hover:bg-slate-50 hover:text-slate-800 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-slate-200
                  cursor-pointer"
              >
                Hủy
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function NewPeriodPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
            <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          </div>
        </div>
      }
    >
      <NewPeriodPageContent />
    </Suspense>
  );
}
