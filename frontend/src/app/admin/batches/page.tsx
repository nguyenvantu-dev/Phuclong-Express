'use client';

import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import {
  KPICard,
  FilterBar,
  FilterField,
  DataTable,
  EmptyState,
  TableLoadingSkeleton,
} from '@/app/components/admin';

interface LoHang {
  LoHangID: number;
  UserName: string;
  NgayLoHang: string;
  TenLoHang: string;
  TienLoHangA: number | null;
  TienPhiHaiQuanB: number | null;
  TongTienLoHang: number | null;
}

interface User {
  UserName: string;
}

interface BatchesResponse {
  data: LoHang[];
  total: number;
  page: number;
  pageSize: number;
}

function getDefaultDates() {
  const today = new Date();
  const from = new Date(today);
  from.setMonth(from.getMonth() - 1);
  return {
    tuNgay: from.toISOString().slice(0, 10),
    denNgay: today.toISOString().slice(0, 10),
  };
}

const formatCurrency = (val: number | null) => {
  if (val == null) return '-';
  return val.toLocaleString('vi-VN');
};

const getBatches = async (params: Record<string, string | number>): Promise<BatchesResponse> => {
  const response = await apiClient.get<BatchesResponse>('/batches', { params });
  return response.data;
};

const getUsers = async (): Promise<User[]> => {
  const response = await apiClient.get<User[]>('/users');
  return response.data;
};

