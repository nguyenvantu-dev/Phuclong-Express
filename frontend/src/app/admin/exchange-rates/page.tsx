'use client';

import { useState, useEffect, useCallback } from 'react';

interface ExchangeRate {
  Name: string;
  TyGiaVND: number;
  CongShipVeVN: number;
}

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Editing state
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editTyGiaVND, setEditTyGiaVND] = useState('');
  const [editCongShipVeVN, setEditCongShipVeVN] = useState('');

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch('/api/exchange-rates');
      const data = await res.json();
      setRates(data.data || []);
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
      setError('Failed to load exchange rates');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const handleEdit = (rate: ExchangeRate) => {
    setEditingName(rate.Name);
    setEditTyGiaVND(rate.TyGiaVND?.toString() || '');
    setEditCongShipVeVN(rate.CongShipVeVN?.toString() || '');
  };

  const handleUpdate = async () => {
    if (!editingName) return;

    const tyGia = parseFloat(editTyGiaVND);
    const congShip = parseFloat(editCongShipVeVN);

    if (isNaN(tyGia)) {
      setError('Tỷ giá phải là kiểu số');
      return;
    }
    if (isNaN(congShip)) {
      setError('Công ship về VN phải là kiểu số');
      return;
    }

    try {
      const res = await fetch(`/api/exchange-rates/${editingName}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingName,
          tyGiaVND: tyGia,
          congShipVeVN: congShip,
        }),
      });

      if (res.ok) {
        setEditingName(null);
        setEditTyGiaVND('');
        setEditCongShipVeVN('');
        fetchRates();
      } else {
        setError('Có lỗi trong quá trình thực hiện');
      }
    } catch (err) {
      console.error('Failed to update exchange rate:', err);
      setError('Có lỗi trong quá trình thực hiện');
    }
  };

  const handleCancel = () => {
    setEditingName(null);
    setEditTyGiaVND('');
    setEditCongShipVeVN('');
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    return num.toLocaleString('vi-VN');
  };

  if (loading) {
    return <div>Đang tải...</div>;
  }

  return (
    <div>
      <h1 className="titlead">Danh sách Tỷ giá</h1>
      <hr />

      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      {/* Table */}
      <table className="table table-bordered table-hover">
        <thead>
          <tr className="myGridHeader">
            <th style={{ width: '80px' }}>Thao tác</th>
            <th>Loại tiền</th>
            <th>Tỷ giá VND</th>
            <th>Công ship về VN</th>
          </tr>
        </thead>
        <tbody>
          {rates.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center">Không có dữ liệu</td>
            </tr>
          ) : (
            rates.map((rate) => (
              <tr key={rate.Name}>
                <td>
                  {editingName === rate.Name ? (
                    <>
                      <button onClick={handleUpdate} className="btn-link" style={{ marginRight: '5px' }}>
                        Update
                      </button>
                      <button onClick={handleCancel} className="btn-link">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleEdit(rate)} className="btn-link">
                      Edit
                    </button>
                  )}
                </td>
                <td>{rate.Name}</td>
                <td>
                  {editingName === rate.Name ? (
                    <input
                      type="text"
                      value={editTyGiaVND}
                      onChange={(e) => setEditTyGiaVND(e.target.value)}
                      style={{ width: '150px' }}
                    />
                  ) : (
                    formatNumber(rate.TyGiaVND)
                  )}
                </td>
                <td>
                  {editingName === rate.Name ? (
                    <input
                      type="text"
                      value={editCongShipVeVN}
                      onChange={(e) => setEditCongShipVeVN(e.target.value)}
                      style={{ width: '150px' }}
                    />
                  ) : (
                    formatNumber(rate.CongShipVeVN)
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
