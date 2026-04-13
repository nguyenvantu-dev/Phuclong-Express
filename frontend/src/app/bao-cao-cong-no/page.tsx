'use client';

import { useState, useEffect } from 'react';
import { getDebtReports, getPeriods, getDebtReportUsers } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth-context';

interface DebtItem {
  CongNo_ID: number;
  NoiDung: string;
  NgayGhiNo: string;
  DR: number;
  CR: number;
  LuyKe: number;
  GhiChu: string;
}

interface PeriodItem {
  KyID: number;
  TenKy: string;
}

interface UserItem {
  Id: string;
  UserName: string;
}

interface Summary {
  dauKy: number;
  tongPhatSinh: number;
  tongThanhToan: number;
  cuoiKy: number;
}

/**
 * BaoCaoCongNo Page - Debt Balance Report
 * Converted from: UF/BaoCao_CanDoiCongNo_User.aspx
 * Uses backend: debt-reports
 */
export default function BaoCaoCongNoPage() {
  const { user } = useAuth();
  const [debtItems, setDebtItems] = useState<DebtItem[]>([]);
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [selectedFromKyId, setSelectedFromKyId] = useState<number>(-1);
  const [selectedToKyId, setSelectedToKyId] = useState<number>(-1);

  // Summary
  const [tienMuaHangA, setTienMuaHangA] = useState<number>(0);
  const [tienDaTraB, setTienDaTraB] = useState<number>(0);
  const [tienCompletedC, setTienCompletedC] = useState<number>(0);
  const [tienNoE, setTienNoE] = useState<number>(0);
  const [tienHangChuaVeF, setTienHangChuaVeF] = useState<number>(0);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [periodList, userList] = await Promise.all([
        getPeriods(),
        getDebtReportUsers(),
      ]);
      setPeriods(periodList || []);
      setUsers(userList || []);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const loadDebtData = async () => {
    if (!user?.username) return;

    setIsLoading(true);
    try {
      const response = await getDebtReports({
        username: user.username,
        fromKyId: selectedFromKyId > 0 ? selectedFromKyId : undefined,
        toKyId: selectedToKyId > 0 ? selectedToKyId : undefined,
        page,
        limit,
      });
      setDebtItems(response.data || []);
      setTotal(response.total || 0);

      // Use summary from backend
      if (response.summary) {
        setTienMuaHangA(response.summary.tongPhatSinh || 0);
        setTienDaTraB(response.summary.tongThanhToan || 0);
        setTienCompletedC(0); // Need separate query
        setTienNoE(response.summary.cuoiKy || 0);
        setTienHangChuaVeF(0); // Need separate query
      }
    } catch (error) {
      console.error('Error loading debt data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDebtData();
  }, [page, selectedFromKyId, selectedToKyId]);

  const formatNumber = (num: number) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-[#14264b]">BẢNG CÂN ĐỐI CÔNG NỢ</h1>

      {/* Period Filter */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-[#14264b]/5 rounded-xl">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Từ kỳ:</label>
          <select
            value={selectedFromKyId}
            onChange={(e) => setSelectedFromKyId(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14264b]"
          >
            <option value={-1}>Tất cả</option>
            {periods.map((p) => (
              <option key={p.KyID} value={p.KyID}>{p.TenKy}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-700">Đến kỳ:</label>
          <select
            value={selectedToKyId}
            onChange={(e) => setSelectedToKyId(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#14264b]"
          >
            <option value={-1}>Tất cả</option>
            {periods.map((p) => (
              <option key={p.KyID} value={p.KyID}>{p.TenKy}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => { setPage(1); loadDebtData(); }}
          className="px-4 py-2 bg-[#14264b] text-white rounded-lg hover:bg-[#1f3a6d] cursor-pointer"
        >
          Lọc
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <svg className="w-8 h-8 animate-spin text-[#14264b] mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="mt-2 text-slate-600">Đang tải...</p>
        </div>
      ) : (
        <>
          {/* Summary table */}
          <div className="bg-white rounded-xl border border-[#14264b]/20 shadow-sm overflow-hidden mb-6">
            <table className="w-full" border={1}>
              <thead>
                <tr className="bg-[#14264b]/10">
                  <th className="border-b border-[#14264b]/20 px-3 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Hạng mục</th>
                  <th className="border-b border-[#14264b]/20 px-3 py-2.5 text-right text-[#14264b] font-semibold text-xs uppercase tracking-wide">Giá trị</th>
                  <th className="border-b border-[#14264b]/20 px-3 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-right font-bold text-slate-700">
                    Số tiền mua hàng (A)
                  </td>
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-right font-bold text-lg text-[#14264b]">
                    {formatNumber(tienMuaHangA)}
                  </td>
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-left text-slate-500 text-sm">
                    Tổng số tiền mua hàng của các món hàng đang ở status là "Ordered", "Completed", "Shipped" và các khoản phí
                  </td>
                </tr>
                <tr className="bg-[#14264b]/5">
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-right font-bold text-slate-700">
                    Số tiền đã trả (B)
                  </td>
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-right font-bold text-lg text-emerald-600">
                    {formatNumber(tienDaTraB)}
                  </td>
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-left text-slate-500 text-sm">
                    Tổng số tiền đã trả (hoặc chuyển khoản).
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-right font-bold text-slate-700">
                    Tổng tiền đơn hàng đã nhận (C)
                  </td>
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-right font-bold text-lg text-blue-600">
                    {formatNumber(tienCompletedC)}
                  </td>
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-left text-slate-500 text-sm">
                    Tổng số tiền mua hàng của các món hàng đang ở status là "Completed"
                  </td>
                </tr>
                <tr className="bg-[#14264b]/5">
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-right font-bold text-slate-700">
                    Số tiền còn nợ web (D)
                  </td>
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-right font-bold text-lg text-red-600">
                    {formatNumber(tienNoE)}
                  </td>
                  <td className="border-b border-[#14264b]/10 px-3 py-2.5 text-left text-slate-500 text-sm">
                    (Số tiền mua hàng) - (Số tiền đã trả)
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="border-b border-[#14264b]/20 px-3 py-2.5 text-right font-bold text-slate-700">
                    Tiền hàng web chưa giao (E)
                  </td>
                  <td className="border-b border-[#14264b]/20 px-3 py-2.5 text-right font-bold text-lg text-amber-600">
                    {formatNumber(tienHangChuaVeF)}
                  </td>
                  <td className="border-b border-[#14264b]/20 px-3 py-2.5 text-left text-slate-500 text-sm">
                    Tiền hàng đang ship, hay chưa về VN
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-bold mb-3 text-[#14264b]">Thông tin chi tiết</h3>

          {/* Detail table */}
          <div className="overflow-x-auto rounded-xl border border-[#14264b]/20 shadow-sm">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#14264b]/10">
                  <th className="border-b border-[#14264b]/20 px-2 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Mã QL</th>
                  <th className="border-b border-[#14264b]/20 px-2 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Nội Dung</th>
                  <th className="border-b border-[#14264b]/20 px-2 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Ngày phát sinh</th>
                  <th className="border-b border-[#14264b]/20 px-2 py-2.5 text-right text-[#14264b] font-semibold text-xs uppercase tracking-wide">Khoản nợ</th>
                  <th className="border-b border-[#14264b]/20 px-2 py-2.5 text-right text-[#14264b] font-semibold text-xs uppercase tracking-wide">Khoản có</th>
                  <th className="border-b border-[#14264b]/20 px-2 py-2.5 text-right text-[#14264b] font-semibold text-xs uppercase tracking-wide">Lũy kế</th>
                  <th className="border-b border-[#14264b]/20 px-2 py-2.5 text-left text-[#14264b] font-semibold text-xs uppercase tracking-wide">Ghi Chú</th>
                </tr>
              </thead>
              <tbody>
                {debtItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  debtItems.map((item) => (
                    <tr key={item.CongNo_ID} className="bg-white">
                      <td className="border-b border-[#14264b]/10 px-2 py-2.5 text-[#14264b] font-medium">{item.CongNo_ID}</td>
                      <td className="border-b border-[#14264b]/10 px-2 py-2.5 text-slate-700">{item.NoiDung}</td>
                      <td className="border-b border-[#14264b]/10 px-2 py-2.5 text-slate-600">
                        {item.NgayGhiNo
                          ? new Date(item.NgayGhiNo).toLocaleDateString('vi-VN')
                          : ''}
                      </td>
                      <td className="border-b border-[#14264b]/10 px-2 py-2.5 text-right text-red-600 font-medium">
                        {formatNumber(item.DR)}
                      </td>
                      <td className="border-b border-[#14264b]/10 px-2 py-2.5 text-right text-emerald-600 font-medium">
                        {formatNumber(item.CR)}
                      </td>
                      <td className="border-b border-[#14264b]/10 px-2 py-2.5 text-right font-bold text-[#14264b]">
                        {formatNumber(item.LuyKe)}
                      </td>
                      <td className="border-b border-[#14264b]/10 px-2 py-2.5 text-slate-500">{item.GhiChu}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-[#14264b]/5 hover:border-[#14264b]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
              >
                Previous
              </button>
              <span className="px-4 py-1.5 text-slate-600">
                Trang <span className="font-medium text-[#14264b]">{page}</span> / {totalPages} (Tổng: {total})
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-[#14264b]/5 hover:border-[#14264b]/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
