'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiShield, FiRefreshCw } from 'react-icons/fi';
import apiClient from '@/lib/api-client';

interface Role {
  Id: string;
  Name: string;
}

export default function ListRolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get('/roles');
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      setError('Không thể tải danh sách role');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa role "${name}"?`)) return;
    setDeletingId(id);
    try {
      await apiClient.delete(`/roles/${id}`);
      setRoles(prev => prev.filter(r => r.Id !== id));
    } catch {
      alert('Xóa thất bại');
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (role: Role) => {
    setEditingId(role.Id);
    setEditName(role.Name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleSave = async (id: string) => {
    if (!editName.trim()) return;
    setSavingId(id);
    try {
      await apiClient.patch(`/roles/${id}`, { name: editName.trim() });
      setRoles(prev => prev.map(r => r.Id === id ? { ...r, Name: editName.trim() } : r));
      setEditingId(null);
    } catch {
      alert('Cập nhật thất bại');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5cc6ee]/10">
            <FiShield className="h-5 w-5 text-[#5cc6ee]" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Quản lý Role</h1>
            {!loading && (
              <p className="text-sm text-slate-500">
                Tổng <span className="font-semibold text-slate-700">{roles.length}</span> role
              </p>
            )}
          </div>
        </div>
        <Link
          href="/admin/roles/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5cc6ee] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3db8e4]"
        >
          <FiPlus className="h-4 w-4" />
          Tạo mới role
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-48 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100 ml-auto" />
              </div>
            ))}
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FiShield className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Chưa có role nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role Name</th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roles.map(role => (
                <tr key={role.Id} className="group transition-colors hover:bg-[#5cc6ee]/5">
                  <td className="px-6 py-3">
                    {editingId === role.Id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSave(role.Id);
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        autoFocus
                        className="w-full max-w-xs rounded-lg border border-[#5cc6ee] px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#5cc6ee]/20"
                      />
                    ) : (
                      <span className="font-medium text-slate-800">{role.Name}</span>
                    )}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-1.5">
                      {editingId === role.Id ? (
                        <>
                          <button
                            onClick={() => handleSave(role.Id)}
                            disabled={savingId === role.Id}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 cursor-pointer"
                          >
                            {savingId === role.Id ? <FiRefreshCw className="h-3.5 w-3.5 animate-spin" /> : <FiCheck className="h-3.5 w-3.5" />}
                            Lưu
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
                          >
                            <FiX className="h-3.5 w-3.5" />
                            Huỷ
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(role)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                          >
                            <FiEdit2 className="h-3.5 w-3.5" />
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(role.Id, role.Name)}
                            disabled={deletingId === role.Id}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                            {deletingId === role.Id ? '...' : 'Xóa'}
                          </button>
                        </>
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
