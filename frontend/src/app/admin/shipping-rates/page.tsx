'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface ShippingRate {
  ID: number;
  LoaiHangID: number;
  TenLoaiHang: string;
  LoaiTien: string;
  TienCongShipVeVN: number;
  KhachBuon: boolean;
}

export default function ShippingRatesListPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadRates() {
      try {
        const { data } = await apiClient.get('/shipping-fees/cong-ship-ve-vn');
        if (Array.isArray(data)) {
          setRates(data);
        }
      } catch (error) {
        console.error('Failed to load rates:', error);
      }
    }
    loadRates();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa không?')) return;

    try {
      await apiClient.delete(`/shipping-fees/cong-ship-ve-vn/${id}`);
      setRates(rates.filter(r => r.ID !== id));
    } catch (error) {
      alert('Xóa thất bại');
    }
  };

  return (
    <div>
      <div className="mytab">
        <a href="/admin/shipping-rates" style={{ backgroundColor: 'darkgray' }}>
          Danh sách Công ship về VN
        </a>
        {' | '}
        <a href="/admin/shipping-rates/new">Tạo mới Công ship về VN</a>
      </div>

      <h1 className="titlead">DANH SÁCH CÔNG SHIP VỀ VN</h1>

      <table className="table table-bordered table-hover">
        <thead>
          <tr className="myGridHeader">
            <th></th>
            <th>ID</th>
            <th>Loại hàng</th>
            <th>Loại tiền</th>
            <th>Tiền công ship về VN</th>
            <th>Khách buôn?</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rates.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">Không có dữ liệu</td>
            </tr>
          ) : (
            rates.map(rate => (
              <tr key={rate.ID}>
                <td>
                  <a href={`/admin/shipping-rates/${rate.ID}`}>Detail</a>
                </td>
                <td>{rate.ID}</td>
                <td>{rate.TenLoaiHang}</td>
                <td>{rate.LoaiTien}</td>
                <td>{rate.TienCongShipVeVN?.toLocaleString('vi-VN')}</td>
                <td>{rate.KhachBuon ? 'Có' : 'Không'}</td>
                <td>
                  <button
                    className="btn btn-link"
                    onClick={() => handleDelete(rate.ID)}
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