'use client';

import { useState, useEffect } from 'react';
import { getBankAccounts, createDebt, getDebtManagementList, DebtManagementItem } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth-context';

interface BankAccount {
  ID: number;
  TenTaiKhoanNganHang: string;
  GhiChu?: string;
}

/**
 * ChuyenKhoan Page - Bank Transfer Report
 * Converted from: UF/ChuyenKhoan.aspx
 * Uses backend: debt-reports (CongNo)
 */
export default function ChuyenKhoanPage() {
  const { user } = useAuth();
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
    if (!user?.username) return;

    try {
      const response = await getDebtManagementList({
        username: user.username,
        loaiPhatSinh: '2', // style=2 for bank transfer
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

    if (!user?.username) {
      setError('Vui lòng đăng nhập để thực hiện chức năng này');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      // Create debt record (transfer request) - style=2 for bank transfer
      await createDebt({
        username: user.username,
        noiDung: noiDung || `Chuyển khoản ${selectedBank}`,
        ngay: ngayChuyenKhoan,
        cr: soTienChuyenKhoan,
        loaiPhatSinh: 2, // bank transfer style
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
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-700">BÁO CHUYỂN KHOẢN</h2>

      {error && <div className="text-red-500 mb-4 bg-red-50 px-4 py-3 rounded-lg">{error}</div>}
      {success && <div className="text-emerald-500 mb-4 bg-emerald-50 px-4 py-3 rounded-lg">{success}</div>}

      {/* Form */}
      <div className="bg-white rounded-xl border border-cyan-200 shadow-sm p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Chọn ngân hàng <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
            >
              <option value="">Chọn...</option>
              {bankAccounts.map((bank) => (
                <option key={bank.ID} value={bank.TenTaiKhoanNganHang}>
                  {bank.TenTaiKhoanNganHang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Ngày chuyển khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={ngayChuyenKhoan}
              onChange={(e) => setNgayChuyenKhoan(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">
              Số tiền chuyển khoản <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={soTienChuyenKhoan}
              onChange={(e) => setSoTienChuyenKhoan(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700">Nội dung</label>
            <textarea
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-150"
              rows={2}
              placeholder="Nội dung chuyển khoản..."
            />
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 cursor-pointer transition-colors duration-150 shadow-sm hover:shadow disabled:opacity-50"
          >
            Báo chuyển khoản
          </button>
        </div>
      </div>

      {/* Pending transfers */}
      <h3 className="text-xl font-bold mb-3 text-cyan-700">Các chuyển khoản đang chờ duyệt</h3>
      <div className="overflow-x-auto rounded-xl border border-cyan-200 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-cyan-100">
              <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Nội Dung</th>
              <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ngày chuyển</th>
              <th className="border-b border-cyan-200 px-3 py-2.5 text-right text-cyan-700 font-semibold text-xs uppercase tracking-wide">Số tiền</th>
              <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Ghi Chú</th>
              <th className="border-b border-cyan-200 px-3 py-2.5 text-left text-cyan-700 font-semibold text-xs uppercase tracking-wide">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {pendingTransfers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              pendingTransfers.map((item) => (
                <tr key={item.CongNo_ID} className="bg-white">
                  <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-700">{item.NoiDung}</td>
                  <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-600">
                    {item.NgayGhiNo
                      ? new Date(item.NgayGhiNo).toLocaleDateString('vi-VN')
                      : ''}
                  </td>
                  <td className="border-b border-cyan-100 px-3 py-2.5 text-right font-semibold text-cyan-700">
                    {formatNumber(item.CR)}
                  </td>
                  <td className="border-b border-cyan-100 px-3 py-2.5 text-slate-500">{item.GhiChu}</td>
                  <td className="border-b border-cyan-100 px-3 py-2.5">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.Status
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.Status ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
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
