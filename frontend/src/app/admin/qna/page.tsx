'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQnaList, getDebtReportUsers, answerQna, deleteQna, QnaItem } from '@/lib/api';

/**
 * Q&A Admin Page
 *
 * Converted from admin/HoiDapAdmin.aspx
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Hỏi đáp</h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">User</label>
            <select
              value={filters.username}
              onChange={(e) => handleFilterChange('username', e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">--Tất cả--</option>
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
              value={filters.daTraLoi}
              onChange={(e) => handleFilterChange('daTraLoi', Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
            >
              <option value={-1}>Tất cả</option>
              <option value={1}>Đã trả lời</option>
              <option value={0}>Chưa trả lời</option>
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
        ) : data?.data?.length === 0 ? (
          <div className="p-8 text-center">Chưa có câu hỏi nào</div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Câu hỏi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày hỏi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trả lời</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data?.data?.map((item) => (
                  <tr key={item.ID} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{item.ID}</td>
                    <td className="px-4 py-3 text-sm">{item.UserName}</td>
                    <td className="px-4 py-3 text-sm">{item.CauHoi}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.NgayHoi ? new Date(item.NgayHoi).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.TraLoi || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          item.DaTraLoi ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {item.DaTraLoi ? 'Đã trả lời' : 'Chưa trả lời'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center space-x-1">
                      {!item.DaTraLoi && (
                        <button
                          onClick={() => setAnsweringId(item.ID)}
                          className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Trả lời
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (confirm('Bạn có chắc chắn muốn xóa?')) {
                            deleteMutation.mutate(item.ID);
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

      {/* Answer Modal */}
      {answeringId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Trả lời câu hỏi</h2>
            <form onSubmit={handleSubmitAnswer}>
              <div>
                <label className="block text-sm font-medium mb-1">Câu trả lời</label>
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  required
                  placeholder="Nhập câu trả lời..."
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setAnsweringId(null);
                    setAnswer('');
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={answerMutation.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {answerMutation.isPending ? 'Đang lưu...' : 'Gửi trả lời'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
