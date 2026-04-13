'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

interface Website {
  ID: number;
  WebsiteName: string;
  GhiChu: string;
}

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [websiteName, setWebsiteName] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWebsites = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/websites');
      setWebsites(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch websites:', err);
      setError('Failed to load websites');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebsites();
  }, [fetchWebsites]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!websiteName.trim()) {
      setError('Vui lòng nhập tên website');
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await apiClient.put(`/websites/${editingId}`, { websiteName, ghiChu });
      } else {
        await apiClient.post('/websites', { websiteName, ghiChu });
      }
      setWebsiteName('');
      setGhiChu('');
      setEditingId(null);
      fetchWebsites();
    } catch (err) {
      console.error('Failed to save website:', err);
      setError('Có lỗi trong quá trình thực hiện');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (website: Website) => {
    setEditingId(website.ID);
    setWebsiteName(website.WebsiteName);
    setGhiChu(website.GhiChu || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa không?')) return;

    try {
      await apiClient.delete(`/websites/${id}`);
      fetchWebsites();
    } catch (err) {
      console.error('Failed to delete website:', err);
      setError('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setWebsiteName('');
    setGhiChu('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#14264b]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Quản lý Website</h1>
        <p className="text-slate-500 mt-1">Danh sách và quản lý các website</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-medium text-slate-800 mb-4">
          {editingId ? 'Cập nhật website' : 'Thêm website mới'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tên Website <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                placeholder="Nhập tên website"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
              <input
                type="text"
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                placeholder="Nhập ghi chú"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#14264b] focus:border-[#14264b] outline-none transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-[#14264b] text-white font-medium rounded-lg hover:bg-[#4ab5dd] focus:ring-2 focus:ring-[#14264b] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Lưu'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors cursor-pointer"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">Thao tác</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Tên website</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {websites.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <p>Không có dữ liệu</p>
                  </td>
                </tr>
              ) : (
                websites.map((website) => (
                  <tr key={website.ID} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(website)}
                          className="p-1.5 text-[#14264b] hover:text-[#2a9bc0] hover:bg-[#e6f7fc] rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(website.ID)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V5a2 2 0 00-2-2H8a2 2 0 00-2 2v2m1 0h10" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{website.WebsiteName}</td>
                    <td className="px-6 py-4 text-slate-600">{website.GhiChu || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 text-sm text-slate-500">
        <span>Tổng: <strong className="text-slate-700">{websites.length}</strong> website</span>
      </div>
    </div>
  );
}