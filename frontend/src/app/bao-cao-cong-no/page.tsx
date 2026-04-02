'use client';

import { useState, useEffect } from 'react';
import { getDebtReports, getPeriods, getDebtReportUsers } from '@/lib/api';

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
  const [debtItems, setDebtItems] = useState<DebtItem[]>([]);
  const [periods, setPeriods] = useState<PeriodItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const response = await getDebtReports({
        page,
        limit,
      });
      setDebtItems(response.data || []);
      setTotal(response.total || 0);

      // Calculate summary from data
      let drTotal = 0;
      let crTotal = 0;
      (response.data || []).forEach((item: DebtItem) => {
        drTotal += item.DR || 0;
        crTotal += item.CR || 0;
      });

      setTienMuaHangA(drTotal);
      setTienDaTraB(crTotal);
      setTienCompletedC(0); // Need separate query
      setTienNoE(drTotal - crTotal);
      setTienHangChuaVeF(0); // Need separate query
    } catch (error) {
      console.error('Error loading debt data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDebtData();
  }, [page]);

  const formatNumber = (num: number) => {
    if (!num && num !== 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">BẢNG CÂN ĐỐI CÔNG NỢ</h1>

      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <>
          {/* Summary table */}
          <table className="w-full mb-6 border" border={1}>
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left">Hạng mục</th>
                <th className="border border-gray-300 px-2 py-1 text-right">Giá trị</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-right font-bold">
                  Số tiền mua hàng (A) :
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {formatNumber(tienMuaHangA)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-left">
                  Tổng số tiền mua hàng của các món hàng đang ở status là "Ordered", "Completed", "Shipped" và các khoản phí
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-right font-bold">
                  Số tiền đã trả (B) :
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {formatNumber(tienDaTraB)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-left">
                  Tổng số tiền đã trả (hoặc chuyển khoản).
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-right font-bold">
                  Tổng tiền đơn hàng đã nhận (C) :
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {formatNumber(tienCompletedC)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-left">
                  Tổng số tiền mua hàng của các món hàng đang ở status là "Completed"
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-right font-bold">
                  Số tiền còn nợ web (D) :
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {formatNumber(tienNoE)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-left">
                  (Số tiền mua hàng) - (Số tiền đã trả)
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-2 py-1 text-right font-bold">
                  Tiền hàng web chưa giao (E) :
                </td>
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {formatNumber(tienHangChuaVeF)}
                </td>
                <td className="border border-gray-300 px-2 py-1 text-left">
                  Tiền hàng đang ship, hay chưa về VN
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-xl font-bold mb-4">Thông tin chi tiết</h3>

          {/* Detail table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-2 py-1">Mã QL</th>
                  <th className="border border-gray-300 px-2 py-1">Nội Dung</th>
                  <th className="border border-gray-300 px-2 py-1">Ngày phát sinh</th>
                  <th className="border border-gray-300 px-2 py-1">Khoản nợ</th>
                  <th className="border border-gray-300 px-2 py-1">Khoản có</th>
                  <th className="border border-gray-300 px-2 py-1">Lũy kế</th>
                  <th className="border border-gray-300 px-2 py-1">Ghi Chú</th>
                </tr>
              </thead>
              <tbody>
                {debtItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  debtItems.map((item) => (
                    <tr key={item.CongNo_ID}>
                      <td className="border border-gray-300 px-2 py-1">{item.CongNo_ID}</td>
                      <td className="border border-gray-300 px-2 py-1">{item.NoiDung}</td>
                      <td className="border border-gray-300 px-2 py-1">
                        {item.NgayGhiNo
                          ? new Date(item.NgayGhiNo).toLocaleDateString('vi-VN')
                          : ''}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {formatNumber(item.DR)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {formatNumber(item.CR)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1 text-right">
                        {formatNumber(item.LuyKe)}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">{item.GhiChu}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1">
                Trang {page} / {totalPages} (Tổng: {total})
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-50"
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
