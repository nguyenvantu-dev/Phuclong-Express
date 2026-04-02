'use client';

import { useState, useEffect } from 'react';

interface User {
  UserName: string;
}

export default function ClearUserDataPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/users');
        const data = await res.json();
        if (data) {
          setUsers(data);
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      }
    }
    loadUsers();
  }, []);

  const handleClear = async () => {
    if (!selectedUsername) {
      setMessage('Vui lòng chọn user');
      return;
    }

    if (!confirm('Bạn có chắc muốn xóa dữ liệu của user này?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/users/clear-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUsername }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Đã clear dữ liệu thành công');
      } else {
        setMessage(data.message || 'Có lỗi trong quá trình thao tác');
      }
    } catch (error) {
      setMessage('Có lỗi trong quá trình thao tác');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="titlead">CLEAR DỮ LIỆU THEO USER - CẨN THẬN TRƯỚC KHI SỬ DỤNG !!!</h1>

      <table>
        <tbody>
          <tr>
            <td style={{ paddingLeft: '10px' }}>Username: </td>
            <td>
              <select
                className="form-control"
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
              >
                <option value="">--Chọn User--</option>
                {users.map((user) => (
                  <option key={user.UserName} value={user.UserName}>
                    {user.UserName}
                  </option>
                ))}
              </select>
            </td>
            <td style={{ paddingLeft: '20px' }}>
              <button
                className="btn btn-default"
                onClick={handleClear}
                disabled={loading || !selectedUsername}
              >
                {loading ? 'Đang xử lý...' : 'Xóa !!!'}
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      {message && (
        <div className={message.includes('thành công') ? 'alert alert-success' : 'alert alert-danger'} style={{ marginTop: '20px' }}>
          {message}
        </div>
      )}
    </div>
  );
}