'use client';

import { useState, useEffect, useCallback, useRef, type KeyboardEvent } from 'react';
import { useParams } from 'next/navigation';
import {
  FiFileText,
  FiSearch,
  FiUnlock,
  FiLock,
  FiAlertCircle,
} from 'react-icons/fi';
import apiClient from '@/lib/api-client';

interface PeriodDetail {
  ChotKyID: number;
  KyID: number;
  Nam: number;
  Thang: number;
  UserName: string;
  DauKy: number;
  PhatSinhThuDR: number;
  PhatSinhChiCR: number;
  PhatSinhCanDoi: number;
  CuoiKy: number;
  NguoiTao: string;
  NgayTao: string;
  NguoiCapNhatCuoi: string;
  NgayCapNhatCuoi: string;
  TamMoKy: boolean;
}

interface Period {
  KyID: number;
  Nam: number;
  Thang: number;
}

interface User {
  UserName: string;
}

export default function PeriodDetailPage() {
  const params = useParams();
  const kyId = typeof params?.id === 'string' ? params.id : undefined;

  const [period, setPeriod] = useState<Period | null>(null);
  const [details, setDetails] = useState<PeriodDetail[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [usernameFilter, setUsernameFilter] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState('-1');
  const [kyIdFilter, setKyIdFilter] = useState(kyId || '-1');

  // Searchable username select
  const [usernameInput, setUsernameInput] = useState('');
  const [showUsernameDropdown, setShowUsernameDropdown] = useState(false);
  const [activeUsernameIndex, setActiveUsernameIndex] = useState(0);
  const usernameDropdownRef = useRef<HTMLDivElement>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(200);

  const fetchUsers = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/users');
      // GET /users returns a raw User[] array (not wrapped in { users })
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  const fetchPeriod = useCallback(async () => {
    if (!kyId) return;
    try {
      const { data } = await apiClient.get(`/periods/${kyId}`);
      if (data.data) {
        setPeriod(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch period:', err);
    }
  }, [kyId]);

  const fetchDetails = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (kyIdFilter && kyIdFilter !== '-1') params.append('kyId', kyIdFilter);
      if (usernameFilter) params.append('username', usernameFilter);
      if (trangThaiFilter && trangThaiFilter !== '-1') params.append('trangThai', trangThaiFilter);

      const { data } = await apiClient.get('/periods/details/list', { params: Object.fromEntries(params) });
      setDetails(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch details:', err);
      setError('Failed to load details');
    } finally {
      setLoading(false);
    }
  }, [page, limit, kyIdFilter, usernameFilter, trangThaiFilter]);

  useEffect(() => {
    fetchUsers();
    fetchPeriod();
  }, [fetchUsers, fetchPeriod]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSearch = () => {
    setPage(1);
    fetchDetails();
  };

  // Close username dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (usernameDropdownRef.current && !usernameDropdownRef.current.contains(event.target as Node)) {
        setShowUsernameDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUsernameInputChange = (value: string) => {
    setUsernameInput(value);
    setShowUsernameDropdown(true);
    setActiveUsernameIndex(0);
    // Clearing the input resets the filter back to all users
    if (!value) {
      setUsernameFilter('');
      setPage(1);
    }
  };

  const handleUsernameSelect = (value: string) => {
    setUsernameInput(value);
    setUsernameFilter(value);
    setPage(1);
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

  const filteredUsers = users
    .filter((user) => user.UserName.toLowerCase().includes(usernameInput.trim().toLowerCase()))
    .slice(0, 50);

  const handleTempOpen = async (chotKyId: number) => {
    if (!confirm('Bạn có chắc muốn tạm mở kỳ cho user này không?')) return;

    try {
      const { data } = await apiClient.post(`/periods/details/${chotKyId}/temp-open`);

      if (data.code === 0) {
        fetchDetails();
      } else if (data.code === 1) {
        alert('Không được mở kỳ quá xa hiện tại');
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to temp open period:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleTempClose = async (chotKyId: number) => {
    if (!confirm('Bạn có chắc muốn đóng kỳ cho user này không?')) return;

    try {
      const { data } = await apiClient.post(`/periods/details/${chotKyId}/temp-close`);

      if (data.code === 0) {
        fetchDetails();
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to temp close period:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    return num.toLocaleString('vi-VN');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const selectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-colors focus:border-[#3db8e4] focus:outline-none focus:ring-2 focus:ring-[#3db8e4]/30';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14264b]/10">
          <FiFileText className="h-5 w-5 text-[#14264b]" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Danh sách chi tiết chốt kỳ</h1>
          {period && (
            <p className="text-sm text-slate-500">
              Kỳ <span className="font-semibold text-slate-700">{period.Thang}/{period.Nam}</span>
            </p>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filter card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
          <div ref={usernameDropdownRef} className="relative">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              User Name
            </label>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => handleUsernameInputChange(e.target.value)}
              onKeyDown={handleUsernameKeyDown}
              onFocus={() => {
                setActiveUsernameIndex(0);
                setShowUsernameDropdown(true);
              }}
              placeholder="Nhập User Name"
              autoComplete="off"
              className={selectClass}
            />
            {showUsernameDropdown && (
              <div className="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg">
                <button
                  type="button"
                  onClick={() => handleUsernameSelect('')}
                  className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-[#14264b]/5 hover:text-[#14264b]"
                >
                  -- Tất cả --
                </button>
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.UserName}
                    type="button"
                    onClick={() => handleUsernameSelect(user.UserName)}
                    onMouseEnter={() => setActiveUsernameIndex(index)}
                    className={`block w-full px-3 py-2 text-left font-medium hover:bg-[#14264b]/5 hover:text-[#14264b] ${
                      index === activeUsernameIndex
                        ? 'bg-[#14264b]/5 text-[#14264b]'
                        : 'text-slate-900'
                    }`}
                  >
                    {user.UserName}
                  </button>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="px-3 py-2 text-slate-500">Không có user phù hợp</div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Trạng thái
            </label>
            <select
              value={trangThaiFilter}
              onChange={(e) => setTrangThaiFilter(e.target.value)}
              className={selectClass}
            >
              <option value="-1">-- Tất cả --</option>
              <option value="0">Đã chốt kỳ</option>
              <option value="1">Chưa chốt kỳ</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Kỳ
            </label>
            <select
              value={kyIdFilter}
              onChange={(e) => setKyIdFilter(e.target.value)}
              className={selectClass}
            >
              <option value="-1">-- Tất cả --</option>
              {period && (
                <option value={period.KyID}>
                  {period.Thang}/{period.Nam}
                </option>
              )}
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#14264b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3db8e4] cursor-pointer"
          >
            <FiSearch className="h-4 w-4" />
            Tìm
          </button>
        </div>
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className="h-4 w-16 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-12 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />
                <div className="ml-auto h-7 w-20 animate-pulse rounded-lg bg-slate-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 w-16">Năm</th>
                  <th className="px-4 py-3 w-16">Tháng</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3 text-right">Đầu kỳ</th>
                  <th className="px-4 py-3 text-right">Phát sinh thu DR</th>
                  <th className="px-4 py-3 text-right">Phát sinh chi CR</th>
                  <th className="px-4 py-3 text-right">Cân đối</th>
                  <th className="px-4 py-3 text-right">Cuối kỳ</th>
                  <th className="px-4 py-3">Người tạo</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Người cập nhật cuối</th>
                  <th className="px-4 py-3">Ngày cập nhật cuối</th>
                  <th className="px-4 py-3">Tình trạng</th>
                  <th className="px-4 py-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {details.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-4 py-12 text-center text-sm text-slate-400">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  details.map((detail) => (
                    <tr key={detail.ChotKyID} className="transition-colors hover:bg-[#14264b]/5">
                      <td className="px-4 py-3 font-medium text-slate-800">{detail.Nam}</td>
                      <td className="px-4 py-3 text-slate-600">{detail.Thang}</td>
                      <td className="px-4 py-3">
                        <a
                          href={`/admin/debt-reports?u=${detail.UserName}&kid=${detail.KyID}`}
                          target="_blank"
                          className="font-medium text-[#3db8e4] hover:underline cursor-pointer"
                        >
                          {detail.UserName}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatNumber(detail.DauKy)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatNumber(detail.PhatSinhThuDR)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatNumber(detail.PhatSinhChiCR)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatNumber(detail.PhatSinhCanDoi)}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium text-slate-800">{formatNumber(detail.CuoiKy)}</td>
                      <td className="px-4 py-3 text-slate-600">{detail.NguoiTao}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(detail.NgayTao)}</td>
                      <td className="px-4 py-3 text-slate-600">{detail.NguoiCapNhatCuoi}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(detail.NgayCapNhatCuoi)}</td>
                      <td className="px-4 py-3">
                        {detail.TamMoKy ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <FiUnlock className="h-3 w-3" />
                            Đang tạm mở kỳ
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                            <FiLock className="h-3 w-3" />
                            Kỳ đang đóng
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {detail.TamMoKy ? (
                          <button
                            onClick={() => handleTempClose(detail.ChotKyID)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 hover:text-amber-700 cursor-pointer"
                          >
                            <FiLock className="h-3.5 w-3.5" />
                            Đóng kỳ
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTempOpen(detail.ChotKyID)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
                          >
                            <FiUnlock className="h-3.5 w-3.5" />
                            Mở kỳ
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
