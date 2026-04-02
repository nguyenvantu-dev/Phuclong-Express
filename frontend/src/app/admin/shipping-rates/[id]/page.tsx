'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProductType {
  LoaiHangID: number;
  TenLoaiHang: string;
}

interface Currency {
  Name: string;
}

export default function ShippingRatesEditPage() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [formData, setFormData] = useState({
    loaiHangID: '',
    loaiTien: '',
    tienCongShipVeVN: '',
    khachBuon: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const isEdit = !!id;

  useEffect(() => {
    async function loadData() {
      try {
        // Load product types
        const ptRes = await fetch('/api/shipping-fees/product-types');
        const ptData = await ptRes.json();
        if (Array.isArray(ptData)) {
          setProductTypes(ptData);
        }

        // Load currencies (TyGia)
        const curRes = await fetch('/api/shipping-fees/currencies');
        const curData = await curRes.json();
        if (Array.isArray(curData)) {
          setCurrencies(curData);
        }

        // Load existing data if editing
        if (id) {
          const rateRes = await fetch(`/api/shipping-fees/cong-ship-ve-vn/${id}`);
          const rateData = await rateRes.json();
          if (rateData) {
            setFormData({
              loaiHangID: rateData.LoaiHangID?.toString() || '',
              loaiTien: rateData.LoaiTien || '',
              tienCongShipVeVN: rateData.TienCongShipVeVN?.toString() || '',
              khachBuon: rateData.KhachBuon || false,
            });
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.loaiHangID || !formData.loaiTien || !formData.tienCongShipVeVN) {
      setError('Vui lòng nhập đủ thông tin');
      return;
    }

    const tien = parseFloat(formData.tienCongShipVeVN);
    if (isNaN(tien)) {
      setError('Tiền công ship về VN phải là kiểu số');
      return;
    }

    setLoading(true);

    try {
      const url = isEdit
        ? `/api/shipping-fees/cong-ship-ve-vn/${id}`
        : '/api/shipping-fees/cong-ship-ve-vn';

      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loaiHangID: parseInt(formData.loaiHangID),
          loaiTien: formData.loaiTien,
          tienCongShipVeVN: tien,
          khachBuon: formData.khachBuon,
        }),
      });

      if (res.ok) {
        router.push('/admin/shipping-rates');
      } else {
        setError('Có lỗi trong quá trình thao tác');
      }
    } catch (error) {
      setError('Có lỗi trong quá trình thao tác');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <div className="mytab">
        <a href="/admin/shipping-rates">Danh sách Công ship về VN</a>
        {' | '}
        <a href="/admin/shipping-rates/new" style={{ backgroundColor: 'darkgray' }}>
          Tạo mới Công ship về VN
        </a>
      </div>

      <h1 className="titlead">TẠO MỚI CÔNG SHIP VỀ VN</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleSubmit}>
        <table style={{ width: '100%' }}>
          <tbody>
            <tr>
              <td style={{ width: '150px' }}>Loại hàng</td>
              <td>
                <select
                  className="form-control"
                  value={formData.loaiHangID}
                  onChange={(e) => handleChange('loaiHangID', e.target.value)}
                >
                  <option value="">--Chọn--</option>
                  {productTypes.map(pt => (
                    <option key={pt.LoaiHangID} value={pt.LoaiHangID}>
                      {pt.TenLoaiHang}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td style={{ width: '150px' }}>Loại tiền</td>
              <td>
                <select
                  className="form-control"
                  value={formData.loaiTien}
                  onChange={(e) => handleChange('loaiTien', e.target.value)}
                >
                  <option value="">--Chọn--</option>
                  {currencies.map(cur => (
                    <option key={cur.Name} value={cur.Name}>
                      {cur.Name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td style={{ width: '150px' }}>Tiền công ship về VN</td>
              <td>
                <input
                  type="text"
                  className="form-control"
                  style={{ width: '100%' }}
                  value={formData.tienCongShipVeVN}
                  onChange={(e) => handleChange('tienCongShipVeVN', e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td style={{ width: '150px' }}>Khách buôn?</td>
              <td>
                <input
                  type="checkbox"
                  checked={formData.khachBuon}
                  onChange={(e) => handleChange('khachBuon', e.target.checked)}
                />
              </td>
            </tr>
            <tr>
              <td colSpan={6} style={{ textAlign: 'center' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Đang xử lý...' : 'Cập nhật'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
}