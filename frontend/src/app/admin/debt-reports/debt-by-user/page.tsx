'use client';

import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { getDebtByUser, exportDebtByUser, getDebtReportUsers } from '@/lib/api';

/**
 * Total Debt By User Report Page
 *
 * Converted from admin/BaoCao_TongCongNoTheoUser.aspx
 * Features:
 * - Filter panel: From date, To date, Username (dropdown)
 * - Data table: UserName, DauKy, PhanThu, PhanChi, CuoiKy
 * - Actions: Search, Export Excel
 */

// Initialize default dates (first day of month to last day of month)
const getDefaultDates = () => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return {
    fromDate: formatDate(firstDay),
    toDate: formatDate(lastDay),
  };
};

export default function DebtByUserPage() {
  // Filter state - matching BaoCao_TongCongNoTheoUser.aspx filters
  const [filters, setFilters] = useState<{
    fromDate: string;
    toDate: string;
    username: string;
  }>(() => ({
    ...getDefaultDates(),
    username: '',
  }));

  // Username dropdown state
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [usernameSearch, setUsernameSearch] = useState('');
  const [activeUsernameIndex, setActiveUsernameIndex] = useState(0);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Refs for date inputs
  const fromDateRef = useRef<HTMLInputElement>(null);
  const toDateRef = useRef<HTMLInputElement>(null);

  // Initialize flatpickr
  useEffect(() => {
    const defaultDates = getDefaultDates();

    const fpFrom = flatpickr(fromDateRef.current!, {
      dateFormat: 'd/m/Y',
      defaultDate: defaultDates.fromDate,
      onChange: (dates) => {
        if (dates[0]) {
          const d = dates[0];
          const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          setFilters(prev => ({ ...prev, fromDate: formatted }));
        }
      },
    });

    const fpTo = flatpickr(toDateRef.current!, {
      dateFormat: 'd/m/Y',
      defaultDate: defaultDates.toDate,
      onChange: (dates) => {
        if (dates[0]) {
          const d = dates[0];
          const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          setFilters(prev => ({ ...prev, toDate: formatted }));
        }
      },
    });

    return () => {
      fpFrom.destroy();
      fpTo.destroy();
    };
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Error message
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Fetch users for dropdown - matching LoadDataUser() in C#
  const { data: users } = useQuery({
    queryKey: ['debt-report-users'],
    queryFn: getDebtReportUsers,
  });

  // Filter users based on search
  const filteredUsers = users?.filter((user) =>
    user.UserName.toLowerCase().includes(usernameSearch.trim().toLowerCase())
  ).slice(0, 50) || [];

  const handleUsernameInputChange = (value: string) => {
    setUsernameSearch(value);
    setShowUserDropdown(true);
    setActiveUsernameIndex(0);

    if (!value) {
      setFilters(prev => ({ ...prev, username: '' }));
    }
  };

  const handleUsernameSelect = (value: string) => {
    setUsernameSearch(value);
    setFilters(prev => ({ ...prev, username: value }));
    setShowUserDropdown(false);
    setActiveUsernameIndex(0);
  };

  const handleUsernameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;

    event.preventDefault();
    if (event.key === 'ArrowDown') {
      setShowUserDropdown(true);
      if (filteredUsers.length > 0) {
        setActiveUsernameIndex((prev) => (prev + 1) % filteredUsers.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      setShowUserDropdown(true);
      if (filteredUsers.length > 0) {
        setActiveUsernameIndex((prev) => (prev - 1 + filteredUsers.length) % filteredUsers.length);
      }
      return;
    }

    const activeUsername = filteredUsers[activeUsernameIndex]?.UserName;
    if (activeUsername) {
      handleUsernameSelect(activeUsername);
    } else if (!usernameSearch.trim()) {
      handleUsernameSelect('');
    }
  };

  // Fetch debt by user data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['debt-by-user', filters],
    queryFn: () => getDebtByUser(filters.fromDate, filters.toDate, filters.username),
    enabled: !!filters.fromDate && !!filters.toDate,
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: () => exportDebtByUser(filters.fromDate, filters.toDate, filters.username),
    onSuccess: (result) => {
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

  // Handle search button click - matching tbTim_Click in C#
  const handleSearch = () => {
    if (!filters.fromDate || !filters.toDate) {
      setErrorMessage('Vui lòng nhập ngày bắt đầu và ngày kết thúc');
      return;
    }
    setErrorMessage('');
    refetch();
  };

  // Handle export button click - matching btExportToExcel_Click in C#
  const handleExport = () => {
    if (!filters.fromDate || !filters.toDate) {
      setErrorMessage('Vui lòng nhập ngày bắt đầu và ngày kết thúc');
      return;
    }
    exportMutation.mutate();
  };

  // Format currency - matching {0:n0} in C#
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-4">
      {/* Page title - matching h1 in aspx */}
      <h1 className="text-2xl font-bold text-gray-800">Báo cáo công nợ theo user</h1>

      {/* Error message - matching lbLoi in aspx */}
      {errorMessage && (
        <div className="rounded-lg bg-red-50 p-3 text-red-700">{errorMessage}</div>
      )}

      {/* Filter panel - matching table in aspx */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="grid gap-4 md:grid-cols-4">
          {/* From date - matching tbTuNgay in aspx */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Từ ngày
            </label>
            <input
              ref={fromDateRef}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              placeholder="dd/MM/yyyy"
            />
          </div>

          {/* To date - matching tbDenNgay in aspx */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Đến ngày
            </label>
            <input
              ref={toDateRef}
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              placeholder="dd/MM/yyyy"
            />
          </div>

          {/* Username - matching druser in aspx */}
          <div ref={userDropdownRef} className="relative">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              User Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập User Name"
              value={usernameSearch}
              onChange={(e) => handleUsernameInputChange(e.target.value)}
              onKeyDown={handleUsernameKeyDown}
              onFocus={() => {
                setActiveUsernameIndex(0);
                setShowUserDropdown(true);
              }}
              autoComplete="off"
            />
            {showUserDropdown && (
              <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-gray-300 bg-white py-1 text-sm shadow-lg">
                <button
                  type="button"
                  onClick={() => handleUsernameSelect('')}
                  className="block w-full px-3 py-2 text-left text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  --All--
                </button>
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.Id}
                    type="button"
                    onClick={() => handleUsernameSelect(user.UserName)}
                    onMouseEnter={() => setActiveUsernameIndex(index)}
                    className={`block w-full px-3 py-2 text-left font-medium hover:bg-blue-50 hover:text-blue-700 ${
                      index === activeUsernameIndex
                        ? 'bg-blue-50 text-blue-700'
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

          {/* Action buttons - matching tbTim, btExportToExcel in aspx */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
            >
              Tìm
            </button>
            <button
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {exportMutation.isPending ? 'Đang xuất...' : 'Export to excel'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Error loading data: {(error as Error).message}
        </div>
      )}

      {/* Data table - matching gvCongNo in aspx */}
      {!isLoading && !error && data && data.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    User
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Đầu kỳ
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Công nợ phát sinh
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Đã thanh toán
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">
                    Công nợ còn lại
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-2 text-gray-900">
                      {item.UserName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.DauKy)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.PhanThu)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.PhanChi)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(item.CuoiKy)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No data state */}
      {!isLoading && !error && (!data || data.length === 0) && (
        <div className="rounded-lg bg-gray-50 p-4 text-center text-gray-500">
          Không có dữ liệu
        </div>
      )}
    </div>
  );
}
