'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
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
  BatchItem,
} from '@/lib/api';
import { useCurrentUser } from '@/hooks/use-auth';
import {
  FiPlus,
  FiUpload,
  FiSearch,
  FiFilter,
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiCalendar,
  FiUser,
  FiCreditCard,
  FiFileText,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
} from 'react-icons/fi';

/**
 * Debt Management Page
 *
 * Converted from admin/ManageCongNo.aspx
 * Features:
 * - Filter panel: username, status, date range, bank account
 * - Data table with debt records
 * - Add/Edit/Delete/Approve operations
 * - Pagination
 *
 * UI/UX: Professional enterprise admin dashboard with cyan theme
 */
export default function DebtManagementPage() {
  const queryClient = useQueryClient();
  const currentUser = useCurrentUser();

  // Filter state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 200,
    username: '',
    status: -1,
    loaiPhatSinh: '' as string | null,
    bankAccount: '',
    fromDate: '',
    toDate: '',
  });

  // Modal state for adding new debt
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newDebt, setNewDebt] = useState({
    username: '',
    noiDung: '',
    ngay: '',
    dr: 0,
    cr: 0,
    ghiChu: '',
    loHangId: undefined as number | undefined,
    loHangText: '' as string,
    loaiPhatSinh: 2,
    bankAccount: '' as string,
  });

  // UI State
  const [showFilters, setShowFilters] = useState(true);
  const [newDebtExpanded, setNewDebtExpanded] = useState({
    username: false,
    batch: false,
  });

  // Date input refs for flatpickr
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);
  const modalDateRef = useRef<HTMLInputElement>(null);

  // Initialize flatpickr for filter date inputs
  useEffect(() => {
    if (fromDateRef.current && toDateRef.current) {
      const fpFrom = flatpickr(fromDateRef.current, {
        dateFormat: 'd/m/Y',
        onChange: (dates) => {
          if (dates[0]) {
            const d = dates[0];
            const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            handleFilterChange('fromDate', formatted);
          }
        },
      });
      const fpTo = flatpickr(toDateRef.current, {
        dateFormat: 'd/m/Y',
        onChange: (dates) => {
          if (dates[0]) {
            const d = dates[0];
            const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            handleFilterChange('toDate', formatted);
          }
        },
      });
      return () => {
        fpFrom.destroy();
        fpTo.destroy();
      };
    }
  }, []);

  // Initialize flatpickr for modal date input
  useEffect(() => {
    if (showAddModal && modalDateRef.current) {
      const fp = flatpickr(modalDateRef.current, {
        dateFormat: 'd/m/Y',
        defaultDate: newDebt.ngay ? newDebt.ngay : undefined,
        onChange: (dates) => {
          if (dates[0]) {
            const d = dates[0];
            const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
            setNewDebt((prev) => ({ ...prev, ngay: formatted }));
          }
        },
      });
      return () => {
        fp.destroy();
      };
    }
  }, [showAddModal, newDebt.username]);

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
          loHangText: '',
          loaiPhatSinh: 2,
          bankAccount: '',
        });
        setErrorMessage(null);
      } else {
        setErrorMessage(result.message || 'Thêm mới thất bại');
      }
    },
    onError: (error: any) => {
      setErrorMessage(error?.response?.data?.message || 'Thêm mới thất bại');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateDebt(id, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['debt-management'] });
        setEditingId(null);
        setShowAddModal(false);
      } else {
        setErrorMessage(result.message || 'Cập nhật thất bại');
      }
    },
    onError: (error: any) => {
      setErrorMessage(error?.response?.data?.message || 'Cập nhật thất bại');
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
    // Convert "-1" to null for loaiPhatSinh filter
    if (key === 'loaiPhatSinh' && value === '-1') {
      setFilters((prev) => ({ ...prev, [key]: null, page: 1 }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newDebt);
  };

  const totalPages = Math.ceil((data?.total || 0) / filters.limit);

  // Calculate summary stats
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý công nợ</h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và theo dõi công nợ khách hàng</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/debt-management/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 font-medium shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <FiUpload className="w-4 h-4" />
            <span className="hidden sm:inline">Import Excel</span>
          </Link>
          <button
            onClick={() => {
              setShowAddModal(true);
              setEditingId(null);
              setErrorMessage(null);
              setNewDebt({
                username: '',
                noiDung: '',
                ngay: '',
                dr: 0,
                cr: 0,
                ghiChu: '',
                loHangId: undefined,
                loHangText: '',
                loaiPhatSinh: 2,
                bankAccount: '',
              });
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#14264b] to-cyan-400 text-white rounded-xl hover:from-[#4bb3dd] hover:to-cyan-300 transition-all duration-200 font-medium shadow-lg shadow-cyan-500/25 cursor-pointer"
          >
            <FiPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Thêm mới</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Filter Header */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#14264b]/10 rounded-lg">
              <FiFilter className="w-4 h-4 text-[#14264b]" />
            </div>
            <span className="font-semibold text-slate-700">Bộ lọc</span>
            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {Object.values(filters).filter(v => v !== '' && v !== -1 && v !== 0).length} active
            </span>
          </div>
          {showFilters ? (
            <FiChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <FiChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {/* Filter Content */}
        {showFilters && (
          <div className="px-4 pb-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FiUser className="w-3.5 h-3.5" />
                  User
                </label>
                <select
                  value={filters.username}
                  onChange={(e) => handleFilterChange('username', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer"
                >
                  <option value="">--Tất cả User--</option>
                  {users?.map((user) => (
                    <option key={user.Id} value={user.UserName}>
                      {user.UserName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Trạng thái</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer"
                >
                  <option value={-1}>Tất cả</option>
                  <option value={1}>Approved</option>
                  <option value={0}>Pending</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCreditCard className="w-3.5 h-3.5" />
                  Ngân hàng
                </label>
                <select
                  value={filters.bankAccount}
                  onChange={(e) => handleFilterChange('bankAccount', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer"
                >
                  <option value="">--Tất cả tài khoản--</option>
                  {bankAccounts?.map((bank) => (
                    <option key={bank.ID} value={bank.GhiChu || ''}>
                      {bank.TenTaiKhoanNganHang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5" />
                  Từ ngày
                </label>
                <input
                  ref={fromDateRef}
                  type="text"
                  value={filters.fromDate}
                  onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5" />
                  Đến ngày
                </label>
                <input
                  ref={toDateRef}
                  type="text"
                  value={filters.toDate}
                  onChange={(e) => handleFilterChange('toDate', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                  placeholder="dd/mm/yyyy"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Loại phát sinh</label>
                <select
                  value={filters.loaiPhatSinh ?? ''}
                  onChange={(e) => handleFilterChange('loaiPhatSinh', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer"
                >
                  <option value="-1">Tất cả loại phát sinh</option>
                  <option value="1,2,3,4,5,6,7">Phí mua hàng và phát sinh khác</option>
                  <option value="8">Cân Kg</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <FiLoader className="w-8 h-8 text-[#14264b] animate-spin" />
            <span className="ml-3 text-slate-500">Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-red-50 rounded-full mb-4">
              <FiX className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-medium">Lỗi tải dữ liệu</p>
            <p className="text-sm text-slate-500 mt-1">{String(error)}</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nội dung</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Nợ (DR)</th>
                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Có (CR)</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ghi chú</th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data?.data?.map((item: DebtManagementItem) => (
                    <tr key={item.CongNo_ID} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-sm text-slate-600 font-mono">{item.CongNo_ID}</td>
                      <td className="px-4 py-3.5 text-sm font-medium text-slate-800">{item.UserName}</td>
                      <td className="px-4 py-3.5 text-sm text-slate-600 max-w-[200px] truncate" title={item.NoiDung}>
                        {item.NoiDung}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-600">
                        {item.NgayGhiNo ? new Date(item.NgayGhiNo).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-right font-mono text-orange-600">
                        {item.DR ? item.DR.toLocaleString('vi-VN') : '0'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-right font-mono text-[#14264b]">
                        {item.CR ? item.CR.toLocaleString('vi-VN') : '0'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 max-w-[250px] truncate" title={item.GhiChu}>
                        {item.GhiChu || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {item.Status ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Approved
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!item.Status && (
                            <button
                              onClick={() => approveMutation.mutate(item.CongNo_ID)}
                              disabled={approveMutation.isPending}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Duyệt"
                            >
                              <FiCheck className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingId(item.CongNo_ID);
                              setNewDebt({
                                username: item.UserName || '',
                                noiDung: item.NoiDung || '',
                                ngay: item.NgayGhiNo ? new Date(item.NgayGhiNo).toISOString().split('T')[0] : '',
                                dr: item.DR || 0,
                                cr: item.CR || 0,
                                ghiChu: item.GhiChu || '',
                                loHangId: item.LoHangID,
                                loHangText: '',
                                loaiPhatSinh: 2,
                                bankAccount: '',
                              });
                              setShowAddModal(true);
                            }}
                            className="p-1.5 text-[#14264b] hover:bg-[#14264b]/5 rounded-lg transition-colors cursor-pointer"
                            title="Sửa"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Bạn có chắc chắn muốn xóa?')) {
                                deleteMutation.mutate(item.CongNo_ID);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Xóa"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {(!data?.data || data.data.length === 0) && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-slate-100 rounded-full mb-4">
                  <FiFileText className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">Không có dữ liệu</p>
                <p className="text-sm text-slate-400 mt-1">Thử thay đổi bộ lọc để xem kết quả khác</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Trang <span className="font-medium text-slate-700">{filters.page}</span> / {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(filters.page - 1)}
                    disabled={filters.page <= 1}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => handlePageChange(filters.page + 1)}
                    disabled={filters.page >= totalPages}
                    className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {editingId ? 'Sửa công nợ' : 'Thêm công nợ mới'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {editingId ? 'Cập nhật thông tin công nợ' : 'Nhập thông tin công nợ'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  setErrorMessage(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            )}

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* User Selection */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <FiUser className="w-4 h-4 text-[#14264b]" />
                  User <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newDebt.username}
                    onChange={(e) => setNewDebt({ ...newDebt, username: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer appearance-none"
                    required
                  >
                    <option value="">--Chọn User--</option>
                    {users?.map((user) => (
                      <option key={user.Id} value={user.UserName}>
                        {user.UserName}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Content */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <FiFileText className="w-4 h-4 text-[#14264b]" />
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDebt.noiDung}
                  onChange={(e) => setNewDebt({ ...newDebt, noiDung: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                  required
                  placeholder="Nhập nội dung công nợ"
                />
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                  <FiCalendar className="w-4 h-4 text-[#14264b]" />
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  ref={modalDateRef}
                  type="text"
                  value={newDebt.ngay}
                  onChange={(e) => setNewDebt({ ...newDebt, ngay: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>

              {/* Loại phát sinh */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Loại phát sinh</label>
                <div className="relative">
                  <select
                    value={newDebt.loaiPhatSinh}
                    onChange={(e) => setNewDebt({ ...newDebt, loaiPhatSinh: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer appearance-none"
                  >
                    <option value={2}>Phí mua hàng và phát sinh khác</option>
                    <option value={8}>Cân Kg</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Bank Account */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Tài khoản</label>
                <div className="relative">
                  <select
                    value={newDebt.bankAccount}
                    onChange={(e) => setNewDebt({ ...newDebt, bankAccount: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer appearance-none"
                  >
                    <option value="">--Chọn tài khoản--</option>
                    {bankAccounts?.map((bank) => (
                      <option key={bank.ID} value={bank.TenTaiKhoanNganHang || ''}>
                        {bank.TenTaiKhoanNganHang}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* DR/CR Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tiền Nợ (DR)</label>
                  <input
                    type="number"
                    value={newDebt.dr}
                    onChange={(e) => setNewDebt({ ...newDebt, dr: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Tiền Có (CR)</label>
                  <input
                    type="number"
                    value={newDebt.cr}
                    onChange={(e) => setNewDebt({ ...newDebt, cr: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Batch Selection - Only show when user selected */}
              {newDebt.username && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Lô hàng</label>
                  <div className="relative">
                    <select
                      value={newDebt.loHangId || ''}
                      onChange={(e) => {
                        const selected = batches?.find((b: BatchItem) => b.LoHang_ID === Number(e.target.value));
                        setNewDebt({ ...newDebt, loHangId: e.target.value ? Number(e.target.value) : undefined, loHangText: selected?.TenLoHang || '' });
                      }}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer appearance-none"
                    >
                      <option value="">--Chọn lô hàng--</option>
                      {batches?.map((batch: BatchItem) => (
                        <option key={batch.LoHang_ID} value={batch.LoHang_ID}>
                          {batch.TenLoHang}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Ghi chú</label>
                <textarea
                  value={newDebt.ghiChu}
                  onChange={(e) => setNewDebt({ ...newDebt, ghiChu: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all resize-none"
                  rows={3}
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                }}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={() => {
                  if (editingId) {
                    updateMutation.mutate({
                      id: editingId,
                      data: {
                        username: newDebt.username,
                        noiDung: newDebt.noiDung,
                        dr: newDebt.dr,
                        cr: newDebt.cr,
                        ghiChu: newDebt.ghiChu,
                        updatedBy: currentUser?.username || 'admin',
                      },
                    });
                  } else {
                    createMutation.mutate(newDebt);
                  }
                }}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#14264b] to-cyan-400 rounded-xl hover:from-[#4bb3dd] hover:to-cyan-300 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && <FiLoader className="w-4 h-4 animate-spin" />}
                {editingId ? 'Cập nhật' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
