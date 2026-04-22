'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface SystemLog {
  SystemLogsID: number;
  NguoiTao: string;
  NgayTao: string;
  Nguon: string;
  HanhDong: string;
  DoiTuong: string;
  NoiDung: string;
}

interface User {
  UserName: string;
}

const SYSTEM_LOG_ACTIONS = [
  { value: '', label: '--All--' },
  { value: 'Them moi', label: 'Thêm mới' },
  { value: 'Chinh sua', label: 'Chỉnh sửa' },
  { value: 'Xoa', label: 'Xóa' },
];

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    username: '',
    hanhDong: '',
    nguon: '',
    doiTuong: '',
    noiDung: '',
  });

  // Initialize dates to first day of current month
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    setFilters(prev => ({
      ...prev,
      startDate: firstDay.toISOString().split('T')[0],
      endDate: lastDay.toISOString().split('T')[0],
    }));
  }, []);

  // Load users for dropdown
  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await apiClient.get('/users');
        if (Array.isArray(res.data)) {
          setUsers(res.data);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    }
    loadUsers();
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (filters.username) params.append('username', filters.username);
      if (filters.nguon) params.append('nguon', filters.nguon);
      if (filters.hanhDong) params.append('hanhDong', filters.hanhDong);
      if (filters.doiTuong) params.append('doiTuong', filters.doiTuong);
      if (filters.noiDung) params.append('noiDung', filters.noiDung);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const res = await apiClient.get(`/system-logs?${params.toString()}`);
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Hoạt động hệ thống</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Từ ngày */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Từ ngày</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            {/* Đến ngày */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Đến ngày</label>
              <input
                type="date"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Người tạo */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Người tạo</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.username}
                onChange={(e) => handleFilterChange('username', e.target.value)}
              >
                <option value="">--All--</option>
                {users.map((user) => (
                  <option key={user.UserName} value={user.UserName}>
                    {user.UserName}
                  </option>
                ))}
              </select>
            </div>

            {/* Hành động */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Hành động</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.hanhDong}
                onChange={(e) => handleFilterChange('hanhDong', e.target.value)}
              >
                {SYSTEM_LOG_ACTIONS.map((action) => (
                  <option key={action.value} value={action.value}>
                    {action.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nguồn */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Nguồn</label>
              <input
                type="text"
                placeholder="Nguồn"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.nguon}
                onChange={(e) => handleFilterChange('nguon', e.target.value)}
              />
            </div>

            {/* Đối tượng */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Đối tượng</label>
              <input
                type="text"
                placeholder="Đối tượng"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.doiTuong}
                onChange={(e) => handleFilterChange('doiTuong', e.target.value)}
              />
            </div>

            {/* Nội dung */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Nội dung</label>
              <input
                type="text"
                placeholder="Nội dung"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                value={filters.noiDung}
                onChange={(e) => handleFilterChange('noiDung', e.target.value)}
              />
            </div>

            {/* Search button */}
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                className="w-full rounded-lg bg-[#14264b] px-4 py-2 text-sm font-medium text-white hover:bg-cyan-400"
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data table */}
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 font-medium">Người tạo</th>
                <th className="px-4 py-3 font-medium">Thời gian</th>
                <th className="px-4 py-3 font-medium">Từ đâu</th>
                <th className="px-4 py-3 font-medium">Hành động</th>
                <th className="px-4 py-3 font-medium">Đối tượng</th>
                <th className="px-4 py-3 font-medium">Nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.SystemLogsID} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{log.NguoiTao}</td>
                    <td className="px-4 py-3">{formatDate(log.NgayTao)}</td>
                    <td className="px-4 py-3">{log.Nguon}</td>
                    <td className="px-4 py-3">{log.HanhDong}</td>
                    <td className="px-4 py-3">{log.DoiTuong}</td>
                    <td className="px-4 py-3" dangerouslySetInnerHTML={{ __html: log.NoiDung }}></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Trang {page} / {totalPages} - Tổng {total} bản ghi
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`rounded border px-3 py-1 text-sm ${
                    page === pageNum
                      ? 'bg-[#14264b] text-white'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
