'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Period {
  KyID: number;
  Nam: number;
  Thang: number;
  DaDong: boolean;
}

const MONTHS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
  { value: 9, label: '9' },
  { value: 10, label: '10' },
  { value: 11, label: '11' },
  { value: 12, label: '12' },
];

function NewPeriodPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!editId);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<Period | null>(null);

  const [nam, setNam] = useState(new Date().getFullYear().toString());
  const [thang, setThang] = useState('1');

  useEffect(() => {
    if (editId) {
      fetch(`/api/periods/${editId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.data) {
            setPeriod(data.data);
            setNam(data.data.Nam.toString());
            setThang(data.data.Thang.toString());
          }
        })
        .catch((err) => console.error('Failed to load period:', err))
        .finally(() => setInitialLoading(false));
    }
  }, [editId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nam.trim()) {
      setError('Vui lòng nhập đủ thông tin');
      return;
    }

    const namNum = parseInt(nam);
    if (isNaN(namNum)) {
      setError('Năm phải là kiểu số');
      return;
    }

    setLoading(true);

    try {
      const method = editId ? 'PUT' : 'POST';
      const url = editId ? `/api/periods/${editId}` : '/api/periods';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nam: namNum, thang: parseInt(thang) }),
      });

      const data = await res.json();

      if (data.code === 0 || data.success) {
        router.push('/admin/periods');
      } else if (data.code === 1) {
        setError('Đã có kỳ này rồi');
      } else if (data.code === 2) {
        setError('Kỳ đã phát sinh dữ liệu. Không thể chỉnh sửa');
      } else {
        setError('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to save period:', err);
      setError('Có lỗi trong quá trình thực hiện');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <div className="mytab">
        <a href="/admin/periods">Danh sách kỳ</a>
        {' | '}
        <span style={{ backgroundColor: 'darkgray' }}>Tạo mới/ chỉnh sửa kỳ</span>
      </div>

      <h1 className="titlead">TẠO MỚI/ CHỈNH SỬA</h1>

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <table>
          <tbody>
            <tr>
              <td style={{ width: '150px' }}>Năm</td>
              <td>
                <input
                  type="text"
                  value={nam}
                  onChange={(e) => setNam(e.target.value)}
                  style={{ width: '100%' }}
                  disabled={!!period?.DaDong}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '150px' }}>Tháng</td>
              <td>
                <select
                  value={thang}
                  onChange={(e) => setThang(e.target.value)}
                  disabled={!!period?.DaDong}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ textAlign: 'center' }}>
                <button type="submit" className="btn btn-default" disabled={loading || !!period?.DaDong}>
                  Cập nhật
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}

export default function NewPeriodPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPeriodPageContent />
    </Suspense>
  );
}