export default function BatchesPage() {
  const defaults = getDefaultDates();

  const [committed, setCommitted] = useState({
    username: '',
    tuNgay: defaults.tuNgay,
    denNgay: defaults.denNgay,
    page: 1,
    pageSize: 200,
  });

  const [draft, setDraft] = useState({
    username: '',
    tuNgay: defaults.tuNgay,
    denNgay: defaults.denNgay,
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [showUsernameDropdown, setShowUsernameDropdown] = useState(false);
  const [activeUsernameIndex, setActiveUsernameIndex] = useState(0);
  const usernameDropdownRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['batches', committed],
    queryFn: () => getBatches(committed),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users-list'],
    queryFn: getUsers,
    staleTime: 5 * 60 * 1000,
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

  const filteredUsers = users
    .slice()
    .sort((a, b) => a.UserName.localeCompare(b.UserName))
    .filter((user) => user.UserName.toLowerCase().includes(usernameInput.trim().toLowerCase()))
    .slice(0, 50);

  const handleUsernameInputChange = (value: string) => {
    setUsernameInput(value);
    setShowUsernameDropdown(true);
    setActiveUsernameIndex(0);

    if (!value) {
      setDraft((prev) => ({ ...prev, username: '' }));
    }
  };

  const handleUsernameSelect = (value: string) => {
    setUsernameInput(value);
    setDraft((prev) => ({ ...prev, username: value }));
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

  const handleSearch = () => {
    setCommitted({ ...draft, page: 1, pageSize: 200 });
  };

  const handleReset = () => {
    setUsernameInput('');
    setShowUsernameDropdown(false);
    setActiveUsernameIndex(0);
    setDraft({
      username: '',
      tuNgay: defaults.tuNgay,
      denNgay: defaults.denNgay,
    });
    setCommitted({
      username: '',
      tuNgay: defaults.tuNgay,
      denNgay: defaults.denNgay,
      page: 1,
      pageSize: 200,
    });
  };

  const handlePageChange = (newPage: number) => {
    setCommitted((prev) => ({ ...prev, page: newPage }));
  };

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 0;
  const totalValue = data?.data?.reduce((sum, item) => sum + (item.TongTienLoHang || 0), 0) || 0;

  const columns = [
    {
      key: 'UserName',
      label: 'Username',
      width: '150px',
      align: 'left' as const,
    },
    {
      key: 'TenLoHang',
      label: 'Mã lô ngày',
      width: '140px',
      align: 'left' as const,
    },
    {
      key: 'TienLoHangA',
      label: 'Tiền Lô Hàng (A)',
      width: '150px',
      align: 'right' as const,
      render: (value: number | null) => <span className="text-cyan-700 font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: 'TienPhiHaiQuanB',
      label: 'Tiền phí hải quan (B)',
      width: '150px',
      align: 'right' as const,
      render: (value: number | null) => <span className="text-blue-700 font-medium">{formatCurrency(value)}</span>,
    },
    {
      key: 'TongTienLoHang',
      label: 'Tổng tiền (A + B)',
      width: '150px',
      align: 'right' as const,
      render: (value: number | null) => <span className="text-green-700 font-bold">{formatCurrency(value)}</span>,
    },
    {
      key: 'LoHangID',
      label: 'Hành động',
      width: '120px',
      align: 'center' as const,
      render: (_: unknown, row: LoHang) => (
        <Link
          href={`/admin/batches/${row.LoHangID}`}
          className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
        >
          Chi tiết
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-cyan-900 mb-2">Danh sách lô hàng</h1>
          <p className="text-gray-600">Quản lý và theo dõi các lô hàng nhập khẩu</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <KPICard
            label="Tổng lô hàng (30 ngày)"
            value={data?.total || 0}
            unit="lô"
          />
          <KPICard
            label="Tổng giá trị"
            value={(totalValue / 1_000_000).toFixed(1)}
            unit="triệu VND"
          />
          <KPICard
            label="Trung bình/lô"
            value={data?.data?.length ? (totalValue / data.data.length / 1_000_000).toFixed(1) : 0}
            unit="triệu VND"
          />
        </div>

        {/* Filter Bar */}
        <FilterBar onReset={handleReset}>
          <FilterField label="Từ ngày">
            <input
              type="date"
              value={draft.tuNgay}
              onChange={(e) => setDraft((p) => ({ ...p, tuNgay: e.target.value }))}
              className="w-full px-3 py-2 border border-cyan-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </FilterField>
          <FilterField label="Đến ngày">
            <input
              type="date"
              value={draft.denNgay}
              onChange={(e) => setDraft((p) => ({ ...p, denNgay: e.target.value }))}
              className="w-full px-3 py-2 border border-cyan-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </FilterField>
          <FilterField label="Username">
            <div ref={usernameDropdownRef} className="relative">
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => handleUsernameInputChange(e.target.value)}
                onKeyDown={handleUsernameKeyDown}
                onFocus={() => {
                  setActiveUsernameIndex(0);
                  setShowUsernameDropdown(true);
                }}
                placeholder="Nhập username"
                autoComplete="off"
                className="w-full px-3 py-2 border border-cyan-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {showUsernameDropdown && (
                <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-cyan-200 bg-white py-1 text-sm shadow-lg">
                  <button
                    type="button"
                    onClick={() => handleUsernameSelect('')}
                    className="block w-full px-3 py-2 text-left text-gray-700 hover:bg-cyan-50 hover:text-cyan-700"
                  >
                    --Tất cả--
                  </button>
                  {filteredUsers.map((user, index) => (
                    <button
                      key={user.UserName}
                      type="button"
                      onClick={() => handleUsernameSelect(user.UserName)}
                      onMouseEnter={() => setActiveUsernameIndex(index)}
                      className={`block w-full px-3 py-2 text-left font-medium hover:bg-cyan-50 hover:text-cyan-700 ${
                        index === activeUsernameIndex
                          ? 'bg-cyan-50 text-cyan-700'
                          : 'text-gray-900'
                      }`}
                    >
                      {user.UserName}
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="px-3 py-2 text-gray-500">Không có username phù hợp</div>
                  )}
                </div>
              )}
            </div>
          </FilterField>
          <button
            onClick={handleSearch}
            className="w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
          >
            Tìm kiếm
          </button>
        </FilterBar>

        {/* Data Table */}
        {isLoading ? (
          <TableLoadingSkeleton />
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Có lỗi khi tải dữ liệu. Vui lòng thử lại.
          </div>
        ) : data?.data?.length === 0 ? (
          <EmptyState
            title="Không có lô hàng"
            description="Không tìm thấy lô hàng nào khớp với bộ lọc của bạn"
            action={{
              label: 'Thêm lô hàng mới',
              onClick: () => (window.location.href = '/admin/batches/new'),
            }}
          />
        ) : (
          <>
            <DataTable columns={columns} data={data?.data || []} rowKey="LoHangID" />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{(committed.page - 1) * committed.pageSize + 1}</span> đến{' '}
                  <span className="font-semibold">
                    {Math.min(committed.page * committed.pageSize, data?.total || 0)}
                  </span>{' '}
                  trong <span className="font-semibold">{data?.total}</span> kết quả
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(committed.page - 1)}
                    disabled={committed.page === 1}
                    className="px-4 py-2 border border-cyan-300 rounded-lg text-cyan-700 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Trước
                  </button>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            committed.page === pageNum
                              ? 'bg-cyan-600 text-white font-bold'
                              : 'border border-cyan-300 text-cyan-700 hover:bg-cyan-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(committed.page + 1)}
                    disabled={committed.page >= totalPages}
                    className="px-4 py-2 border border-cyan-300 rounded-lg text-cyan-700 hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Add New Button */}
        <div className="mt-8 flex justify-end">
          <Link
            href="/admin/batches/new"
            className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 transition-colors font-semibold shadow-lg"
          >
            + Thêm lô hàng mới
          </Link>
        </div>
      </div>
    </div>
  );
}
