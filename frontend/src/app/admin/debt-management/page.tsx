'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  getDebtManagementList,
  getDebtReportUsers,
  getBankAccounts,
  getBatchesByUsername,
  createDebt,
  updateDebt,
  deleteDebt,
  approveDebt,
  DebtManagementItem,
  BankAccount,
  BatchItem,
} from '@/lib/api';

/**
 * Debt Management Page
 *
 * Converted from admin/ManageCongNo.aspx
 * Features:
 * - Filter panel: username, status, date range, bank account
 * - Data table with debt records
 * - Add/Edit/Delete/Approve operations
 * - Pagination
 */
export default function DebtManagementPage() {
  const queryClient = useQueryClient();

  // Filter state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 200,
    username: '',
    status: -1,
    loaiPhatSinh: '',
    bankAccount: '',
    fromDate: '',
    toDate: '',
  });

  // Modal state for adding new debt
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newDebt, setNewDebt] = useState({
    username: '',
    noiDung: '',
    ngay: '',
    dr: 0,
    cr: 0,
    ghiChu: '',
    loHangId: undefined as number | undefined,
    loaiPhatSinh: 2,
  });

  // Fetch debt list
  const { data, isLoading, error } = useQuery({
    queryKey: ['debt-management', filters],
    queryFn: () => getDebtManagementList(filters),
  });

  // Fetch users for dropdown
  const { data: users } = useQuery({
    queryKey: ['debt-report-users'],
    queryFn: getDebtReportUsers,
  });

  // Fetch bank accounts
  const { data: bankAccounts } = useQuery({
    queryKey: ['bank-accounts'],
    queryFn: getBankAccounts,
  });

  // Fetch batches when username changes
  const { data: batches } = useQuery({
    queryKey: ['batches', newDebt.username],
    queryFn: () => getBatchesByUsername(newDebt.username),
    enabled: !!newDebt.username,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDebt,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['debt-management'] });
        setShowAddModal(false);
        setNewDebt({
          username: '',
          noiDung: '',
          ngay: '',
          dr: 0,
          cr: 0,
          ghiChu: '',
          loHangId: undefined,
          loaiPhatSinh: 2,
        });
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateDebt(id, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['debt-management'] });
        setEditingId(null);
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debt-management'] });
    },
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: approveDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debt-management'] });
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newDebt);
  };

  const totalPages = Math.ceil((data?.total || 0) / filters.limit);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý công nợ</h1>
        <div className="space-x-2">
          <Link
            href="/admin/debt-management/import"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Import Excel
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thêm mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">User</label>
            <select
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">--Tất cả User--</option>
              {users?.map((user) => (
                <option key={user.Id} value={user.UserName}>
                  {user.UserName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              <option value={-1}>Tất cả</option>
              <option value={1}>Hoạt động</option>
              <option value={0}>Khóa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ngân hàng</label>
            <select
              value={filters.bankAccount}
              onChange={(e) => handleFilterChange('bankAccount', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">--Tất cả tài khoản--</option>
              {bankAccounts?.map((bank) => (
                <option key={bank.ID} value={bank.TenNganHang}>
                  {bank.TenNganHang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Từ ngày</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Đến ngày</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loại phát sinh</label>
            <select
              value={filters.loaiPhatSinh}
              onChange={(e) => handleFilterChange('loaiPhatSinh', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Tất cả</option>
              <option value="2">Khác</option>
              <option value="8">Kg</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {String(error)}</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nội dung</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Nợ (DR)</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Có (CR)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data?.map((item) => (
                  <tr key={item.CongNo_ID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{item.CongNo_ID}</td>
                    <td className="px-4 py-3 text-sm">{item.UserName}</td>
                    <td className="px-4 py-3 text-sm">{item.NoiDung}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.NgayGhiNo ? new Date(item.NgayGhiNo).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{item.DR?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm text-right">{item.CR?.toLocaleString() || 0}</td>
                    <td className="px-4 py-3 text-sm">{item.GhiChu}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          item.Status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.Status ? 'Hoạt động' : 'Khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-1">
                      {!item.Status && (
                        <button
                          onClick={() => approveMutation.mutate(item.CongNo_ID)}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Duyệt
                        </button>
                      )}
                      <button
                        onClick={() => setEditingId(item.CongNo_ID)}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc chắn muốn xóa?')) {
                            deleteMutation.mutate(item.CongNo_ID);
                          }
                        }}
                        className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 py-4">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Thêm công nợ mới</h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">User *</label>
                  <select
                    value={newDebt.username}
                    onChange={(e) => setNewDebt({ ...newDebt, username: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="">--Chọn User--</option>
                    {users?.map((user) => (
                      <option key={user.Id} value={user.UserName}>
                        {user.UserName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nội dung *</label>
                  <input
                    type="text"
                    value={newDebt.noiDung}
                    onChange={(e) => setNewDebt({ ...newDebt, noiDung: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ngày *</label>
                  <input
                    type="date"
                    value={newDebt.ngay}
                    onChange={(e) => setNewDebt({ ...newDebt, ngay: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tiền Nợ (DR)</label>
                    <input
                      type="number"
                      value={newDebt.dr}
                      onChange={(e) => setNewDebt({ ...newDebt, dr: Number(e.target.value) })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tiền Có (CR)</label>
                    <input
                      type="number"
                      value={newDebt.cr}
                      onChange={(e) => setNewDebt({ ...newDebt, cr: Number(e.target.value) })}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                </div>
                {newDebt.username && batches && batches.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Lô hàng</label>
                    <select
                      value={newDebt.loHangId || ''}
                      onChange={(e) =>
                        setNewDebt({ ...newDebt, loHangId: e.target.value ? Number(e.target.value) : undefined })
                      }
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">--Chọn lô hàng--</option>
                      {batches.map((batch) => (
                        <option key={batch.LoHang_ID} value={batch.LoHang_ID}>
                          {batch.TenLoHang}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú</label>
                  <textarea
                    value={newDebt.ghiChu}
                    onChange={(e) => setNewDebt({ ...newDebt, ghiChu: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
