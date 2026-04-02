'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

interface PeriodDetail {
  ChotKyID: number;
  KyID: number;
  Nam: number;
  Thang: number;
  username: string;
  DauKy: number;
  PhatSinhThuDR: number;
  PhatSinhChiCR: number;
  PhatSinhCanDoi: number;
  CuoiKy: number;
  NguoiTao: string;
  NgayTao: string;
  NguoiCapNhatCuoi: string;
  NgayCapNhatCuoi: string;
  TamMoKy: boolean;
}

interface Period {
  KyID: number;
  Nam: number;
  Thang: number;
}

interface User {
  UserName: string;
}

export default function PeriodDetailPage() {
  const searchParams = useSearchParams();
  const kyId = searchParams.get('id');

  const [period, setPeriod] = useState<Period | null>(null);
  const [details, setDetails] = useState<PeriodDetail[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [usernameFilter, setUsernameFilter] = useState('');
  const [trangThaiFilter, setTrangThaiFilter] = useState('-1');
  const [kyIdFilter, setKyIdFilter] = useState(kyId || '-1');

  // Pagination
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(200);

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

  const fetchPeriod = useCallback(async () => {
    if (!kyId) return;
    try {
      const res = await fetch(`/api/periods/${kyId}`);
      const data = await res.json();
      if (data.data) {
        setPeriod(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch period:', err);
    }
  }, [kyId]);

  const fetchDetails = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      if (kyIdFilter && kyIdFilter !== '-1') params.append('kyId', kyIdFilter);
      if (usernameFilter) params.append('username', usernameFilter);
      if (trangThaiFilter && trangThaiFilter !== '-1') params.append('trangThai', trangThaiFilter);

      const res = await fetch(`/api/periods/details/list?${params.toString()}`);
      const data = await res.json();
      setDetails(data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch details:', err);
      setError('Failed to load details');
    } finally {
      setLoading(false);
    }
  }, [page, limit, kyIdFilter, usernameFilter, trangThaiFilter]);

  useEffect(() => {
    fetchUsers();
    fetchPeriod();
  }, [fetchUsers, fetchPeriod]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleSearch = () => {
    setPage(1);
    fetchDetails();
  };

  const handleTempOpen = async (chotKyId: number) => {
    if (!confirm('Bạn có chắc muốn tạm mở kỳ cho user này không?')) return;

    try {
      const res = await fetch(`/api/periods/details/${chotKyId}/temp-open`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.code === 0) {
        fetchDetails();
      } else if (data.code === 1) {
        alert('Không được mở kỳ quá xa hiện tại');
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to temp open period:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleTempClose = async (chotKyId: number) => {
    if (!confirm('Bạn có chắc muốn đóng kỳ cho user này không?')) return;

    try {
      const res = await fetch(`/api/periods/details/${chotKyId}/temp-close`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.code === 0) {
        fetchDetails();
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to temp close period:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    return num.toLocaleString('vi-VN');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Filter */}
      <div>
        <h1 style={{ fontSize: '16px', color: 'red' }}>Danh sách chi tiết chốt kỳ</h1>
        {period && (
          <p>
            <strong>Kỳ: {period.Thang}/{period.Nam}</strong>
          </p>
        )}
        <table>
          <tbody>
            <tr>
              <td>User Name:</td>
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
              <td>Trạng thái:</td>
              <td>
                <select
                  value={trangThaiFilter}
                  onChange={(e) => setTrangThaiFilter(e.target.value)}
                >
                  <option value="-1">--All--</option>
                  <option value="0">Đã chốt kỳ</option>
                  <option value="1">Chưa chốt kỳ</option>
                </select>
              </td>
              <td>Kỳ:</td>
              <td>
                <select
                  value={kyIdFilter}
                  onChange={(e) => setKyIdFilter(e.target.value)}
                >
                  <option value="-1">--All--</option>
                  {period && (
                    <option value={period.KyID}>
                      {period.Thang}/{period.Nam}
                    </option>
                  )}
                </select>
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
              <th style={{ width: '50px' }}>Năm</th>
              <th style={{ width: '50px' }}>Tháng</th>
              <th>Username</th>
              <th style={{ textAlign: 'right' }}>Đầu kỳ</th>
              <th style={{ textAlign: 'right' }}>Phát sinh thu DR</th>
              <th style={{ textAlign: 'right' }}>Phát sinh chi CR</th>
              <th style={{ textAlign: 'right' }}>Cân đối</th>
              <th style={{ textAlign: 'right' }}>Cuối kỳ</th>
              <th>Người tạo</th>
              <th>Ngày tạo</th>
              <th>Người cập nhật cuối</th>
              <th>Ngày cập nhật cuối</th>
              <th style={{ width: '80px' }}>Tình trạng</th>
              <th style={{ width: '80px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {details.length === 0 ? (
              <tr>
                <td colSpan={14} className="text-center">Không có dữ liệu</td>
              </tr>
            ) : (
              details.map((detail) => (
                <tr key={detail.ChotKyID}>
                  <td>{detail.Nam}</td>
                  <td>{detail.Thang}</td>
                  <td>
                    <a href={`/admin/debt-reports?u=${detail.username}&kid=${detail.KyID}`} target="_blank">
                      {detail.username}
                    </a>
                  </td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(detail.DauKy)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(detail.PhatSinhThuDR)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(detail.PhatSinhChiCR)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(detail.PhatSinhCanDoi)}</td>
                  <td style={{ textAlign: 'right' }}>{formatNumber(detail.CuoiKy)}</td>
                  <td>{detail.NguoiTao}</td>
                  <td>{formatDate(detail.NgayTao)}</td>
                  <td>{detail.NguoiCapNhatCuoi}</td>
                  <td>{formatDate(detail.NgayCapNhatCuoi)}</td>
                  <td>
                    {detail.TamMoKy ? 'Đang tạm thời mở kỳ cho user này' : 'Kỳ đang đóng'}
                  </td>
                  <td>
                    {detail.TamMoKy ? (
                      <button
                        onClick={() => handleTempClose(detail.ChotKyID)}
                        className="btn-link"
                      >
                        Đóng kỳ
                      </button>
                    ) : (
                      <button
                        onClick={() => handleTempOpen(detail.ChotKyID)}
                        className="btn-link"
                      >
                        Mở kỳ
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
