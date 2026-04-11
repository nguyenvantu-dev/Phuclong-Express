'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FiMapPin,
  FiPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import apiClient from '@/lib/api-client';

interface DeliveryAddress {
  ID: number;
  UserName: string;
  DiaChi: string;
}

interface User {
  UserName: string;
}

export default function DeliveryAddressesPage() {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  // Filters
  const [usernameFilter, setUsernameFilter] = useState('');
  const [searchText, setSearchText] = useState('');
  const [appliedFilter, setAppliedFilter] = useState({ username: '', search: '' });

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Form state
  const [username, setUsername] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/users');
      if (Array.isArray(data)) setUsers(data);
      else if (data.users) setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    setError('');
    try {
      const params: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };
      if (appliedFilter.username) params.username = appliedFilter.username;
      if (appliedFilter.search) params.search = appliedFilter.search;

      const { data } = await apiClient.get('/delivery-addresses', { params });
      setAddresses(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setError('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleSearch = () => {
    setPage(1);
    setAppliedFilter({ username: usernameFilter, search: searchText });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    if (!username || !diaChi.trim()) {
      setFormError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setSaving(true);
    try {
      if (editingId !== null) {
        await apiClient.put(`/delivery-addresses/${editingId}`, { username, diaChi });
      } else {
        await apiClient.post('/delivery-addresses', { username, diaChi });
      }
      setUsername('');
      setDiaChi('');
      setEditingId(null);
      fetchAddresses();
    } catch (err) {
      console.error('Failed to save address:', err);
      setFormError('Có lỗi trong quá trình thực hiện');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address: DeliveryAddress) => {
    setEditingId(address.ID);
    setUsername(address.UserName);
    setDiaChi(address.DiaChi);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa địa chỉ này không?')) return;
    try {
      await apiClient.delete(`/delivery-addresses/${id}`);
      fetchAddresses();
    } catch (err) {
      console.error('Failed to delete address:', err);
      setError('Không thể xóa địa chỉ, vui lòng thử lại');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setUsername('');
    setDiaChi('');
    setFormError('');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#5cc6ee]/10">
          <FiMapPin className="h-5 w-5 text-[#5cc6ee]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Địa chỉ nhận hàng</h1>
          {!loading && (
            <p className="text-sm text-slate-500">
              Tổng <span className="font-semibold text-slate-700">{total}</span> địa chỉ
            </p>
          )}
        </div>
      </div>

      {/* Global error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="h-2 w-2 flex-shrink-0 rounded-full bg-red-500" />
          {error}
        </div>
      )}

      {/* Add / Edit form */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            {editingId !== null ? (
              <>
                <FiEdit2 className="h-4 w-4 text-[#5cc6ee]" />
                Chỉnh sửa địa chỉ
              </>
            ) : (
              <>
                <FiPlus className="h-4 w-4 text-[#5cc6ee]" />
                Thêm địa chỉ mới
              </>
            )}
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          {formError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />
              {formError}
            </div>
          )}
          <div className="flex flex-wrap items-end gap-4">
            {/* Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Chọn Username</label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={editingId !== null}
                className="h-9 min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-[#5cc6ee] focus:outline-none focus:ring-2 focus:ring-[#5cc6ee]/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">-- Chọn --</option>
                {users.map((u) => (
                  <option key={u.UserName} value={u.UserName}>{u.UserName}</option>
                ))}
              </select>
            </div>

            {/* Address */}
            <div className="flex flex-1 flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-600">Địa chỉ nhận hàng</label>
              <input
                type="text"
                value={diaChi}
                onChange={(e) => setDiaChi(e.target.value)}
                placeholder="Nhập địa chỉ nhận hàng..."
                className="h-9 min-w-[260px] rounded-lg border border-slate-200 px-3 text-sm text-slate-700 placeholder-slate-400 focus:border-[#5cc6ee] focus:outline-none focus:ring-2 focus:ring-[#5cc6ee]/20"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#5cc6ee] px-4 py-2 text-sm font-medium text-white hover:bg-[#3db8e4] disabled:opacity-60"
              >
                {saving ? (
                  <FiRefreshCw className="h-4 w-4 animate-spin" />
                ) : editingId !== null ? (
                  <FiCheck className="h-4 w-4" />
                ) : (
                  <FiPlus className="h-4 w-4" />
                )}
                {editingId !== null ? 'Cập nhật' : 'Thêm mới'}
              </button>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <FiX className="h-4 w-4" />
                  Hủy
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Filter bar */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-end gap-4 p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Lọc theo User</label>
            <select
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              className="h-9 min-w-[180px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-[#5cc6ee] focus:outline-none focus:ring-2 focus:ring-[#5cc6ee]/20"
            >
              <option value="">-- Tất cả --</option>
              {users.map((u) => (
                <option key={u.UserName} value={u.UserName}>{u.UserName}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-600">Từ khóa</label>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm theo địa chỉ..."
              className="h-9 min-w-[200px] rounded-lg border border-slate-200 px-3 text-sm text-slate-700 placeholder-slate-400 focus:border-[#5cc6ee] focus:outline-none focus:ring-2 focus:ring-[#5cc6ee]/20"
            />
          </div>

          <button
            onClick={handleSearch}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <FiSearch className="h-4 w-4" />
            Tìm kiếm
          </button>
        </div>
      </div>

      {/* Data table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-48 animate-pulse rounded bg-slate-100 ml-4" />
                <div className="ml-auto flex gap-2">
                  <div className="h-6 w-12 animate-pulse rounded bg-slate-100" />
                  <div className="h-6 w-12 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <FiMapPin className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Không tìm thấy địa chỉ nào</p>
            <p className="mt-1 text-xs text-slate-400">Thử thay đổi bộ lọc hoặc thêm địa chỉ mới</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 w-36">
                  User Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Địa chỉ nhận hàng
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 w-32">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {addresses.map((address) => (
                <tr key={address.ID} className="group transition-colors hover:bg-[#5cc6ee]/5">
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {address.UserName}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-700">{address.DiaChi}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(address)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(address.ID)}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Trang <span className="font-semibold text-slate-700">{page}</span> / {totalPages}
            {' '}· Tổng <span className="font-semibold text-slate-700">{total}</span> bản ghi
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Đầu
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4));
              const pageNum = start + i;
              if (pageNum > totalPages) return null;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`inline-flex cursor-pointer items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    page === pageNum
                      ? 'border-[#5cc6ee] bg-[#5cc6ee] text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="inline-flex cursor-pointer items-center rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cuối
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
