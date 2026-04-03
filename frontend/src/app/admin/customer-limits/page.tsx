'use client';

import { useState, useEffect, useCallback } from 'react';
import apiClient, { getUsernames } from '@/lib/api';

// Theme colors
const THEME = {
  primary: '#5cc6ee',
  primaryDark: '#3eb5d9',
  primaryLight: '#7dd3f3',
  bg: '#f8fafc',
  card: '#ffffff',
  text: '#1e293b',
  textMuted: '#64748b',
  border: '#e2e8f0',
  danger: '#ef4444',
  success: '#22c55e',
};

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
      const usersList = await getUsernames();
      // Map { username: string }[] to { UserName: string }[]
      const mappedUsers = (usersList || []).map(u => ({ UserName: u.username }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, []);

  const fetchLimits = useCallback(async () => {
    try {
      const params = {
        page,
        limit,
        ...(usernameFilter && { username: usernameFilter }),
      };
      const res = await apiClient.get<{ data: CustomerLimit[]; total: number }>('/customer-limits', { params });
      setLimits(res.data.data || []);
      setTotal(res.data.total || 0);
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
      const payload = {
        username,
        daQuaHanMuc,
        laKhachVip,
      };

      if (editingId) {
        await apiClient.put(`/customer-limits/${editingId}`, payload);
      } else {
        await apiClient.post('/customer-limits', payload);
      }

      setUsername('');
      setDaQuaHanMuc(false);
      setLaKhachVip(false);
      setEditingId(null);
      fetchLimits();
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
      await apiClient.delete(`/customer-limits/${id}`);
      fetchLimits();
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

  // Custom styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
      fontSize: '28px',
      fontWeight: 600,
      color: THEME.text,
      marginBottom: '24px',
      borderBottom: `3px solid ${THEME.primary}`,
      paddingBottom: '8px',
    },
    card: {
      background: THEME.card,
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '24px',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: THEME.primary,
      marginBottom: '16px',
    },
    form: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '6px',
    },
    label: {
      fontSize: '14px',
      fontWeight: 500,
      color: THEME.text,
    },
    labelRequired: {
      color: THEME.danger,
    },
    input: {
      padding: '10px 14px',
      fontSize: '14px',
      border: `1px solid ${THEME.border}`,
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    select: {
      padding: '10px 14px',
      fontSize: '14px',
      border: `1px solid ${THEME.border}`,
      borderRadius: '8px',
      outline: 'none',
      background: 'white',
      cursor: 'pointer',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    },
    checkbox: {
      width: '20px',
      height: '20px',
      accentColor: THEME.primary,
      cursor: 'pointer',
    },
    button: {
      padding: '10px 20px',
      fontSize: '14px',
      fontWeight: 500,
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    buttonPrimary: {
      background: THEME.primary,
      color: 'white',
    },
    buttonSecondary: {
      background: '#f1f5f9',
      color: THEME.text,
      marginLeft: '8px',
    },
    linkButton: {
      background: 'none',
      border: 'none',
      color: THEME.primary,
      padding: '4px 8px',
      cursor: 'pointer',
      fontSize: '14px',
      textDecoration: 'underline',
    },
    linkButtonDanger: {
      color: THEME.danger,
    },
    error: {
      color: THEME.danger,
      fontSize: '14px',
      marginBottom: '16px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      fontSize: '14px',
    },
    th: {
      background: THEME.primary,
      color: 'white',
      padding: '12px',
      textAlign: 'left' as const,
      fontWeight: 500,
    },
    td: {
      padding: '12px',
      borderBottom: `1px solid ${THEME.border}`,
      color: THEME.text,
    },
    trHover: {
      background: '#f8fafc',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '24px',
    },
    pageButton: {
      padding: '8px 14px',
      border: `1px solid ${THEME.border}`,
      background: 'white',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s',
    },
    pageButtonActive: {
      background: THEME.primary,
      color: 'white',
      borderColor: THEME.primary,
    },
    pageButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '100px 24px 24px' }}>
        <div style={{ color: THEME.primary, fontSize: '18px' }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Khai báo hạn mức khách hàng</h1>

      {error && <div style={styles.error}>{error}</div>}

      {/* Add/Edit Form */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>
          {editingId ? 'Chỉnh sửa hạn mức' : 'Thêm hạn mức mới'}
        </div>
        <form onSubmit={handleSubmit}>
          <div style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Chọn Username<span style={styles.labelRequired}> *</span>
              </label>
              <select
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={editingId !== null}
                style={styles.select}
              >
                <option value="">--Chọn--</option>
                {users.map((user) => (
                  <option key={user.UserName} value={user.UserName}>
                    {user.UserName}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={daQuaHanMuc}
                  onChange={(e) => setDaQuaHanMuc(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={{ marginLeft: '8px' }}>
                  Đã quá hạn mức<span style={styles.labelRequired}> *</span>
                </span>
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={laKhachVip}
                  onChange={(e) => setLaKhachVip(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={{ marginLeft: '8px' }}>
                  Là khách VIP<span style={styles.labelRequired}> *</span>
                </span>
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>&nbsp;</label>
              <div>
                <button
                  type="submit"
                  style={{ ...styles.button, ...styles.buttonPrimary }}
                >
                  {editingId ? 'Cập nhật' : 'Lưu'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    style={{ ...styles.button, ...styles.buttonSecondary }}
                  >
                    Hủy
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Filter */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Danh sách khách hàng</div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={usernameFilter}
              onChange={(e) => setUsernameFilter(e.target.value)}
              placeholder="Tìm kiếm..."
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>&nbsp;</label>
            <button
              onClick={handleSearch}
              style={{ ...styles.button, ...styles.buttonPrimary }}
            >
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '140px' }}>Thao tác</th>
              <th style={styles.th}>User Name</th>
              <th style={styles.th}>Đã quá hạn mức</th>
              <th style={styles.th}>Là khách VIP</th>
            </tr>
          </thead>
          <tbody>
            {limits.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ ...styles.td, textAlign: 'center', color: THEME.textMuted }}>
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              limits.map((limit, idx) => (
                <tr key={limit.ID ?? idx} style={idx % 2 === 1 ? styles.trHover : {}}>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleEdit(limit)}
                      style={styles.linkButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(limit.ID)}
                      style={{ ...styles.linkButton, ...styles.linkButtonDanger }}
                    >
                      Xóa
                    </button>
                  </td>
                  <td style={styles.td}>{limit.UserName}</td>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={limit.DaQuaHanMuc}
                      disabled
                      style={styles.checkbox}
                    />
                  </td>
                  <td style={styles.td}>
                    <input
                      type="checkbox"
                      checked={limit.LaKhachVip}
                      disabled
                      style={styles.checkbox}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              style={{
                ...styles.pageButton,
                ...(page === 1 ? styles.pageButtonDisabled : {}),
              }}
            >
              First
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              style={{
                ...styles.pageButton,
                ...(page === 1 ? styles.pageButtonDisabled : {}),
              }}
            >
              Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  style={{
                    ...styles.pageButton,
                    ...(page === pageNum ? styles.pageButtonActive : {}),
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              style={{
                ...styles.pageButton,
                ...(page === totalPages ? styles.pageButtonDisabled : {}),
              }}
            >
              Next
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              style={{
                ...styles.pageButton,
                ...(page === totalPages ? styles.pageButtonDisabled : {}),
              }}
            >
              Last
            </button>
          </div>
        )}
      </div>
    </div>
  );
}