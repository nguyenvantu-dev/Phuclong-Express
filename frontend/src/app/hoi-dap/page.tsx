'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-context';
import { getQnaList, createQna } from '@/lib/api';

interface QnaItem {
  ID: number;
  username: string;
  CauHoi: string;
  TraLoi: string | null;
  NgayTao: string;
  NgayTraLoi: string | null;
}

/**
 * HoiDap Page - Q&A
 * Converted from: UF/HoiDap.aspx
 * Uses backend: qna service
 */
export default function HoiDapPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<QnaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form
  const [cauHoi, setCauHoi] = useState('');

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadQuestions();
    }
  }, [page, isAuthenticated]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await getQnaList({
        page,
        limit,
      });
      setQuestions(response.data || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!cauHoi.trim()) {
      setError('Vui lòng nhập câu hỏi');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await createQna(cauHoi);
      setSuccess('Câu hỏi của bạn đã được gửi. Chúng tôi sẽ trả lời sớm!');
      setCauHoi('');
      // Reload questions
      loadQuestions();
    } catch (err) {
      console.error('Error creating question:', err);
      setError('Có lỗi khi gửi câu hỏi');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">HỎI ĐÁP</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

      {/* Form */}
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Câu hỏi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={cauHoi}
            onChange={(e) => setCauHoi(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={5}
            placeholder="Nhập câu hỏi của bạn..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Tạo câu hỏi
        </button>
      </div>

      <hr className="my-6" />

      {/* Q&A List */}
      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1 text-left">Người hỏi</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Câu hỏi</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Trả lời</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Ngày tạo</th>
                  <th className="border border-gray-300 px-2 py-1 text-left">Ngày trả lời</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  questions.map((item, index) => (
                    <tr key={item.ID ?? `q-${index}`} className="border-b">
                      <td className="border border-gray-300 px-2 py-2">{item.username}</td>
                      <td className="border border-gray-300 px-2 py-2">{item.CauHoi}</td>
                      <td className="border border-gray-300 px-2 py-2">
                        {item.TraLoi || '(Chưa trả lời)'}
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        {item.NgayTao
                          ? new Date(item.NgayTao).toLocaleString('vi-VN')
                          : ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-2">
                        {item.NgayTraLoi
                          ? new Date(item.NgayTraLoi).toLocaleString('vi-VN')
                          : ''}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Trang {page} / {totalPages} (Tổng: {total})
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
