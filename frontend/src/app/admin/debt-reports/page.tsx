'use client';

import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDebtReports,
  getPeriods,
  getDebtReportUsers,
  updateDebtRecord,
  exportDebtReport,
  DebtReportQueryParams,
  DebtReportItem,
  PeriodItem,
} from '@/lib/api';

/**
 * Debt Reports Page
 *
 * Converted from admin/BaoCao_ChiTietCongNo.aspx
 * Features:
 * - Filter panel: Username, Từ kỳ, Đến kỳ
 * - Summary: Đầu kỳ, Tổng phát sinh, Đã thanh toán, Cuối kỳ
 * - Data table with columns: Mã QL, Nội dung, Ngày phát sinh, DR, CR, Lũy kế, Ghi chú
 * - Inline edit: NoiDung, DR, CR, GhiChu
 * - Actions: Search, Export Excel 1 page, Export Excel all with filter
 * - Pagination
 */

/** Default page size - matches pageSize = 100 in C# */
const DEFAULT_PAGE_SIZE = 100;

export default function DebtReportsPage() {
  const queryClient = useQueryClient();

  // Filter state - matching BaoCao_ChiTietCongNo.aspx filters
  const [filters, setFilters] = useState<DebtReportQueryParams>({
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [showUsernameDropdown, setShowUsernameDropdown] = useState(false);
  const [activeUsernameIndex, setActiveUsernameIndex] = useState(0);
  const usernameDropdownRef = useRef<HTMLDivElement>(null);
  const isAllPeriodsFilter = filters.fromKyId === -1;

  // Edit state for inline editing
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    noiDung: '',
    dr: 0,
    cr: 0,
    ghiChu: '',
  });

  // Error message
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch periods for dropdowns
  const { data: closedPeriods } = useQuery({
    queryKey: ['periods', true],
    queryFn: () => getPeriods(true),
  });

  const { data: allPeriods } = useQuery({
    queryKey: ['periods', false],
    queryFn: () => getPeriods(false),
  });

  // Fetch users for dropdown
  const { data: users } = useQuery({
    queryKey: ['debt-report-users'],
    queryFn: getDebtReportUsers,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (usernameDropdownRef.current && !usernameDropdownRef.current.contains(event.target as Node)) {
        setShowUsernameDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch debt reports
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: ['debt-reports', filters],
    queryFn: () => getDebtReports(filters),
    enabled: !!filters.username && (isAllPeriodsFilter || (!!filters.fromKyId && !!filters.toKyId)),
  });

  // Update debt record mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof editForm }) =>
      updateDebtRecord(id, data),
    onSuccess: (result) => {
      if (result.success) {
        setEditingId(null);
        queryClient.invalidateQueries({ queryKey: ['debt-reports'] });
      } else {
        setErrorMessage(result.message || 'Cập nhật thất bại');
      }
    },
    onError: (err: Error) => {
      setErrorMessage(err.message);
    },
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () =>
      exportDebtReport(
        filters.username!,
        filters.fromKyId!,
        filters.toKyId ?? 0,
      ),
    onSuccess: (result) => {
      // Create and download CSV file
      const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = result.filename;
      link.click();
    },
    onError: (err: Error) => {
      setErrorMessage('Export thất bại: ' + err.message);
    },
  });

  // Handle filter changes
  const handleFilterChange = (key: keyof DebtReportQueryParams, value: string | number) => {
    setFilters((prev) => {
      if (key === 'username') {
        const username = typeof value === 'string' ? value : String(value);

        return {
          ...prev,
          username,
          fromKyId: username ? -1 : undefined,
          toKyId: username ? undefined : prev.toKyId,
          page: 1,
        };
      }

      if (key === 'fromKyId') {
        const fromKyId = typeof value === 'number' ? value : Number(value);

        return {
          ...prev,
          fromKyId: fromKyId || undefined,
          toKyId: fromKyId === -1 ? undefined : prev.toKyId,
          page: 1,
        };
      }

      return { ...prev, [key]: value || undefined, page: 1 };
    });
    setErrorMessage('');
  };

  const handleUsernameInputChange = (value: string) => {
    setUsernameInput(value);
    setShowUsernameDropdown(true);
    setActiveUsernameIndex(0);

    if (!value) {
      handleFilterChange('username', '');
    }
  };

  const handleUsernameSelect = (value: string) => {
    setUsernameInput(value);
    handleFilterChange('username', value);
    setShowUsernameDropdown(false);
    setActiveUsernameIndex(0);
  };

  const handleUsernameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;

    event.preventDefault();
    if (event.key === 'ArrowDown') {
      setShowUsernameDropdown(true);
      if (filteredUsers.length > 0) {
        setActiveUsernameIndex((prev) => (prev + 1) % filteredUsers.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      setShowUsernameDropdown(true);
      if (filteredUsers.length > 0) {
        setActiveUsernameIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      }
      return;
    }

    const activeUsername = filteredUsers[activeUsernameIndex]?.UserName;
    if (activeUsername) {
      handleUsernameSelect(activeUsername);
    } else if (!usernameInput.trim()) {
      handleUsernameSelect('');
    }
  };

  // Handle search button click
  const handleSearch = () => {
    if (!filters.username || (!isAllPeriodsFilter && (!filters.fromKyId || !filters.toKyId))) {
      setErrorMessage(
        isAllPeriodsFilter
          ? 'Vui lòng chọn Username'
          : 'Vui lòng chọn Username, Từ kỳ và Đến kỳ',
      );
      return;
    }
    setErrorMessage('');
    refetch();
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle export 1 page (current view)
  const handleExportCurrentPage = () => {
    if (!data?.data) return;

    // Build CSV from current page data
    const lines: string[] = [];
    lines.push(`Đầu kỳ,${data.summary.dauKy.toString().replace(/,/g, '')}`);
    lines.push(`Tổng phát sinh,${data.summary.tongPhatSinh.toString().replace(/,/g, '')}`);
    lines.push(`Đã thanh toán,${data.summary.tongThanhToan.toString().replace(/,/g, '')}`);
    lines.push(`Cuối kỳ,${data.summary.cuoiKy.toString().replace(/,/g, '')}`);
    lines.push('');

    const headers = ['CongNo_ID', 'NoiDung', 'NgayGhiNo', 'DR', 'CR', 'LuyKe', 'GhiChu'];
    lines.push(headers.join(','));

    for (const row of data.data) {
      const values = [
        row.CongNo_ID || '',
        (row.NoiDung || '').replace(/,/g, ';').replace(/\n/g, ' ').replace(/\r/g, ' '),
        row.NgayGhiNo ? new Date(row.NgayGhiNo).toLocaleDateString('vi-VN') : '',
        row.DR || '0',
        row.CR || '0',
        row.LuyKe || '0',
        (row.GhiChu || '').replace(/,/g, ';').replace(/\n/g, ' ').replace(/\r/g, ' '),
      ];
      lines.push(values.join(','));
    }

    const csv = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ChiTietCongNo_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;
    link.click();
  };

  // Handle export all with filter
  const handleExportAll = () => {
    if (!filters.username || (!isAllPeriodsFilter && (!filters.fromKyId || !filters.toKyId))) {
      setErrorMessage(
        isAllPeriodsFilter
          ? 'Vui lòng chọn Username'
          : 'Vui lòng chọn Username, Từ kỳ và Đến kỳ',
      );
      return;
    }
    exportMutation.mutate();
  };

  // Start editing
  const handleEdit = (item: DebtReportItem) => {
    setEditingId(item.CongNo_ID);
    setEditForm({
      noiDung: item.NoiDung || '',
      dr: item.DR || 0,
      cr: item.CR || 0,
      ghiChu: item.GhiChu || '',
    });
    setErrorMessage('');
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ noiDung: '', dr: 0, cr: 0, ghiChu: '' });
  };

  // Save editing
  const handleSaveEdit = () => {
    if (!editForm.noiDung.trim()) {
      setErrorMessage('Bạn phải nhập nội dung công nợ');
      return;
    }
    if (editForm.dr === 0 && editForm.cr === 0) {
      setErrorMessage('Phải nhập ít nhất một giá trị DR hoặc CR');
      return;
    }
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: editForm });
    }
  };

  // Format currency - matching {0:n0} in C#
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format date - matching {0:dd/MM/yyyy} in C#
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;
  const filteredUsers = (users || [])
    .filter((user) => user.UserName.toLowerCase().includes(usernameInput.trim().toLowerCase()))
    .slice(0, 50);

  return (
    <div className="space-y-4">
      {/* Page title - matching h1 in aspx */}
      <h1 className="text-2xl font-bold text-gray-800">Báo cáo chi tiết công nợ</h1>

      {/* Error message */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">{errorMessage}</div>
      )}

      {/* Filter panel - matching table in aspx */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 md:grid-cols-4">
          {/* Username */}
          <div ref={usernameDropdownRef} className="relative">
            <label htmlFor="debt-report-username-filter" className="mb-1 block text-sm font-medium text-gray-700">
              User Name
            </label>
            <input
              id="debt-report-username-filter"
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#14264b] focus:outline-none"
              value={usernameInput}
              onChange={(e) => handleUsernameInputChange(e.target.value)}
              onKeyDown={handleUsernameKeyDown}
              onFocus={() => {
                setActiveUsernameIndex(0);
                setShowUsernameDropdown(true);
              }}
              placeholder="Nhập User Name"
              autoComplete="off"
            />
            {showUsernameDropdown && (
              <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 text-sm shadow-lg">
                <button
                  type="button"
                  onClick={() => handleUsernameSelect('')}
                  className="block w-full px-3 py-2 text-left text-gray-700 hover:bg-[#14264b]/5 hover:text-[#14264b]"
                >
                  -- Chọn User --
                </button>
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.Id}
                    type="button"
                    onClick={() => handleUsernameSelect(user.UserName)}
                    onMouseEnter={() => setActiveUsernameIndex(index)}
                    className={`block w-full px-3 py-2 text-left font-medium hover:bg-[#14264b]/5 hover:text-[#14264b] ${
                      index === activeUsernameIndex
                        ? 'bg-[#14264b]/5 text-[#14264b]'
                        : 'text-gray-900'
                    }`}
                  >
                    {user.UserName}
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="px-3 py-2 text-gray-500">Không có user phù hợp</div>
                )}
              </div>
            )}
          </div>

          {/* Từ kỳ - only closed periods */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Từ kỳ</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#14264b] focus:outline-none"
              value={filters.fromKyId ?? ''}
              onChange={(e) =>
                handleFilterChange('fromKyId', e.target.value ? Number(e.target.value) : 0)
              }
            >
              <option value="">-- Không xác định --</option>
              <option value={-1}>-- Tất cả kỳ --</option>
              {closedPeriods?.map((period: PeriodItem) => (
                <option key={period.KyID} value={period.KyID}>
                  {period.TenKy}
                </option>
              ))}
            </select>
          </div>

          {/* Đến kỳ - all periods */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Đến kỳ</label>
            <select
              disabled={isAllPeriodsFilter}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-[#14264b] focus:outline-none"
              value={filters.toKyId ?? ''}
              onChange={(e) =>
                handleFilterChange('toKyId', e.target.value ? Number(e.target.value) : 0)
              }
            >
              <option value="">-- Chọn kỳ --</option>
              {allPeriods?.map((period: PeriodItem) => (
                <option key={period.KyID} value={period.KyID}>
                  {period.TenKy}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
            >
              Tìm
            </button>
            <button
              onClick={handleExportCurrentPage}
              disabled={!data?.data?.length}
              className="rounded-lg bg-[#14264b] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a6e] disabled:opacity-50"
            >
              Xuất ra excel 1 trang
            </button>
            <button
              onClick={handleExportAll}
              disabled={exportMutation.isPending}
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 disabled:opacity-50"
            >
              {exportMutation.isPending ? 'Đang xuất...' : 'Xuất ra excel theo bộ lọc'}
            </button>
          </div>
        </div>
      </div>

      {/* Summary - matching labels in aspx */}
      {data?.summary && (
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Đầu kỳ</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(data.summary.dauKy)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng phát sinh</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(data.summary.tongPhatSinh)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(data.summary.tongThanhToan)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cuối kỳ</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(data.summary.cuoiKy)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#14264b] border-t-transparent"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Error loading debt reports: {(error as Error).message}
        </div>
      )}

      {/* Data table - matching gvCongNo in aspx */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-20 px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Edit
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Mã QL
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Nội Dung
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ngày phát sinh
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Công nợ phát sinh (DR)
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Đã thanh toán (CR)
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Công nợ còn lại
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ghi Chú
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.data.map((item) => {
                  const isEditing = editingId === item.CongNo_ID;

                  return (
                    <tr key={item.CongNo_ID} className="hover:bg-gray-50">
                      <td className="px-2 py-2">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveEdit}
                              disabled={updateMutation.isPending}
                              className="text-green-600 hover:text-green-800"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-800"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-[#14264b] hover:text-[#14264b]"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                        {item.CongNo_ID}
                      </td>
                      {/* NoiDung */}
                      <td className="px-2 py-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.noiDung}
                            onChange={(e) =>
                              setEditForm({ ...editForm, noiDung: e.target.value })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{item.NoiDung || '-'}</span>
                        )}
                      </td>
                      {/* NgayGhiNo */}
                      <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                        {formatDate(item.NgayGhiNo)}
                      </td>
                      {/* DR */}
                      <td className="px-2 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.dr}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                dr: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-right"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.DR)}
                          </span>
                        )}
                      </td>
                      {/* CR */}
                      <td className="px-2 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editForm.cr}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                cr: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-24 rounded border border-gray-300 px-2 py-1 text-sm text-right"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">
                            {formatCurrency(item.CR)}
                          </span>
                        )}
                      </td>
                      {/* LuyKe */}
                      <td className="whitespace-nowrap px-2 py-2 text-right font-medium text-gray-900">
                        {formatCurrency(item.LuyKe)}
                      </td>
                      {/* GhiChu */}
                      <td className="max-w-[200px] px-2 py-2">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.ghiChu}
                            onChange={(e) =>
                              setEditForm({ ...editForm, ghiChu: e.target.value })
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
                          />
                        ) : (
                          <span className="truncate text-gray-900">
                            {item.GhiChu || '-'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination - matching ucPhanTrang in aspx */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(data.page - 1) * data.limit + 1} to{' '}
            {Math.min(data.page * data.limit, data.total)} of {data.total} records
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Fetching indicator */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white">
          Updating...
        </div>
      )}
    </div>
  );
}
