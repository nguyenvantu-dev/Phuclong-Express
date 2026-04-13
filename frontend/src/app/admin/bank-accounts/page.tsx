'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiCreditCard, FiEdit2, FiCheck, FiX, FiPlus, FiRefreshCw } from 'react-icons/fi';
import apiClient from '@/lib/api-client';

interface BankAccount {
  ID: number;
  TenTaiKhoanNganHang: string;
  GhiChu: string;
}

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTen, setEditTen] = useState('');
  const [editGhiChu, setEditGhiChu] = useState('');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTen, setNewTen] = useState('');
  const [newGhiChu, setNewGhiChu] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      const { data } = await apiClient.get<{ data: BankAccount[] }>('/bank-accounts');
      setAccounts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err);
      setError('Không thể tải danh sách tài khoản ngân hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // --- Add ---
  const handleAdd = async () => {
    if (!newTen.trim()) {
      setAddError('Vui lòng nhập tên tài khoản');
      return;
    }
    setAdding(true);
    setAddError('');
    try {
      await apiClient.post('/bank-accounts', { tenTaiKhoanNganHang: newTen.trim(), ghiChu: newGhiChu.trim() });
      setNewTen('');
      setNewGhiChu('');
      setShowAddForm(false);
      fetchAccounts();
    } catch (err) {
      console.error('Failed to add bank account:', err);
      setAddError('Có lỗi trong quá trình thực hiện');
    } finally {
      setAdding(false);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setNewTen('');
    setNewGhiChu('');
    setAddError('');
  };

  // --- Edit ---
  const startEdit = (account: BankAccount) => {
    setEditingId(account.ID);
    setEditTen(account.TenTaiKhoanNganHang);
    setEditGhiChu(account.GhiChu || '');
    setEditError('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTen('');
    setEditGhiChu('');
    setEditError('');
  };

  const handleSave = async () => {
    if (!editTen.trim()) {
      setEditError('Tên tài khoản không được để trống');
      return;
    }
    setSaving(true);
    setEditError('');
    try {
      await apiClient.put(`/bank-accounts/${editingId}`, {
        tenTaiKhoanNganHang: editTen.trim(),
        ghiChu: editGhiChu.trim(),
      });
      setAccounts(prev =>
        prev.map(a =>
          a.ID === editingId ? { ...a, TenTaiKhoanNganHang: editTen.trim(), GhiChu: editGhiChu.trim() } : a,
        ),
      );
      cancelEdit();
    } catch (err) {
      console.error('Failed to update bank account:', err);
      setEditError('Cập nhật thất bại, vui lòng thử lại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14264b]/10">
            <FiCreditCard className="h-5 w-5 text-[#14264b]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Danh mục tài khoản ngân hàng</h1>
            {!loading && (
              <p className="text-sm text-slate-500">
                Tổng <span className="font-semibold text-slate-700">{accounts.length}</span> tài khoản
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => { setShowAddForm(true); setEditingId(null); }}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#14264b] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#4ab5dd] focus:outline-none focus:ring-2 focus:ring-[#14264b]/30"
        >
          <FiPlus className="h-4 w-4" />
          Thêm mới
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="overflow-hidden rounded-2xl border border-[#14264b]/30 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-3">
            <h2 className="text-sm font-semibold text-slate-700">Thêm tài khoản mới</h2>
          </div>
          <div className="space-y-4 px-6 py-4">
            {addError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500" />
                {addError}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Tên tài khoản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTen}
                  onChange={e => setNewTen(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') cancelAdd(); }}
                  autoFocus
                  placeholder="Nhập tên tài khoản..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600">Ghi chú</label>
                <input
                  type="text"
                  value={newGhiChu}
                  onChange={e => setNewGhiChu(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') cancelAdd(); }}
                  placeholder="Ghi chú (tùy chọn)..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/20"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleAdd}
                disabled={adding}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#14264b] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#4ab5dd] disabled:opacity-50"
              >
                {adding ? <FiRefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FiCheck className="h-3.5 w-3.5" />}
                Lưu
              </button>
              <button
                onClick={cancelAdd}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <FiX className="h-3.5 w-3.5" />
                Huỷ
              </button>
            </div>
          </div>
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
                <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-64 animate-pulse rounded bg-slate-100 ml-4" />
                <div className="h-6 w-14 animate-pulse rounded bg-slate-100 ml-auto" />
              </div>
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FiCreditCard className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Chưa có tài khoản ngân hàng nào</p>
            <p className="mt-1 text-xs text-slate-400">Nhấn &quot;Thêm mới&quot; để bắt đầu</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tên tài khoản
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Ghi chú
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accounts.map(account => (
                <tr key={account.ID} className="group transition-colors hover:bg-[#14264b]/5">
                  {/* Tên tài khoản */}
                  <td className="px-6 py-3">
                    {editingId === account.ID ? (
                      <input
                        type="text"
                        value={editTen}
                        onChange={e => setEditTen(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') cancelEdit(); }}
                        autoFocus
                        className="w-full max-w-xs rounded-lg border border-[#14264b] px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14264b]/20"
                      />
                    ) : (
                      <span className="font-medium text-slate-800">{account.TenTaiKhoanNganHang}</span>
                    )}
                  </td>

                  {/* Ghi chú */}
                  <td className="px-6 py-3">
                    {editingId === account.ID ? (
                      <input
                        type="text"
                        value={editGhiChu}
                        onChange={e => setEditGhiChu(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') cancelEdit(); }}
                        className="w-full max-w-sm rounded-lg border border-[#14264b] px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#14264b]/20"
                      />
                    ) : (
                      <span className="text-slate-500">{account.GhiChu || '—'}</span>
                    )}
                  </td>

                  {/* Thao tác */}
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {editingId === account.ID ? (
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
                          onClick={() => startEdit(account)}
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
