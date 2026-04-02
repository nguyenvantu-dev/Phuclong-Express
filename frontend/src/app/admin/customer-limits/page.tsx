'use client';

import { useState, useEffect, useCallback } from 'react';

interface CustomerLimit {
  ID: number;
  UserName: string;
  DaQuaHanMuc: boolean;
  LaKhachVip: boolean;
}

interface User {
  UserName: string;
}

export default function CustomerLimitsPage() {
  const [limits, setLimits] = useState<CustomerLimit[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [usernameFilter, setUsernameFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  // Form state
  const [username, setUsername] = useState('');
  const [daQuaHanMuc, setDaQuaHanMuc] = useState(false);
  const [laKhachVip, setLaKhachVip] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  const fetchLimits = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (usernameFilter) params.append('username', usernameFilter);

      const res = await fetch(`/api/customer-limits?${params.toString()}`);
      const data = await res.json();
      setLimits(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch limits:', err);
      setError('Failed to load limits');
    } finally {
      setLoading(false);
    }
  }, [page, limit, usernameFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  const handleSearch = () => {
    setPage(1);
    fetchLimits();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username) {
      setError('Vui lòng chọn username');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/customer-limits/${editingId}` : '/api/customer-limits';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          daQuaHanMuc,
          laKhachVip,
        }),
      });

      if (res.ok) {
        setUsername('');
        setDaQuaHanMuc(false);
        setLaKhachVip(false);
        setEditingId(null);
        fetchLimits();
      } else {
        setError('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to save limit:', err);
      setError('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleEdit = (limit: CustomerLimit) => {
    setEditingId(limit.ID);
    setUsername(limit.UserName);
    setDaQuaHanMuc(limit.DaQuaHanMuc);
    setLaKhachVip(limit.LaKhachVip);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa không?')) return;

    try {
      const res = await fetch(`/api/customer-limits/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLimits();
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to delete limit:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setUsername('');
    setDaQuaHanMuc(false);
    setLaKhachVip(false);
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="titlead">Khai báo hạn mức khách hàng</h1>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td>Chọn Username:</td>
              <td>
                <select
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={editingId !== null}
                >
                  <option value="">--Chọn--</option>
                  {users.map((user) => (
                    <option key={user.UserName} value={user.UserName}>
                      {user.UserName}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>Đã quá hạn mức (<span style={{ color: 'red' }}>*</span>)</td>
              <td>
                <input
                  type="checkbox"
                  checked={daQuaHanMuc}
                  onChange={(e) => setDaQuaHanMuc(e.target.checked)}
                />
              </td>
            </tr>
            <tr>
              <td>Là khách VIP (<span style={{ color: 'red' }}>*</span>)</td>
              <td>
                <input
                  type="checkbox"
                  checked={laKhachVip}
                  onChange={(e) => setLaKhachVip(e.target.checked)}
                />
              </td>
            </tr>
            <tr>
              <td></td>
              <td style={{ textAlign: 'right' }}>
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

      {/* Filter */}
      <div style={{ marginTop: '20px' }}>
        <h1 style={{ fontSize: '16px', color: 'red' }}>Danh sách khách hàng</h1>
        <table>
          <tbody>
            <tr>
              <td>Username</td>
              <td>
                <input
                  type="text"
                  value={usernameFilter}
                  onChange={(e) => setUsernameFilter(e.target.value)}
                  style={{ fontWeight: 'bold' }}
                />
              </td>
              <td>
                <button onClick={handleSearch} className="btn btn-default">
                  Tìm
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Table */}
      <div>
        <table className="table table-bordered table-hover">
          <thead>
            <tr className="myGridHeader">
              <th style={{ width: '120px' }}>Thao tác</th>
              <th>User Name</th>
              <th>Đã quá hạn mức</th>
              <th>Là khách VIP</th>
            </tr>
          </thead>
          <tbody>
            {limits.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center">Không có dữ liệu</td>
              </tr>
            ) : (
              limits.map((limit) => (
                <tr key={limit.ID}>
                  <td>
                    <button
                      onClick={() => handleEdit(limit)}
                      className="btn-link"
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(limit.ID)}
                      className="btn-link"
                      style={{ color: 'red' }}
                    >
                      Xóa
                    </button>
                  </td>
                  <td>{limit.UserName}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={limit.DaQuaHanMuc}
                      disabled
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={limit.LaKhachVip}
                      disabled
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="text-center">
          <ul className="pagination">
            <li className={page === 1 ? 'disabled' : ''}>
              <button onClick={() => setPage(1)} disabled={page === 1}>
                First
              </button>
            </li>
            <li className={page === 1 ? 'disabled' : ''}>
              <button onClick={() => setPage(page - 1)} disabled={page === 1}>
                Prev
              </button>
            </li>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <li key={pageNum} className={page === pageNum ? 'active' : ''}>
                  <button onClick={() => setPage(pageNum)}>{pageNum}</button>
                </li>
              );
            })}
            <li className={page === totalPages ? 'disabled' : ''}>
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
                Next
              </button>
            </li>
            <li className={page === totalPages ? 'disabled' : ''}>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                Last
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
