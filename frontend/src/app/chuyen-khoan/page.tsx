'use client';

import { useState, useEffect } from 'react';
import { getBankAccounts, createDebt, getDebtManagementList, DebtManagementItem } from '@/lib/api';

interface BankAccount {
  ID: number;
  TenNganHang: string;
  SoTaiKhoan: string;
  ChuTaiKhoan: string;
}

/**
 * ChuyenKhoan Page - Bank Transfer Report
 * Converted from: UF/ChuyenKhoan.aspx
 * Uses backend: debt-reports (CongNo)
 */
export default function ChuyenKhoanPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<DebtManagementItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [ngayChuyenKhoan, setNgayChuyenKhoan] = useState('');
  const [soTienChuyenKhoan, setSoTienChuyenKhoan] = useState<number>(0);
  const [noiDung, setNoiDung] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [banks] = await Promise.all([getBankAccounts()]);
      setBankAccounts(banks || []);
      loadPendingTransfers();
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  const loadPendingTransfers = async () => {
    try {
      const response = await getDebtManagementList({
        status: 0, // pending
        page: 1,
        limit: 100,
      });
      setPendingTransfers(response.data || []);
    } catch (err) {
      console.error('Error loading pending transfers:', err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBank || !ngayChuyenKhoan || !soTienChuyenKhoan) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      // Create debt record (transfer request)
      await createDebt({
        username: '', // Will be filled by backend from auth
        noiDung: noiDung || `Chuyển khoản ${selectedBank}`,
        ngay: ngayChuyenKhoan,
        cr: soTienChuyenKhoan,
        loaiPhatSinh: 1, // payment
      });
      setSuccess('Báo chuyển khoản thành công');
      // Reset form
      setSelectedBank('');
      setNgayChuyenKhoan('');
      setSoTienChuyenKhoan(0);
      setNoiDung('');
      // Reload pending transfers
      loadPendingTransfers();
    } catch (err) {
      setError('Có lỗi khi tạo báo chuyển khoản');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">BÁO CHUYỂN KHOẢN</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

      {/* Form */}
      <div className="mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Chọn ngân hàng <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Chọn...</option>
            {bankAccounts.map((bank) => (
              <option key={bank.ID} value={bank.TenNganHang}>
                {bank.TenNganHang} - {bank.SoTaiKhoan}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Ngày chuyển khoản <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={ngayChuyenKhoan}
            onChange={(e) => setNgayChuyenKhoan(e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Số tiền chuyển khoản <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={soTienChuyenKhoan}
            onChange={(e) => setSoTienChuyenKhoan(Number(e.target.value))}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nội dung</label>
          <textarea
            value={noiDung}
            onChange={(e) => setNoiDung(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={2}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Báo chuyển khoản
        </button>
      </div>

      {/* Pending transfers */}
      <h3 className="text-xl font-bold mb-4">Các chuyển khoản đang chờ duyệt</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-2 py-1">Nội Dung</th>
              <th className="border border-gray-300 px-2 py-1">Ngày chuyển</th>
              <th className="border border-gray-300 px-2 py-1">Số tiền</th>
              <th className="border border-gray-300 px-2 py-1">Ghi Chú</th>
              <th className="border border-gray-300 px-2 py-1">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {pendingTransfers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              pendingTransfers.map((item) => (
                <tr key={item.CongNo_ID}>
                  <td className="border border-gray-300 px-2 py-1">{item.NoiDung}</td>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.NgayGhiNo
                      ? new Date(item.NgayGhiNo).toLocaleDateString('vi-VN')
                      : ''}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {formatNumber(item.CR)}
                  </td>
                  <td className="border border-gray-300 px-2 py-1">{item.GhiChu}</td>
                  <td className="border border-gray-300 px-2 py-1">
                    {item.Status ? 'Đã duyệt' : 'Chờ duyệt'}
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
