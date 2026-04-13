'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FiArrowLeft,
  FiShield,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiPlus,
} from 'react-icons/fi';
import apiClient from '@/lib/api-client';

const INPUT_BASE =
  'w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/20 transition-all';

const INPUT_ERROR =
  'w-full rounded-xl border border-red-300 bg-white py-2.5 px-4 text-sm text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 transition-all';

export default function CreateRolePage() {
  const [roleName, setRoleName] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (value: string) => {
    setRoleName(value);
    if (fieldError) setFieldError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!roleName.trim()) {
      setFieldError('Bắt buộc nhập');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/roles', { roleName: roleName.trim() });
      setSuccess(true);
      setTimeout(() => { window.location.href = '/admin/roles'; }, 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Tạo role thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/roles"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
          aria-label="Quay lại danh sách role"
        >
          <FiArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14264b]/10">
            <FiShield className="h-5 w-5 text-[#14264b]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Tạo mới role</h1>
            <p className="text-sm text-slate-500">Thêm role mới vào hệ thống</p>
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {(error || success) && (
        <div
          role="alert"
          className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm ${
            success
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {success
            ? <FiCheckCircle className="h-4 w-4 flex-shrink-0" />
            : <FiAlertCircle className="h-4 w-4 flex-shrink-0" />}
          {success ? 'Tạo role thành công! Đang chuyển hướng...' : error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-md space-y-4">
          {/* Form card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-4">
              <FiShield className="h-4 w-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">Thông tin role</h2>
            </div>
            <div className="p-6">
              <label htmlFor="roleName" className="mb-1.5 block text-xs font-medium text-slate-500">
                Tên role <span className="text-red-400">*</span>
              </label>
              <input
                id="roleName"
                type="text"
                value={roleName}
                onChange={e => handleChange(e.target.value)}
                onBlur={() => { if (!roleName.trim()) setFieldError('Bắt buộc nhập'); }}
                placeholder="VD: Admin, Manager, Staff..."
                autoFocus
                aria-describedby={fieldError ? 'roleName-error' : undefined}
                className={fieldError ? INPUT_ERROR : INPUT_BASE}
              />
              {fieldError && (
                <p id="roleName-error" className="mt-1 text-xs text-red-500">{fieldError}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-3">
            <button
              type="submit"
              disabled={loading || success}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                  Đang tạo...
                </>
              ) : success ? (
                <>
                  <FiCheckCircle className="h-4 w-4" />
                  Thành công!
                </>
              ) : (
                <>
                  <FiPlus className="h-4 w-4" />
                  Tạo Role
                </>
              )}
            </button>
            <Link
              href="/admin/roles"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-800 cursor-pointer"
            >
              Hủy bỏ
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
