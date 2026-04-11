'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Website {
  ID: number;
  WebsiteName: string;
  GhiChu: string;
}

export default function WebsiteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const websiteId = params.id as string;

  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [websiteName, setWebsiteName] = useState('');
  const [ghiChu, setGhiChu] = useState('');

  useEffect(() => {
    fetchWebsite();
  }, [websiteId]);

  const fetchWebsite = async () => {
    try {
      const res = await apiClient.get(`/websites/${websiteId}`);
      const website = res.data.data;
      if (website) {
        setWebsite(website);
        setWebsiteName(website.WebsiteName || '');
        setGhiChu(website.GhiChu || '');
      }
    } catch (err) {
      console.error('Failed to load website:', err);
      setError('Failed to load website data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!websiteName.trim()) {
      setError('Vui lòng nhập tên website');
      return;
    }

    setSaving(true);
    try {
      await apiClient.put(`/websites/${websiteId}`, { websiteName, ghiChu });
      setSuccess('Cập nhật thành công');
      setTimeout(() => {
        router.push('/admin/websites');
      }, 1500);
    } catch (err: any) {
      console.error('Failed to update:', err);
      setError(err?.response?.data?.message || 'Có lỗi trong quá trình cập nhật');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5cc6ee]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm mb-6">
        <Link
          href="/admin/websites"
          className="text-[#5cc6ee] hover:text-[#4ab5dd] transition-colors cursor-pointer"
        >
          Danh sách website
        </Link>
        <span className="text-slate-400">/</span>
        <span className="text-slate-600">Chi tiết website</span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Thông tin Website</h1>
        <p className="text-slate-500 mt-1">{website?.WebsiteName}</p>
      </div>

      {/* Error/Success Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-700 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-green-500 hover:text-green-700 cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="space-y-6">
          {/* Website Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tên Website <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              placeholder="Nhập tên website"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5cc6ee] focus:border-[#5cc6ee] outline-none transition-colors"
            />
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú</label>
            <input
              type="text"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
              placeholder="Nhập ghi chú"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#5cc6ee] focus:border-[#5cc6ee] outline-none transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#5cc6ee] text-white font-medium rounded-lg hover:bg-[#4ab5dd] focus:ring-2 focus:ring-[#5cc6ee] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? 'Đang lưu...' : 'Cập nhật'}
            </button>
            <Link
              href="/admin/websites"
              className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors cursor-pointer"
            >
              Hủy
            </Link>
          </div>
        </div>
      </form>

      {/* Back Link */}
      <div className="mt-6">
        <Link
          href="/admin/websites"
          className="inline-flex items-center gap-2 text-[#5cc6ee] hover:text-[#4ab5dd] transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </Link>
      </div>
    </div>
  );
}
