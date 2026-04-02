'use client';

import { useState } from 'react';

const VIETNAM_CITIES = [
  '', 'An Giang', 'Bà Rịa-Vũng Tàu', 'Bạc Liêu', 'Bắc Kạn', 'Bắc Giang', 'Bắc Ninh',
  'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng',
  'Cần Thơ (TP)', 'Đà Nẵng (TP)', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai',
  'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội (TP)', 'Hà Tây', 'Hà Tĩnh',
  'Hải Dương', 'Hải Phòng (TP)', 'Hòa Bình', 'Hồ Chí Minh (TP)', 'Hậu Giang', 'Hưng Yên',
  'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lào Cai', 'Lạng Sơn', 'Lâm Đồng',
  'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng',
  'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên - Huế',
  'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const VUNG_MIEN = ['', 'Bắc', 'Trung', 'Nam'];

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    hoTen: '',
    vungMien: '',
    diaChi: '',
    tinhThanh: '',
    phoneNumber: '',
    email: '',
    soTaiKhoan: '',
    hinhThucNhanHang: '',
    khachBuon: false,
    linkTaiKhoanMang: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (key: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!formData.username || !formData.password || !formData.hoTen) {
      setError('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu và nhập lại mật khẩu không khớp');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email || formData.username + '@example.com',
          hoTen: formData.hoTen,
          diaChi: formData.diaChi,
          tinhThanh: formData.tinhThanh,
          phoneNumber: formData.phoneNumber,
          soTaiKhoan: formData.soTaiKhoan,
          hinhThucNhanHang: formData.hinhThucNhanHang,
          khachBuon: formData.khachBuon,
          linkTaiKhoanMang: formData.linkTaiKhoanMang,
          vungMien: formData.vungMien,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          hoTen: '',
          vungMien: '',
          diaChi: '',
          tinhThanh: '',
          phoneNumber: '',
          email: '',
          soTaiKhoan: '',
          hinhThucNhanHang: '',
          khachBuon: false,
          linkTaiKhoanMang: '',
        });
        setTimeout(() => {
          window.location.href = '/admin/users';
        }, 1500);
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (err) {
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Tạo mới tài khoản</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">Tạo tài khoản thành công! Redirecting...</div>}

      <div className="form-horizontal">
        <h4>Tạo mới tài khoản.</h4>
        <hr />

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="col-md-2 control-label">Tên đăng nhập *</label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Mật khẩu *</label>
            <div className="col-md-10">
              <input
                type="password"
                className="form-control"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Nhập lại mật khẩu *</label>
            <div className="col-md-10">
              <input
                type="password"
                className="form-control"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Họ tên *</label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                value={formData.hoTen}
                onChange={(e) => handleChange('hoTen', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Vùng miền</label>
            <div className="col-md-10">
              <select
                className="form-control"
                value={formData.vungMien}
                onChange={(e) => handleChange('vungMien', e.target.value)}
              >
                {VUNG_MIEN.map(v => (
                  <option key={v} value={v}>{v || '--Chọn--'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Địa chỉ</label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                value={formData.diaChi}
                onChange={(e) => handleChange('diaChi', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Tỉnh/Thành phố</label>
            <div className="col-md-10">
              <select
                className="form-control"
                value={formData.tinhThanh}
                onChange={(e) => handleChange('tinhThanh', e.target.value)}
              >
                {VIETNAM_CITIES.map(city => (
                  <option key={city} value={city}>{city || '--Chọn--'}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Số điện thoại</label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Email</label>
            <div className="col-md-10">
              <input
                type="email"
                className="form-control"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Số tài khoản</label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                value={formData.soTaiKhoan}
                onChange={(e) => handleChange('soTaiKhoan', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Hình thức nhận hàng</label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                value={formData.hinhThucNhanHang}
                onChange={(e) => handleChange('hinhThucNhanHang', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Khách buôn</label>
            <div className="col-md-10">
              <input
                type="checkbox"
                checked={formData.khachBuon}
                onChange={(e) => handleChange('khachBuon', e.target.checked)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="col-md-2 control-label">Link FB</label>
            <div className="col-md-10">
              <input
                type="text"
                className="form-control"
                value={formData.linkTaiKhoanMang}
                onChange={(e) => handleChange('linkTaiKhoanMang', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="col-md-offset-2 col-md-10">
              <button type="submit" className="btn btn-default" disabled={loading}>
                {loading ? 'Creating...' : 'Tạo Tài khoản'}
              </button>
              <button
                type="button"
                className="btn btn-default"
                onClick={() => window.location.href = '/admin/users'}
                style={{ marginLeft: '10px' }}
              >
                Thôi
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}