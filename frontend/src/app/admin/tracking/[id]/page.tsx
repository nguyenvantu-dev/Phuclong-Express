'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface Tracking {
  ID: number;
  UserName: string;
  TrackingNumber: string;
  OrderNumber: string;
  NgayDatHang: string;
  TenLoHang: string;
  NhaVanChuyenID: number;
  QuocGiaID: number;
  TenQuocGia: string;
  TinhTrang: string;
  GhiChu: string;
  Kien: string;
  Mawb: string;
  Hawb: string;
  NguoiTao: string;
  NgayTao: string;
}

interface TrackingDetail extends Tracking {
  chiTietTracking: any[];
  lichSuTracking: any[];
}

const getTrackingDetails = async (id: number) => {
  const response = await axios.get<TrackingDetail>(`${API_URL}/admin/tracking/${id}/details`);
  return response.data;
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

const statusColors: Record<string, string> = {
  Received: 'bg-blue-100 text-blue-800',
  InTransit: 'bg-yellow-100 text-yellow-800',
  InVN: 'bg-orange-100 text-orange-800',
  VNTransit: 'bg-purple-100 text-purple-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

export default function TrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { data: tracking, isLoading, error } = useQuery({
    queryKey: ['tracking', id],
    queryFn: () => getTrackingDetails(id),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (error || !tracking) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-500">Lỗi tải dữ liệu</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Chi tiết tracking: {tracking.TrackingNumber}</h1>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/tracking/${id}/edit`)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sửa
          </button>
          <button
            onClick={() => router.push('/admin/tracking')}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Quay lại
          </button>
        </div>
      </div>

      {/* Tracking Info */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-3">Thông tin tracking</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-gray-600">ID:</span> {tracking.ID}
          </div>
          <div>
            <span className="text-gray-600">Username:</span> {tracking.UserName}
          </div>
          <div>
            <span className="text-gray-600">Tracking Number:</span> {tracking.TrackingNumber}
          </div>
          <div>
            <span className="text-gray-600">Order Number:</span> {tracking.OrderNumber}
          </div>
          <div>
            <span className="text-gray-600">Ngày đặt:</span> {formatDate(tracking.NgayDatHang)}
          </div>
          <div>
            <span className="text-gray-600">Lô hàng:</span> {tracking.TenLoHang}
          </div>
          <div>
            <span className="text-gray-600">Tình trạng:</span>{' '}
            <span className={`px-2 py-1 rounded text-xs ${statusColors[tracking.TinhTrang]}`}>
              {tracking.TinhTrang}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Quốc gia:</span> {tracking.TenQuocGia}
          </div>
          <div>
            <span className="text-gray-600">Kiện:</span> {tracking.Kien}
          </div>
          <div>
            <span className="text-gray-600">MAWB:</span> {tracking.Mawb}
          </div>
          <div>
            <span className="text-gray-600">HAWB:</span> {tracking.Hawb}
          </div>
          <div>
            <span className="text-gray-600">Người tạo:</span> {tracking.NguoiTao}
          </div>
        </div>
        {tracking.GhiChu && (
          <div className="mt-4">
            <span className="text-gray-600">Ghi chú:</span> {tracking.GhiChu}
          </div>
        )}
      </div>

      {/* Status History */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-3">Lịch sử tình trạng</h2>
        {tracking.lichSuTracking?.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Ghi chú</th>
                <th className="px-4 py-2 text-left">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tracking.lichSuTracking.map((item: any) => (
                <tr key={item.ID}>
                  <td className="px-4 py-2">{item.ID}</td>
                  <td className="px-4 py-2">{item.GhiChu}</td>
                  <td className="px-4 py-2">{formatDate(item.NgayTao)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Chưa có lịch sử</p>
        )}
      </div>

      {/* Details */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Chi tiết tracking</h2>
        {tracking.chiTietTracking?.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Hình ảnh</th>
                <th className="px-4 py-2 text-right">Số lượng</th>
                <th className="px-4 py-2 text-right">Giá</th>
                <th className="px-4 py-2 text-left">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tracking.chiTietTracking.map((item: any) => (
                <tr key={item.ID}>
                  <td className="px-4 py-2">{item.ID}</td>
                  <td className="px-4 py-2">
                    {item.LinkHinh && (
                      <a href={item.LinkHinh} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Xem hình
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">{item.SoLuong}</td>
                  <td className="px-4 py-2 text-right">{item.Gia}</td>
                  <td className="px-4 py-2">{item.GhiChu}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">Chưa có chi tiết</p>
        )}
      </div>
    </div>
  );
}
