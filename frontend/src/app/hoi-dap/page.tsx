'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-context';
import { getQnaList, createQna } from '@/lib/api';
import { notificationsApiClient } from '@/lib/notifications-api-client';

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

  // Mark all info notifications as read when visiting this page
  useEffect(() => {
    if (isAuthenticated) {
      notificationsApiClient.markAllRead('info').catch(() => {});
    }
  }, [isAuthenticated]);

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14264b]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-[#14264b]">HỎI ĐÁP</h2>

      {error && <div className="text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="text-emerald-500 mb-4 bg-emerald-50 px-4 py-3 rounded-lg">{success}</div>}

      {/* Form */}
      <div className="bg-white rounded-xl border border-[#14264b]/20 shadow-sm p-4 md:p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1.5 text-slate-700">
            Câu hỏi <span className="text-red-500">*</span>
          </label>
          <textarea
            value={cauHoi}
            onChange={(e) => setCauHoi(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] transition-colors duration-150"
            rows={5}
            placeholder="Nhập câu hỏi của bạn..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-5 py-2.5 bg-[#14264b] text-white rounded-lg hover:bg-[#1f3a6d] cursor-pointer transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50"
        >
          Tạo câu hỏi
        </button>
      </div>

      <hr className="my-6 border-[#14264b]/20" />

      {/* Q&A List */}
      {isLoading ? (
        <div className="text-center py-12">
          <svg className="w-8 h-8 animate-spin text-[#14264b] mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-2 text-slate-600">Đang tải...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#14264b]/20 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#14264b]/10">
                  <th className="border-b border-[#14264b]/20 px-3 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Người hỏi</th>
                  <th className="border-b border-[#14264b]/20 px-3 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Câu hỏi</th>
                  <th className="border-b border-[#14264b]/20 px-3 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Trả lời</th>
                  <th className="border-b border-[#14264b]/20 px-3 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Ngày tạo</th>
                  <th className="border-b border-[#14264b]/20 px-3 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Ngày trả lời</th>
                </tr>
              </thead>
              <tbody>
                {questions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  questions.map((item, index) => (
                    <tr key={item.ID ?? `q-${index}`} className="bg-white">
                      <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-[#14264b] font-medium">{item.username}</td>
                      <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-slate-700">{item.CauHoi}</td>
                      <td className="border-b border-[#14264b]/10 px-3 py-2.5">
                        {item.TraLoi ? (
                          <span className="text-emerald-600">{item.TraLoi}</span>
                        ) : (
                          <span className="text-slate-400 italic">(Chưa trả lời)</span>
                        )}
                      </td>
                      <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-slate-600">
                        {item.NgayTao
                          ? new Date(item.NgayTao).toLocaleString('vi-VN')
                          : ''}
                      </td>
                      <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-slate-600">
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
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-[#14264b]/5 hover:border-[#14264b]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
              >
                Previous
              </button>
              <span className="px-4 py-1.5 text-slate-600">
                Trang <span className="font-medium text-[#14264b]">{page}</span> / {totalPages} (Tổng: {total})
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-[#14264b]/5 hover:border-[#14264b]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
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
