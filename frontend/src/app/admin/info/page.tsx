'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';

interface Website {
  ID: number;
  WebsiteName: string;
  GhiChu: string;
}


export default function InfoPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWebsites() {
      try {
        const { data } = await apiClient.get('/websites');
        setWebsites(data.data || []);
      } catch (err) {
        console.error('Failed to fetch websites:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWebsites();
  }, []);

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="flex gap-1">
        <button className="rounded-t-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white">
          Danh sách thông tin web
        </button>
        <Link
          href="/admin/websites"
          className="rounded-t-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          Tạo mới thông tin
        </Link>
      </div>

      <h1 className="text-xl font-semibold text-gray-800">DANH SÁCH THÔNG TIN WEB</h1>

      {/* Data table */}
      <div className="rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 font-medium">Thao tác</th>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Tên thông tin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : websites.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                websites.map((item) => (
                  <tr key={item.ID} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/websites`}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                    <td className="px-4 py-3">{item.ID}</td>
                    <td className="px-4 py-3">{item.WebsiteName}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}