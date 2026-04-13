'use client';

import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiTrash2, FiUser, FiChevronDown, FiRefreshCw, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useAuth } from '@/hooks/use-auth-context';
import apiClient from '@/lib/api-client';

interface User {
  UserName: string;
}

type MessageType = 'success' | 'error' | null;

export default function ClearUserDataPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<MessageType>(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    async function loadUsers() {
      try {
        const { data } = await apiClient.get('/users');
        if (data) setUsers(data);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setLoadingUsers(false);
      }
    }
    loadUsers();
  }, []);

  const handleClear = async () => {
    if (!selectedUsername) {
      setMessage('Vui lòng chọn user');
      setMessageType('error');
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa toàn bộ dữ liệu của "${selectedUsername}"?\n\nHành động này KHÔNG THỂ hoàn tác!`)) {
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType(null);

    try {
      const { data } = await apiClient.post('/users/clear-data', {
        username: selectedUsername,
        nguoiTao: user?.username || '',
      });

      if (data.success) {
        setMessage(`Đã xóa toàn bộ dữ liệu của "${selectedUsername}" thành công`);
        setMessageType('success');
        setSelectedUsername('');
      } else {
        setMessage(data.message || 'Có lỗi trong quá trình thao tác');
        setMessageType('error');
      }
    } catch {
      setMessage('Có lỗi trong quá trình thao tác');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
          <FiTrash2 className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">Clear Dữ Liệu User</h1>
          <p className="text-sm text-slate-500">Xóa toàn bộ dữ liệu của một tài khoản</p>
        </div>
      </div>

      {/* Danger warning banner */}
      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <FiAlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-semibold mb-0.5">Cảnh báo — Thao tác không thể hoàn tác</p>
          <p className="text-amber-700">Toàn bộ đơn hàng và dữ liệu liên quan của user sẽ bị xóa vĩnh viễn. Kiểm tra kỹ trước khi thực hiện.</p>
        </div>
      </div>

      {/* Action card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-700">Chọn User cần xóa dữ liệu</h2>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Select user */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <FiUser className="h-3.5 w-3.5 text-slate-400" />
              Username
            </label>
            <div className="relative">
              <select
                value={selectedUsername}
                onChange={(e) => {
                  setSelectedUsername(e.target.value);
                  setMessage('');
                  setMessageType(null);
                }}
                disabled={loadingUsers}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm text-slate-700 shadow-sm transition-all focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
              >
                <option value="">
                  {loadingUsers ? 'Đang tải...' : '-- Chọn User --'}
                </option>
                {users.map((u) => (
                  <option key={u.UserName} value={u.UserName}>
                    {u.UserName}
                  </option>
                ))}
              </select>
              <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handleClear}
            disabled={loading || loadingUsers || !selectedUsername}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <FiRefreshCw className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <FiTrash2 className="h-4 w-4" />
                Xóa dữ liệu
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result message */}
      {message && messageType && (
        <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-all ${
          messageType === 'success'
            ? 'border-green-200 bg-green-50 text-green-800'
            : 'border-red-200 bg-red-50 text-red-800'
        }`}>
          {messageType === 'success' ? (
            <FiCheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-green-600" />
          ) : (
            <FiXCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-red-600" />
          )}
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
