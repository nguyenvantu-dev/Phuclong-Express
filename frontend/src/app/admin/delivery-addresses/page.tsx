'use client';

import { useState, useEffect, useCallback } from 'react';

interface DeliveryAddress {
  ID: number;
  UserName: string;
  DiaChi: string;
}

interface User {
  UserName: string;
}

export default function DeliveryAddressesPage() {
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [usernameFilter, setUsernameFilter] = useState('');
  const [searchText, setSearchText] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  // Form state
  const [username, setUsername] = useState('');
  const [diaChi, setDiaChi] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingUsername, setEditingUsername] = useState('');

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

  const fetchAddresses = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (usernameFilter) params.append('username', usernameFilter);
      if (searchText) params.append('search', searchText);

      const res = await fetch(`/api/delivery-addresses?${params.toString()}`);
      const data = await res.json();
      setAddresses(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      setError('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  }, [page, limit, usernameFilter, searchText]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSearch = () => {
    setPage(1);
    fetchAddresses();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !diaChi.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/delivery-addresses/${editingId}` : '/api/delivery-addresses';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, diaChi }),
      });

      if (res.ok) {
        setUsername('');
        setDiaChi('');
        setEditingId(null);
        setEditingUsername('');
        fetchAddresses();
      } else {
        setError('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to save address:', err);
      setError('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleEdit = (address: DeliveryAddress) => {
    setEditingId(address.ID);
    setUsername(address.UserName);
    setDiaChi(address.DiaChi);
    setEditingUsername(address.UserName);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa không?')) return;

    try {
      const res = await fetch(`/api/delivery-addresses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAddresses();
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to delete address:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setUsername('');
    setDiaChi('');
    setEditingUsername('');
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="titlead">Quản lý địa chỉ nhận hàng của khách</h1>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Add Form */}
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
              <td></td>
            </tr>
            <tr>
              <td>Địa chỉ</td>
              <td>
                <input
                  type="text"
                  value={diaChi}
                  onChange={(e) => setDiaChi(e.target.value)}
                  style={{ width: '300px' }}
                />
              </td>
              <td>
                <button type="submit" className="btn btn-default">
                  {editingId ? 'Cập nhật' : 'Thêm'}
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
        <h1 style={{ fontSize: '16px', color: 'red' }}>Danh sách địa chỉ nhận hàng</h1>
        <table>
          <tbody>
            <tr>
              <td>User Name</td>
              <td>
                <select
                  value={usernameFilter}
                  onChange={(e) => setUsernameFilter(e.target.value)}
                >
                  <option value="">--All--</option>
                  {users.map((user) => (
                    <option key={user.UserName} value={user.UserName}>
                      {user.UserName}
                    </option>
                  ))}
                </select>
              </td>
              <td>Lọc</td>
              <td>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
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
              <th>Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            {addresses.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">Không có dữ liệu</td>
              </tr>
            ) : (
              addresses.map((address) => (
                <tr key={address.ID}>
                  <td>
                    <button
                      onClick={() => handleEdit(address)}
                      className="btn-link"
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(address.ID)}
                      className="btn-link"
                      style={{ color: 'red' }}
                    >
                      Xóa
                    </button>
                  </td>
                  <td>{address.UserName}</td>
                  <td>{address.DiaChi}</td>
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
