'use client';

import { useState, useEffect, useCallback } from 'react';

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

  const fetchWebsites = useCallback(async () => {
    try {
      const res = await fetch('/api/websites');
      const data = await res.json();
      setWebsites(data.data || []);
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

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/websites/${editingId}` : '/api/websites';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteName, ghiChu }),
      });

      if (res.ok) {
        setWebsiteName('');
        setGhiChu('');
        setEditingId(null);
        fetchWebsites();
      } else {
        setError('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to save website:', err);
      setError('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleEdit = (website: Website) => {
    setEditingId(website.ID);
    setWebsiteName(website.WebsiteName);
    setGhiChu(website.GhiChu || '');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa không?')) return;

    try {
      const res = await fetch(`/api/websites/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchWebsites();
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to delete website:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setWebsiteName('');
    setGhiChu('');
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="titlead">Danh sách website</h1>
      <hr />

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td style={{ width: '150px' }}>Tên Website</td>
              <td>
                <input
                  type="text"
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  style={{ width: '100%' }}
                />
              </td>
            </tr>
            <tr>
              <td>Ghi chú</td>
              <td>
                <input
                  type="text"
                  value={ghiChu}
                  onChange={(e) => setGhiChu(e.target.value)}
                  style={{ width: '100%' }}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: 'center' }}>
                <button type="submit" className="btn btn-default">
                  {editingId ? 'Cập nhật' : 'Lưu'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="btn btn-default"
                    style={{ marginLeft: '5px' }}
                  >
                    Hủy
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </form>

      {/* Table */}
      <div style={{ marginTop: '20px' }}>
        <table className="table table-bordered table-hover">
          <thead>
            <tr className="myGridHeader">
              <th style={{ width: '80px' }}>Thao tác</th>
              <th>Tên website</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {websites.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">Không có dữ liệu</td>
              </tr>
            ) : (
              websites.map((website) => (
                <tr key={website.ID}>
                  <td>
                    <button
                      onClick={() => handleEdit(website)}
                      className="btn-link"
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(website.ID)}
                      className="btn-link"
                      style={{ color: 'red' }}
                    >
                      Delete
                    </button>
                  </td>
                  <td>{website.WebsiteName}</td>
                  <td>{website.GhiChu}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
