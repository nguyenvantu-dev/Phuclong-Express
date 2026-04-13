'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

interface Batch {
  ID: number;
  UserName: string;
  TrackingNumber: string;
  OrderNumber: string;
  NgayDatHang: string;
  TenLoHang: string;
  TinhTrang: string;
  LoaiTien: string;
  TyGia: number;
  NgayDenDuKien: string;
  NgayDenThucTe: string;
  GhiChu: string;
  NhaVanChuyenID: number;
  NguoiTao: string;
  NgayTao: string;
}

interface ShipCost {
  ID: number;
  LoaiHangShipID: number;
  TenLoaiHangShip: string;
  CanNang: number;
  DonGia: number;
  TongTienShipVeVN_VND: number;
}

interface Custom {
  ID: number;
  LoaiHangThueHaiQuanID: number;
  TenLoaiHangThueHaiQuan: string;
  CanNangSoLuongGiaTri: number;
  DonGia: number;
  TongTienThueHaiQuan_VND: number;
}

interface BatchDetails extends Batch {
  shipCosts: ShipCost[];
  customs: Custom[];
}

const getBatchDetails = async (id: number) => {
  const response = await apiClient.get<BatchDetails>(`/batches/${id}/details`);
  return response.data;
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const formatCurrency = (amount: number | null) => {
  if (!amount) return '0';
  return new Intl.NumberFormat('vi-VN').format(amount);
};

export default function BatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = Number(params.id);

  const { data: batch, isLoading, error } = useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatchDetails(id),
  });

  // Ship costs mutation
  const deleteShipCostMutation = useMutation({
    mutationFn: (shipCostId: number) =>
      apiClient.delete(`/batches/${id}/ship-costs/${shipCostId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', id] });
    },
  });

  // Customs mutation
  const deleteCustomsMutation = useMutation({
    mutationFn: (customsId: number) =>
      apiClient.delete(`/batches/${id}/customs/${customsId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (error || !batch) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-500">Lỗi tải dữ liệu</div>
      </div>
    );
  }

  const totalShipCost = batch.shipCosts?.reduce((sum, item) => sum + (item.TongTienShipVeVN_VND || 0), 0) || 0;
  const totalCustoms = batch.customs?.reduce((sum, item) => sum + (item.TongTienThueHaiQuan_VND || 0), 0) || 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chi tiết lô hàng: {batch.TenLoHang}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/batches/${id}/edit`)}
            className="bg-[#14264b] text-white px-4 py-2 rounded hover:bg-[#1e3a6e]"
          >
            Sửa
          </button>
          <button
            onClick={() => router.push('/admin/batches')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Quay lại
          </button>
        </div>
      </div>

      {/* Batch Info */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-3">Thông tin lô hàng</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-gray-600">ID:</span> {batch.ID}
          </div>
          <div>
            <span className="text-gray-600">Username:</span> {batch.UserName}
          </div>
          <div>
            <span className="text-gray-600">Tracking Number:</span> {batch.TrackingNumber}
          </div>
          <div>
            <span className="text-gray-600">Order Number:</span> {batch.OrderNumber}
          </div>
          <div>
            <span className="text-gray-600">Ngày đặt:</span> {formatDate(batch.NgayDatHang)}
          </div>
          <div>
            <span className="text-gray-600">Ngày dự kiến:</span> {formatDate(batch.NgayDenDuKien)}
          </div>
          <div>
            <span className="text-gray-600">Ngày thực tế:</span> {formatDate(batch.NgayDenThucTe)}
          </div>
          <div>
            <span className="text-gray-600">Tình trạng:</span> {batch.TinhTrang}
          </div>
          <div>
            <span className="text-gray-600">Loại tiền:</span> {batch.LoaiTien}
          </div>
          <div>
            <span className="text-gray-600">Tỷ giá:</span> {batch.TyGia}
          </div>
          <div>
            <span className="text-gray-600">Người tạo:</span> {batch.NguoiTao}
          </div>
          <div>
            <span className="text-gray-600">Ngày tạo:</span> {formatDate(batch.NgayTao)}
          </div>
        </div>
        {batch.GhiChu && (
          <div className="mt-4">
            <span className="text-gray-600">Ghi chú:</span> {batch.GhiChu}
          </div>
        )}
      </div>

      {/* Ship Costs */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-3">Phí ship về Việt Nam</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Loại hàng</th>
              <th className="px-4 py-2 text-right">Cân nặng</th>
              <th className="px-4 py-2 text-right">Đơn giá</th>
              <th className="px-4 py-2 text-right">Tổng tiền (VND)</th>
              <th className="px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batch.shipCosts?.map((item) => (
              <tr key={item.ID}>
                <td className="px-4 py-2">{item.TenLoaiHangShip}</td>
                <td className="px-4 py-2 text-right">{item.CanNang}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.DonGia)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.TongTienShipVeVN_VND)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteShipCostMutation.mutate(item.ID)}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right font-semibold">Tổng:</td>
              <td className="px-4 py-2 text-right font-semibold">{formatCurrency(totalShipCost)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Customs */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-3">Thuế hải quan</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Loại hàng</th>
              <th className="px-4 py-2 text-right">Cân nặng/SL/Giá trị</th>
              <th className="px-4 py-2 text-right">Đơn giá</th>
              <th className="px-4 py-2 text-right">Tổng tiền (VND)</th>
              <th className="px-4 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {batch.customs?.map((item) => (
              <tr key={item.ID}>
                <td className="px-4 py-2">{item.TenLoaiHangThueHaiQuan}</td>
                <td className="px-4 py-2 text-right">{item.CanNangSoLuongGiaTri}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.DonGia)}</td>
                <td className="px-4 py-2 text-right">{formatCurrency(item.TongTienThueHaiQuan_VND)}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteCustomsMutation.mutate(item.ID)}
                    className="text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={3} className="px-4 py-2 text-right font-semibold">Tổng:</td>
              <td className="px-4 py-2 text-right font-semibold">{formatCurrency(totalCustoms)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Tracking List */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Danh sách tracking</h2>
        <p className="text-gray-500">Danh sách tracking thuộc lô hàng này</p>
      </div>
    </div>
  );
}
