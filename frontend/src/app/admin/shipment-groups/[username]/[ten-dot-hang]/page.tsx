'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ShipmentsGroup {
  ID: number;
  UserName: string;
  TenDotHang: string;
  CanNang: number;
  PhiShipVeVN_USD: number;
  PhiShipVeVN_VND: number;
  TyGia: number;
  NgayGuiHang: string;
  SoVanDon: string;
  ShipperID: number;
  DaYeuCauGuiHang: boolean;
  TienHangUSD: number;
  TienHangVND: number;
  PhiShipTrongNuoc: number;
}

const getShipmentsGroup = async (username: string, tenDotHang: string) => {
  const response = await axios.get<ShipmentsGroup>(
    `${API_URL}/admin/shipment-groups/${encodeURIComponent(username)}/${encodeURIComponent(tenDotHang)}`
  );
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

export default function ShipmentsGroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const username = Array.isArray(params.username) ? params.username[0] : params.username;
  const tenDotHang = Array.isArray(params['ten-dot-hang']) ? params['ten-dot-hang'][0] : params['ten-dot-hang'];

  const [showShipForm, setShowShipForm] = useState(false);
  const [shipForm, setShipForm] = useState({
    shipperId: '',
    ngayGuiHang: '',
    soVanDon: '',
    phiShipTrongNuoc: '0',
  });

  const { data: group, isLoading, error } = useQuery({
    queryKey: ['shipment-group', username, tenDotHang],
    queryFn: () => getShipmentsGroup(username!, tenDotHang!),
    enabled: !!username && !!tenDotHang,
  });

  // Update shipping mutation
  const updateShipMutation = useMutation({
    mutationFn: (data: { shipperId: number; ngayGuiHang: string; soVanDon: string; phiShipTrongNuoc: number }) =>
      axios.put(
        `${API_URL}/admin/shipment-groups/${encodeURIComponent(username!)}/${encodeURIComponent(tenDotHang!)}/ship`,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-group', username, tenDotHang] });
      setShowShipForm(false);
    },
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: () =>
      axios.put(
        `${API_URL}/admin/shipment-groups/${encodeURIComponent(username!)}/${encodeURIComponent(tenDotHang!)}/complete`
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-group', username, tenDotHang] });
    },
  });

  const handleShipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateShipMutation.mutateAsync({
      shipperId: Number(shipForm.shipperId),
      ngayGuiHang: shipForm.ngayGuiHang,
      soVanDon: shipForm.soVanDon,
      phiShipTrongNuoc: Number(shipForm.phiShipTrongNuoc),
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-red-500">Lỗi tải dữ liệu</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">
          Chi tiết đợt hàng: {group.TenDotHang} - {group.UserName}
        </h1>
        <button
          onClick={() => router.push('/admin/shipment-groups')}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Quay lại
        </button>
      </div>

      {/* Group Info */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-3">Thông tin đợt hàng</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span className="text-gray-600">Username:</span> {group.UserName}
          </div>
          <div>
            <span className="text-gray-600">Tên đợt hàng:</span> {group.TenDotHang}
          </div>
          <div>
            <span className="text-gray-600">Cân nặng:</span> {group.CanNang?.toFixed(2)} kg
          </div>
          <div>
            <span className="text-gray-600">Tỷ giá:</span> {group.TyGia}
          </div>
          <div>
            <span className="text-gray-600">Phí ship USD:</span> {formatCurrency(group.PhiShipVeVN_USD)}
          </div>
          <div>
            <span className="text-gray-600">Phí ship VND:</span> {formatCurrency(group.PhiShipVeVN_VND)}
          </div>
          <div>
            <span className="text-gray-600">Tiền hàng USD:</span> {formatCurrency(group.TienHangUSD)}
          </div>
          <div>
            <span className="text-gray-600">Tiền hàng VND:</span> {formatCurrency(group.TienHangVND)}
          </div>
          <div>
            <span className="text-gray-600">Ngày gửi:</span> {formatDate(group.NgayGuiHang)}
          </div>
          <div>
            <span className="text-gray-600">Số vận đơn:</span> {group.SoVanDon}
          </div>
          <div>
            <span className="text-gray-600">Phí ship trong nước:</span> {formatCurrency(group.PhiShipTrongNuoc)}
          </div>
          <div>
            <span className="text-gray-600">Trạng thái:</span>{' '}
            {group.DaYeuCauGuiHang ? (
              <span className="text-green-600 font-semibold">Đã hoàn thành</span>
            ) : (
              <span className="text-yellow-600 font-semibold">Chờ xử lý</span>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <h2 className="text-lg font-semibold mb-3">Thao tác</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowShipForm(!showShipForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Cập nhật thông tin gửi hàng
          </button>
          {!group.DaYeuCauGuiHang && (
            <button
              onClick={() => completeMutation.mutate()}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Đánh dấu hoàn thành
            </button>
          )}
        </div>
      </div>

      {/* Ship Form */}
      {showShipForm && (
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="text-lg font-semibold mb-3">Cập nhật thông tin gửi hàng</h2>
          <form onSubmit={handleShipSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Shipper</label>
                <select
                  value={shipForm.shipperId}
                  onChange={(e) => setShipForm({ ...shipForm, shipperId: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">-- Chọn shipper --</option>
                  <option value="1">Shipper 1</option>
                  <option value="2">Shipper 2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngày gửi hàng</label>
                <input
                  type="date"
                  value={shipForm.ngayGuiHang}
                  onChange={(e) => setShipForm({ ...shipForm, ngayGuiHang: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số vận đơn</label>
                <input
                  type="text"
                  value={shipForm.soVanDon}
                  onChange={(e) => setShipForm({ ...shipForm, soVanDon: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phí ship trong nước</label>
                <input
                  type="number"
                  value={shipForm.phiShipTrongNuoc}
                  onChange={(e) => setShipForm({ ...shipForm, phiShipTrongNuoc: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Lưu
              </button>
              <button
                type="button"
                onClick={() => setShowShipForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Orders in this shipment group */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-3">Danh sách đơn hàng</h2>
        <p className="text-gray-500">Danh sách đơn hàng trong đợt hàng này</p>
      </div>
    </div>
  );
}
