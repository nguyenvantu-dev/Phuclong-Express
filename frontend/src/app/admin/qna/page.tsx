'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQnaList, getDebtReportUsers, answerQna, deleteQna, QnaItem } from '@/lib/api';

/**
 * Q&A Admin Page
 *
 * Features:
 * - List all Q&A with filters
 * - Answer Q&A questions
 * - Delete Q&A
 */
export default function QnaPage() {
  const queryClient = useQueryClient();

  // Filter state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    username: '',
    daTraLoi: -1,
  });

  // Modal state
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');

  // Fetch Q&A list
  const { data, isLoading, error } = useQuery({
    queryKey: ['qna', filters],
    queryFn: () => getQnaList(filters),
  });

  // Fetch users for dropdown
  const { data: users } = useQuery({
    queryKey: ['debt-report-users'],
    queryFn: getDebtReportUsers,
  });

  // Answer mutation
  const answerMutation = useMutation({
    mutationFn: ({ id, traLoi }: { id: number; traLoi: string }) => answerQna(id, traLoi),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['qna'] });
        setAnsweringId(null);
        setAnswer('');
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteQna,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qna'] });
    },
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleSubmitAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (answeringId && answer.trim()) {
      answerMutation.mutate({ id: answeringId, traLoi: answer.trim() });
    }
  };

  const totalPages = Math.ceil((data?.total || 0) / filters.limit);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-xl">💬</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý Hỏi đáp</h1>
            <p className="text-sm text-gray-500">Quản lý câu hỏi và trả lời từ khách hàng</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Filters Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-gray-500">⚙️</span>
            <h2 className="font-semibold text-gray-800">Bộ lọc</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Người dùng</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  🔍
                </span>
                <select
                  value={filters.username}
                  onChange={(e) => handleFilterChange('username', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                >
                  <option value="">--Tất cả--</option>
                  {users?.map((user) => (
                    <option key={user.Id} value={user.UserName}>
                      {user.UserName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
              <select
                value={filters.daTraLoi}
                onChange={(e) => handleFilterChange('daTraLoi', Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
              >
                <option value={-1}>Tất cả</option>
                <option value={1}>Đã trả lời</option>
                <option value={0}>Chưa trả lời</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Table Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">❌</span>
                </div>
                <p className="text-red-600 font-medium">Lỗi tải dữ liệu</p>
                <p className="text-gray-500 text-sm mt-1">{String(error)}</p>
              </div>
            </div>
          ) : data?.data?.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">💬</span>
                </div>
                <p className="text-gray-600 font-medium">Chưa có câu hỏi nào</p>
                <p className="text-gray-400 text-sm mt-1">Danh sách câu hỏi sẽ hiển thị tại đây</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">ID</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">User</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Câu hỏi</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-28">Ngày hỏi</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Trả lời</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">Status</th>
                      <th className="px-5 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data?.data?.map((item) => (
                      <tr key={item.ID} className="hover:bg-blue-50/50 transition-colors duration-150">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{item.ID}</td>
                        <td className="px-5 py-4 text-sm text-gray-700 font-medium">{item.username}</td>
                        <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.CauHoi}>
                          {item.CauHoi}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {item.NgayTao ? new Date(item.NgayTao).toLocaleDateString('vi-VN') : ''}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600 max-w-xs truncate" title={item.TraLoi || ''}>
                          {item.TraLoi || <span className="text-gray-400 italic">-</span>}
                        </td>
                        <td className="px-5 py-4 text-center">
                          {item.TraLoi ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></span>
                              Đã trả lời
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
                              Chờ trả lời
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {!item.TraLoi && (
                              <button
                                onClick={() => setAnsweringId(item.ID)}
                                className="px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-150 whitespace-nowrap"
                              >
                                Trả lời
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
                                  deleteMutation.mutate(item.ID);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-colors duration-150 whitespace-nowrap"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="text-sm text-gray-500">
                    Trang <span className="font-medium text-gray-700">{filters.page}</span> / <span className="font-medium text-gray-700">{totalPages}</span>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <button
                      onClick={() => handlePageChange(filters.page - 1)}
                      disabled={filters.page <= 1}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      ← Trước
                    </button>
                    <button
                      onClick={() => handlePageChange(filters.page + 1)}
                      disabled={filters.page >= totalPages}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      Sau →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Answer Modal */}
      {answeringId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📝</span>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Trả lời câu hỏi</h2>
              </div>
              <button
                onClick={() => {
                  setAnsweringId(null);
                  setAnswer('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-150"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitAnswer} className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Câu trả lời</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 resize-none"
                  rows={5}
                  required
                  placeholder="Nhập câu trả lời của bạn..."
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setAnsweringId(null);
                    setAnswer('');
                  }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-150"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={answerMutation.isPending || !answer.trim()}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 flex items-center gap-2"
                >
                  {answerMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      ✉️ Gửi trả lời
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
