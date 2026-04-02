'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface User {
  Id: string;
  UserName: string;
  Email: string;
  hoTen: string;
  diaChi: string;
  tinhThanh: string;
  soTaiKhoan: string;
  hinhThucNhanHang: string;
  khachBuon: boolean;
  linkTaiKhoanMang: string;
  vungMien: string;
  roles: string[];
}

interface Role {
  name: string;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password reset state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const [userRes, rolesRes, allRolesRes] = await Promise.all([
        fetch(`/api/users/${userId}`),
        fetch(`/api/users/${userId}/roles`),
        fetch('/api/roles'),
      ]);

      const userData = await userRes.json();
      const rolesData = await rolesRes.json();
      const allRolesData = await allRolesRes.json();

      setUser(userData);
      setRoles(rolesData || []);
      setAllRoles(allRolesData || []);
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async (roleName: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roleName }),
      });

      if (res.ok) {
        setSuccess('Role added successfully');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to add role');
      }
    } catch (err) {
      setError('Failed to add role');
    }
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRemoveRole = async (roleName: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/roles/${roleName}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('Role removed successfully');
        fetchData();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to remove role');
      }
    } catch (err) {
      setError('Failed to remove role');
    }
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu và nhập lại mật khẩu không khớp');
      return;
    }

    setResetting(true);

    try {
      const res = await fetch(`/api/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setSuccess('Reset mật khẩu thành công');
        setPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  const userRoles = roles.map(r => r.name);

  return (
    <div className="form-horizontal">
      <h2>User: {user.UserName}</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <hr />

      {/* Role Management */}
      <h3>Quản lý Role</h3>
      <div className="form-group">
        <label className="col-md-2 control-label">Add Role</label>
        <div className="col-md-10">
          <select
            id="ddRole"
            className="btn btn-default"
            onChange={(e) => {
              if (e.target.value) {
                handleAddRole(e.target.value);
                e.target.value = '';
              }
            }}
          >
            <option value="">-- Chọn Role --</option>
            {allRoles
              .filter(role => !userRoles.includes(role.name))
              .map(role => (
                <option key={role.name} value={role.name}>
                  {role.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="col-md-2 control-label">Role của user</label>
        <div className="col-md-10">
          {roles.length > 0 ? (
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>RoleName</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => (
                  <tr key={idx}>
                    <td>{role.name}</td>
                    <td>
                      <button
                        onClick={() => handleRemoveRole(role.name)}
                        className="btn-link"
                        style={{ color: 'red' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No roles assigned</p>
          )}
        </div>
      </div>

      <hr />

      {/* Password Reset */}
      <h3>Reset mật khẩu</h3>
      <form onSubmit={handleResetPassword}>
        <div className="form-group">
          <label className="col-md-2 control-label">Mật khẩu</label>
          <div className="col-md-10">
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="col-md-2 control-label">Nhập lại mật khẩu</label>
          <div className="col-md-10">
            <input
              type="password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <div className="col-md-offset-2 col-md-10">
            <button
              type="submit"
              className="btn btn-default"
              disabled={resetting}
            >
              {resetting ? 'Đang reset...' : 'Reset'}
            </button>
          </div>
        </div>
      </form>

      <hr />

      {/* User Details */}
      <h3>Thông tin chi tiết</h3>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <td style={{ width: '200px', fontWeight: 'bold' }}>Tên đăng nhập:</td>
            <td>{user.UserName}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Họ tên:</td>
            <td>{user.hoTen || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Email:</td>
            <td>{user.Email || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Địa chỉ:</td>
            <td>{user.diaChi || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Tỉnh/Thành phố:</td>
            <td>{user.tinhThanh || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Vùng miền:</td>
            <td>{user.vungMien || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Số tài khoản:</td>
            <td>{user.soTaiKhoan || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Hình thức nhận hàng:</td>
            <td>{user.hinhThucNhanHang || '-'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Khách buôn:</td>
            <td>{user.khachBuon ? 'Có' : 'Không'}</td>
          </tr>
          <tr>
            <td style={{ fontWeight: 'bold' }}>Link FB:</td>
            <td>{user.linkTaiKhoanMang || '-'}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
