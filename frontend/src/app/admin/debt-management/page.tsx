'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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
  UpdateDebtParams,
} from '@/lib/api';
import { useCurrentUser } from '@/hooks/use-auth';
import {
  FiUpload,
  FiDownload,
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
import { downloadDataAsExcel } from '@/lib/excel-download';

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

  const getTodayFormatted = () => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

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

  // Form state for adding/editing debt inline on the page
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [newDebt, setNewDebt] = useState({
    username: '',
    noiDung: '',
    ngay: getTodayFormatted(),
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
  const [usernameInput, setUsernameInput] = useState('');
  const [showUsernameDropdown, setShowUsernameDropdown] = useState(false);
  const [activeUsernameIndex, setActiveUsernameIndex] = useState(0);
  const [filterUsernameInput, setFilterUsernameInput] = useState('');
  const [showFilterUsernameDropdown, setShowFilterUsernameDropdown] = useState(false);
  const [activeFilterUsernameIndex, setActiveFilterUsernameIndex] = useState(0);

  // Date input refs for flatpickr
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);
  const formDateRef = useRef<HTMLInputElement>(null);

  const resetDebtForm = () => {
    setNewDebt({
      username: '',
      noiDung: '',
      ngay: getTodayFormatted(),
      dr: 0,
      cr: 0,
      ghiChu: '',
      loHangId: undefined,
      loHangText: '',
      loaiPhatSinh: 2,
      bankAccount: '',
    });
    setUsernameInput('');
    setEditingId(null);
    setErrorMessage(null);
  };

  const getMutationErrorMessage = (error: unknown, fallback: string) => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      return response?.data?.message || fallback;
    }

    return fallback;
  };

  const handleFilterChange = useCallback((key: keyof typeof filters, value: string | number | null) => {
    // Convert "-1" to null for loaiPhatSinh filter
    if (key === 'loaiPhatSinh' && value === '-1') {
      setFilters((prev) => ({ ...prev, [key]: null, page: 1 }));
    } else {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    }
  }, []);

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
  }, [handleFilterChange]);

  // Initialize flatpickr for inline form date input
  useEffect(() => {
    if (formDateRef.current) {
      const fp = flatpickr(formDateRef.current, {
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
  }, [newDebt.ngay]);

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

  const filteredUsernames = useMemo(() => {
    const search = usernameInput.trim().toLowerCase();
    return (users || [])
      .filter((user) => !search || user.UserName.toLowerCase().includes(search))
      .slice(0, 50);
  }, [users, usernameInput]);

  const filteredFilterUsernames = useMemo(() => {
    const search = filterUsernameInput.trim().toLowerCase();
    return (users || [])
      .filter((user) => !search || user.UserName.toLowerCase().includes(search))
      .slice(0, 50);
  }, [users, filterUsernameInput]);

  const handleUsernameInputChange = (value: string) => {
    setUsernameInput(value);
    setShowUsernameDropdown(true);
    setActiveUsernameIndex(0);

    if (!value || value !== newDebt.username) {
      setNewDebt((prev) => ({ ...prev, username: '', loHangId: undefined, loHangText: '' }));
    }
  };

  const handleUsernameSelect = (value: string) => {
    setUsernameInput(value);
    setNewDebt((prev) => ({ ...prev, username: value, loHangId: undefined, loHangText: '' }));
    setShowUsernameDropdown(false);
    setActiveUsernameIndex(0);
    setErrorMessage(null);
  };

  const handleUsernameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;

    event.preventDefault();
    if (event.key === 'ArrowDown') {
      setShowUsernameDropdown(true);
      if (filteredUsernames.length > 0) {
        setActiveUsernameIndex((prev) => (prev + 1) % filteredUsernames.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      setShowUsernameDropdown(true);
      if (filteredUsernames.length > 0) {
        setActiveUsernameIndex((prev) => (prev - 1 + filteredUsernames.length) % filteredUsernames.length);
      }
      return;
    }

    const activeUsername = filteredUsernames[activeUsernameIndex]?.UserName;
    if (activeUsername) {
      handleUsernameSelect(activeUsername);
    } else if (!usernameInput.trim()) {
      handleUsernameSelect('');
    }
  };

  const handleFilterUsernameInputChange = (value: string) => {
    setFilterUsernameInput(value);
    setShowFilterUsernameDropdown(true);
    setActiveFilterUsernameIndex(0);

    if (!value) {
      handleFilterChange('username', '');
    }
  };

  const handleFilterUsernameSelect = (value: string) => {
    setFilterUsernameInput(value);
    handleFilterChange('username', value);
    setShowFilterUsernameDropdown(false);
    setActiveFilterUsernameIndex(0);
  };

  const handleFilterUsernameKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;

    event.preventDefault();
    if (event.key === 'ArrowDown') {
      setShowFilterUsernameDropdown(true);
      if (filteredFilterUsernames.length > 0) {
        setActiveFilterUsernameIndex((prev) => (prev + 1) % filteredFilterUsernames.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      setShowFilterUsernameDropdown(true);
      if (filteredFilterUsernames.length > 0) {
        setActiveFilterUsernameIndex((prev) => (prev - 1 + filteredFilterUsernames.length) % filteredFilterUsernames.length);
      }
      return;
    }

    const activeUsername = filteredFilterUsernames[activeFilterUsernameIndex]?.UserName;
    if (activeUsername) {
      handleFilterUsernameSelect(activeUsername);
    } else if (!filterUsernameInput.trim()) {
      handleFilterUsernameSelect('');
    }
  };

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
        resetDebtForm();
      } else {
        setErrorMessage(result.message || 'Thêm mới thất bại');
      }
    },
    onError: (error: unknown) => {
      setErrorMessage(getMutationErrorMessage(error, 'Thêm mới thất bại'));
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDebtParams }) => updateDebt(id, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['debt-management'] });
        resetDebtForm();
      } else {
        setErrorMessage(result.message || 'Cập nhật thất bại');
      }
    },
    onError: (error: unknown) => {
      setErrorMessage(getMutationErrorMessage(error, 'Cập nhật thất bại'));
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

  const loaiPhatSinhMap: Record<number, string> = {
    1: 'Phí mua hàng',
    2: 'Phát sinh khác',
    3: 'Phí ship từ nước ngoài về',
    4: 'Phí ship trong nước',
    5: 'Đặt cọc',
    6: 'Phí ship về VN lô hàng',
    7: 'Thuế hải quan lô hàng',
    8: 'Cân Kg',
  };

  const getLoaiPhatSinhLabel = (item: DebtManagementItem): string =>
    item.LoaiPhatSinhText || (item.LoaiPhatSinh != null ? loaiPhatSinhMap[item.LoaiPhatSinh] || '' : '');

  const buildExcelRows = (items: DebtManagementItem[]) => {
    const headers = [
      'CongNo_ID', 'User Name', 'Lô hàng', 'Nội Dung', 'Ngày phát sinh',
      'Phát sinh nợ', 'Phát sinh có', 'Ghi Chú', 'Loại phát sinh',
      'Trạng thái', 'Người tạo', 'Người cập nhật cuối', 'Ngày cập nhật cuối',
    ];
    const rows = items.map((item) => [
      item.CongNo_ID,
      item.UserName || '',
      item.TenLoHang || '',
      item.NoiDung || '',
      item.NgayGhiNo ? new Date(item.NgayGhiNo).toLocaleDateString('vi-VN') : '',
      item.DR ?? 0,
      item.CR ?? 0,
      item.GhiChu || '',
      getLoaiPhatSinhLabel(item),
      item.Status ? 'Approved' : 'Pending',
      item.NguoiTao || '',
      item.NguoiCapNhatCuoi || '',
      item.NgayCapNhatCuoi ? new Date(item.NgayCapNhatCuoi).toLocaleDateString('vi-VN') : '',
    ]);
    return [headers, ...rows];
  };

  const handleExportCurrentPage = () => {
    if (!data?.data?.length) return;
    downloadDataAsExcel(
      buildExcelRows(data.data),
      `QuanLyCongNo_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`,
    );
  };

  const exportAllMutation = useMutation({
    mutationFn: () => getDebtManagementList({ ...filters, page: 1, limit: 10000 }),
    onSuccess: (result) => {
      downloadDataAsExcel(
        buildExcelRows(result.data),
        `QuanLyCongNo_BoLoc_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`,
      );
    },
    onError: (err: Error) => {
      setErrorMessage('Export thất bại: ' + err.message);
    },
  });

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
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
          <button
            onClick={handleExportCurrentPage}
            disabled={!data?.data?.length}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors duration-200 font-medium shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất ra excel 1 trang</span>
          </button>
          <button
            onClick={() => exportAllMutation.mutate()}
            disabled={exportAllMutation.isPending || !data?.data?.length}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 text-white rounded-xl hover:bg-cyan-400 transition-colors duration-200 font-medium shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="w-4 h-4" />
            <span className="hidden sm:inline">
              {exportAllMutation.isPending ? 'Đang xuất...' : 'Xuất ra excel theo bộ lọc'}
            </span>
          </button>
          <Link
            href="/admin/debt-management/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14264b] text-white rounded-xl hover:bg-cyan-400 transition-colors duration-200 font-medium shadow-sm cursor-pointer"
          >
            <FiUpload className="w-4 h-4" />
            <span className="hidden sm:inline">Import Excel</span>
          </Link>
        </div>
      </div>

      {/* Inline Add/Edit Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-visible">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {editingId ? 'Sửa công nợ' : 'Thêm công nợ mới'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {editingId ? 'Cập nhật thông tin công nợ' : 'Nhập thông tin công nợ'}
              </p>
            </div>
          </div>

          {errorMessage && (
            <div className="mx-4 mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600">{errorMessage}</p>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newDebt.username || usernameInput !== newDebt.username) {
                setErrorMessage('Vui lòng chọn User từ danh sách');
                setShowUsernameDropdown(true);
                return;
              }

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
            className="p-4 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <FiUser className="w-3.5 h-3.5 text-[#14264b]" />
                  User <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => handleUsernameInputChange(e.target.value)}
                    onKeyDown={handleUsernameKeyDown}
                    onFocus={() => setShowUsernameDropdown(true)}
                    onBlur={() => setTimeout(() => setShowUsernameDropdown(false), 100)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer appearance-none"
                    placeholder="Nhập User"
                    autoComplete="off"
                    required
                  />
                  <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  {showUsernameDropdown && (
                    <div
                      onMouseDown={(e) => e.preventDefault()}
                      className="absolute left-0 top-full z-[100] mt-1 max-h-56 w-56 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-xs shadow-lg"
                    >
                      {filteredUsernames.map((user, index) => (
                        <button
                          key={user.Id}
                          type="button"
                          className={`w-full px-3 py-1.5 text-left hover:bg-[#14264b]/5 ${index === activeUsernameIndex ? 'bg-[#14264b]/10 font-medium text-[#14264b]' : 'text-slate-700'}`}
                          onClick={() => handleUsernameSelect(user.UserName)}
                        >
                          {user.UserName}
                        </button>
                      ))}
                      {filteredUsernames.length === 0 && (
                        <div className="px-3 py-1.5 text-slate-400">Không có user phù hợp</div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1 lg:col-span-2">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <FiFileText className="w-3.5 h-3.5 text-[#14264b]" />
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDebt.noiDung}
                  onChange={(e) => setNewDebt({ ...newDebt, noiDung: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                  required
                  placeholder="Nhập nội dung công nợ"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700 flex items-center gap-1">
                  <FiCalendar className="w-3.5 h-3.5 text-[#14264b]" />
                  Ngày <span className="text-red-500">*</span>
                </label>
                <input
                  ref={formDateRef}
                  type="text"
                  value={newDebt.ngay}
                  onChange={(e) => setNewDebt({ ...newDebt, ngay: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                  placeholder="dd/mm/yyyy"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Loại phát sinh</label>
                <div className="relative">
                  <select
                    value={newDebt.loaiPhatSinh}
                    onChange={(e) => setNewDebt({ ...newDebt, loaiPhatSinh: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer appearance-none"
                  >
                    <option value={2}>Phí mua hàng và phát sinh khác</option>
                    <option value={8}>Cân Kg</option>
                  </select>
                  <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Tài khoản</label>
                <div className="relative">
                  <select
                    value={newDebt.bankAccount}
                    onChange={(e) => setNewDebt({ ...newDebt, bankAccount: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer appearance-none"
                  >
                    <option value="">--Chọn tài khoản--</option>
                    {bankAccounts?.map((bank) => (
                      <option key={bank.ID} value={bank.TenTaiKhoanNganHang || ''}>
                        {bank.TenTaiKhoanNganHang}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {newDebt.username && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">Lô hàng</label>
                  <div className="relative">
                    <select
                      value={newDebt.loHangId || ''}
                      onChange={(e) => {
                        const selected = batches?.find((b: BatchItem) => b.LoHang_ID === Number(e.target.value));
                        setNewDebt({ ...newDebt, loHangId: e.target.value ? Number(e.target.value) : undefined, loHangText: selected?.TenLoHang || '' });
                      }}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white cursor-pointer appearance-none"
                    >
                      <option value="">--Chọn lô hàng--</option>
                      {batches?.map((batch: BatchItem) => (
                        <option key={batch.LoHang_ID} value={batch.LoHang_ID}>
                          {batch.TenLoHang}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Tiền Nợ (DR)</label>
                <input
                  type="number"
                  value={newDebt.dr}
                  onChange={(e) => setNewDebt({ ...newDebt, dr: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Tiền Có (CR)</label>
                <input
                  type="number"
                  value={newDebt.cr}
                  onChange={(e) => setNewDebt({ ...newDebt, cr: Number(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1 md:col-span-2 xl:col-span-3">
                <label className="text-xs font-medium text-slate-700">Ghi chú</label>
                <textarea
                  value={newDebt.ghiChu}
                  onChange={(e) => setNewDebt({ ...newDebt, ghiChu: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all resize-none"
                  rows={2}
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={resetDebtForm}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#14264b] to-cyan-400 rounded-lg hover:from-[#4bb3dd] hover:to-cyan-300 transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && <FiLoader className="w-3.5 h-3.5 animate-spin" />}
                {editingId ? 'Cập nhật' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
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
              <div className="relative space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FiUser className="w-3.5 h-3.5" />
                  User
                </label>
                <input
                  type="text"
                  value={filterUsernameInput}
                  onChange={(e) => handleFilterUsernameInputChange(e.target.value)}
                  onKeyDown={handleFilterUsernameKeyDown}
                  onFocus={() => setShowFilterUsernameDropdown(true)}
                  onBlur={() => setTimeout(() => setShowFilterUsernameDropdown(false), 100)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 transition-all bg-white"
                  placeholder="Nhập User"
                  autoComplete="off"
                />
                {showFilterUsernameDropdown && (
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="absolute left-0 top-full z-[100] mt-1 max-h-64 w-56 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
                  >
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 text-left text-slate-500 hover:bg-slate-50"
                      onClick={() => handleFilterUsernameSelect('')}
                    >
                      --Tất cả User--
                    </button>
                    {filteredFilterUsernames.map((user, index) => (
                      <button
                        key={user.Id}
                        type="button"
                        className={`w-full px-3 py-1.5 text-left hover:bg-[#14264b]/5 ${index === activeFilterUsernameIndex ? 'bg-[#14264b]/10 font-medium text-[#14264b]' : 'text-slate-700'}`}
                        onClick={() => handleFilterUsernameSelect(user.UserName)}
                      >
                        {user.UserName}
                      </button>
                    ))}
                    {filteredFilterUsernames.length === 0 && (
                      <div className="px-3 py-1.5 text-slate-400">Không có user phù hợp</div>
                    )}
                  </div>
                )}
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
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Loại phát sinh</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Người cập nhật</th>
                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Ngày cập nhật</th>
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
                      <td className="px-4 py-3.5 text-sm text-slate-600">
                        {getLoaiPhatSinhLabel(item) || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500">
                        {item.NguoiCapNhatCuoi || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                        {item.NgayCapNhatCuoi ? new Date(item.NgayCapNhatCuoi).toLocaleDateString('vi-VN') : '-'}
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
                                ngay: item.NgayGhiNo ? (() => { const d = new Date(item.NgayGhiNo); return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`; })() : getTodayFormatted(),
                                dr: item.DR || 0,
                                cr: item.CR || 0,
                                ghiChu: item.GhiChu || '',
                                loHangId: item.LoHangID,
                                loHangText: '',
                                loaiPhatSinh: 2,
                                bankAccount: '',
                              });
                              setUsernameInput(item.UserName || '');
                              setErrorMessage(null);
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
    </div>
  );
}
