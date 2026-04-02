'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Period {
  KyID: number;
  Nam: number;
  Thang: number;
  DaDong: boolean;
}

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPeriods = useCallback(async () => {
    try {
      const res = await fetch('/api/periods');
      const data = await res.json();
      setPeriods(data.data || []);
    } catch (err) {
      console.error('Failed to fetch periods:', err);
      setError('Failed to load periods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  const handleClosePeriod = async (id: number) => {
    if (!confirm('Bạn có chắc đóng kỳ này không?')) return;

    try {
      const res = await fetch(`/api/periods/${id}/close`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.code === 0) {
        fetchPeriods();
      } else if (data.code === 1) {
        alert('Kỳ trước chưa đóng. Không thực hiện đóng kỳ này');
      } else if (data.code === 2) {
        alert('Không có kỳ liền kề trước. Không thực hiện đóng kỳ này');
      } else if (data.code === 3) {
        alert('Có dữ liệu công nợ trước ngày đóng chưa duyệt. Không thực hiện đóng kỳ này');
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to close period:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa không?')) return;

    try {
      const res = await fetch(`/api/periods/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.code === 0) {
        fetchPeriods();
      } else if (data.code === 1) {
        alert('Kỳ đã phát sinh dữ liệu. Không thực hiện xóa');
      } else {
        alert('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to delete period:', err);
      alert('Có lỗi trong quá trình thực hiện');
    }
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <div className="mytab">
        <Link href="/admin/periods" style={{ backgroundColor: 'darkgray' }}>Danh sách kỳ công nợ</Link>
        {' | '}
        <Link href="/admin/periods/new">Tạo mới kỳ công nợ</Link>
      </div>

      <h1 className="titlead">DANH SÁCH KỲ</h1>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <table className="table table-bordered table-hover">
        <thead>
          <tr className="myGridHeader">
            <th style={{ width: '160px' }}>Thao tác</th>
            <th style={{ width: '80px' }}>Đóng kỳ</th>
            <th style={{ width: '50px' }}>Năm</th>
            <th style={{ width: '50px' }}>Tháng</th>
            <th style={{ width: '80px' }}>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {periods.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center">Không có dữ liệu</td>
            </tr>
          ) : (
            periods.map((period) => (
              <tr key={period.KyID}>
                <td>
                  {period.DaDong ? (
                    <Link href={`/admin/periods/${period.KyID}`} target="_blank">
                      Chi tiết số liệu đóng kỳ
                    </Link>
                  ) : (
                    <Link href={`/admin/periods/new?id=${period.KyID}`} target="_blank">
                      Chỉnh sửa
                    </Link>
                  )}
                </td>
                <td>
                  {period.DaDong ? (
                    'Kỳ đã đóng'
                  ) : (
                    <button
                      onClick={() => handleClosePeriod(period.KyID)}
                      className="btn-link"
                    >
                      Đóng kỳ
                    </button>
                  )}
                </td>
                <td>{period.Nam}</td>
                <td>{period.Thang}</td>
                <td>
                  <button
                    onClick={() => handleDelete(period.KyID)}
                    className="btn-link"
                    style={{ color: 'red' }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
