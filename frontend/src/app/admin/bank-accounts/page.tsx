'use client';

import { useState, useEffect, useCallback } from 'react';

interface BankAccount {
  ID: number;
  TenTaiKhoanNganHang: string;
  GhiChu: string;
}

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [tenTaiKhoan, setTenTaiKhoan] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch('/api/bank-accounts');
      const data = await res.json();
      setAccounts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err);
      setError('Failed to load bank accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tenTaiKhoan.trim()) {
      setError('Vui lòng nhập tên tài khoản');
      return;
    }

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/bank-accounts/${editingId}` : '/api/bank-accounts';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenTaiKhoanNganHang: tenTaiKhoan, ghiChu }),
      });

      if (res.ok) {
        setTenTaiKhoan('');
        setGhiChu('');
        setEditingId(null);
        fetchAccounts();
      } else {
        setError('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to save bank account:', err);
      setError('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingId(account.ID);
    setTenTaiKhoan(account.TenTaiKhoanNganHang);
    setGhiChu(account.GhiChu || '');
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa không?')) return;

    try {
      const res = await fetch(`/api/bank-accounts/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAccounts();
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to delete bank account:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setTenTaiKhoan('');
    setGhiChu('');
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="titlead">Danh sách Tài Khoản Ngân Hàng</h1>
      <hr />

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td style={{ width: '150px' }}>Tên Tài khoản</td>
              <td>
                <input
                  type="text"
                  value={tenTaiKhoan}
                  onChange={(e) => setTenTaiKhoan(e.target.value)}
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
              <th>Tên tài khoản</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center">Không có dữ liệu</td>
              </tr>
            ) : (
              accounts.map((account) => (
                <tr key={account.ID}>
                  <td>
                    <button
                      onClick={() => handleEdit(account)}
                      className="btn-link"
                      style={{ marginRight: '5px' }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(account.ID)}
                      className="btn-link"
                      style={{ color: 'red' }}
                    >
                      Delete
                    </button>
                  </td>
                  <td>{account.TenTaiKhoanNganHang}</td>
                  <td>{account.GhiChu}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
