'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getShippingSlip, ShippingSlipData } from '@/lib/api';

/**
 * Shipping Slip By Shipment Lot Page
 *
 * Converted from admin/BaoCao_InPhieuShipTheoDotHang.aspx
 * Features:
 * - Print-friendly layout (print button hides on print)
 * - Customer info: HoTen, PhoneNumber, DiaChiNhanHang, NgayVeVN
 * - Financial info: TongTien, TienShipVeVN, TienShipTrongNuoc, TienHang, TienDatCoc, TienPhaiThanhToan
 * - Order items table: ID, MaSoHang, linkhinh, corlor, size, soluong, dongiaweb, tongtienVND
 * - Export to Excel button
 *
 * URL params: ?u=user&dh=orderId
 */

function ShippingSlipPageContent() {
  const searchParams = useSearchParams();
  const user = searchParams.get('u') || '';
  const orderId = searchParams.get('dh') || '';

  // Fetch shipping slip data
  const { data, isLoading, error } = useQuery<ShippingSlipData>({
    queryKey: ['shipping-slip', orderId, user],
    queryFn: () => getShippingSlip(orderId, user),
    enabled: !!orderId && !!user,
  });

  // Format currency - matching {0:n0} in C#
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format date - matching {0:dd/MM/yyyy} in C#
  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Handle export to Excel
  const handleExport = () => {
    // TODO: Implement export functionality if needed
    console.log('Export clicked');
  };

  // Print and close
  const handlePrint = () => {
    window.print();
    // window.close(); // Don't close automatically
  };

  if (!orderId || !user) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600">Thiếu thông tin</h1>
        <p className="mt-2 text-gray-600">Vui lòng cung cấp mã đơn hàng và người dùng</p>
        <p className="mt-1 text-sm text-gray-500">URL: ?u=user&dh=orderId</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-red-600">Lỗi tải dữ liệu</h1>
        <p className="mt-2 text-gray-600">{(error as Error).message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-xl font-bold text-gray-600">Không có dữ liệu</h1>
      </div>
    );
  }

  const { customerInfo, orderItems } = data;

  return (
    <div className="space-y-4">
      {/* Print button - matching btIn in aspx */}
      <div className="print:hidden">
        <button
          onClick={handlePrint}
          className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
        >
          In thông tin đợt hàng
        </button>

        {/* Export button - matching btExportToExcel in aspx */}
        <button
          onClick={handleExport}
          className="ml-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
        >
          Export to excel
        </button>
      </div>

      {/* Main content - matching pnThongTinHang in aspx */}
      <div className="rounded-lg border border-black bg-white p-6">
        <style>{`
          @media print {
            .printbutton { display: none !important; }
          }
          .myGrid { border-collapse: collapse; border: 1px solid black; }
          .myGrid th, .myGrid td { border: 1px solid black; }
          .myGridTitle { text-align: right; font-weight: bold; }
        `}</style>

        {/* Title - matching h1 in aspx */}
        <h1 className="mb-4 text-center text-xl font-bold text-blue-600">Thông tin hàng</h1>

        {/* Customer info table - matching table in aspx */}
        <table className="myGrid w-full" border={1}>
          <tbody>
            <tr>
              <td className="myGridTitle w-32">Người mua:</td>
              <td className="min-w-[150px] px-2 py-1">{customerInfo.HoTen}</td>
              <td className="myGridTitle w-32">Số điện thoại:</td>
              <td className="min-w-[150px] px-2 py-1">{customerInfo.PhoneNumber}</td>
            </tr>
            <tr>
              <td className="myGridTitle">Địa chỉ:</td>
              <td colSpan={3} className="px-2 py-1">{customerInfo.DiaChiNhanHang}</td>
            </tr>
            <tr>
              <td className="myGridTitle">Đợt hàng ngày:</td>
              <td className="px-2 py-1">{formatDate(customerInfo.NgayVeVN)}</td>
              <td className="myGridTitle">Tiền ship trong nước:</td>
              <td className="px-2 py-1 text-right">{formatCurrency(customerInfo.TienShipTrongNuoc)}</td>
            </tr>
            <tr>
              <td className="myGridTitle">Tiền hàng:</td>
              <td className="px-2 py-1 text-right">{formatCurrency(customerInfo.TienHang)}</td>
              <td className="myGridTitle">Tiền ship về VN:</td>
              <td className="px-2 py-1 text-right">{formatCurrency(customerInfo.TienShipVeVN)}</td>
            </tr>
            <tr>
              <td className="myGridTitle">Tổng tiền:</td>
              <td className="px-2 py-1 text-right font-bold">{formatCurrency(customerInfo.TongTien)}</td>
              <td className="myGridTitle">Tiền đặt cọc:</td>
              <td className="px-2 py-1 text-right">({formatCurrency(customerInfo.TienDatCoc)})</td>
            </tr>
            <tr>
              <td className="myGridTitle">Số tiền phải thanh toán:</td>
              <td className="px-2 py-1 text-right font-bold">{formatCurrency(customerInfo.TienPhaiThanhToan)}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
        </table>

        {/* Order items table - matching gvDonHang in aspx */}
        <div className="mt-6">
          <table className="myGrid w-full" border={1}>
            <thead className="bg-gray-100">
              <tr>
                <th className="px-2 py-2 text-left text-sm font-semibold">Mã ĐH</th>
                <th className="px-2 py-2 text-left text-sm font-semibold">Mã SP</th>
                <th className="px-2 py-2 text-left text-sm font-semibold">Hình</th>
                <th className="px-2 py-2 text-left text-sm font-semibold">Màu</th>
                <th className="px-2 py-2 text-left text-sm font-semibold">Size</th>
                <th className="px-2 py-2 text-left text-sm font-semibold">SL</th>
                <th className="px-2 py-2 text-right text-sm font-semibold">Giá web</th>
                <th className="px-2 py-2 text-right text-sm font-semibold">Tổng VNĐ</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={index}>
                  <td className="px-2 py-1">{item.ID}</td>
                  <td className="px-2 py-1">{item.MaSoHang}</td>
                  <td className="px-2 py-1">
                    {item.linkhinh && (
                      <img src={item.linkhinh} alt="product" height="50px" />
                    )}
                  </td>
                  <td className="px-2 py-1">{item.corlor}</td>
                  <td className="px-2 py-1">{item.size}</td>
                  <td className="px-2 py-1">{item.soluong}</td>
                  <td className="px-2 py-1 text-right">{formatCurrency(item.dongiaweb)}</td>
                  <td className="px-2 py-1 text-right">{formatCurrency(item.tongtienVND)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function ShippingSlipPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShippingSlipPageContent />
    </Suspense>
  );
}
