'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { getShippers, createShipper, updateShipper, deleteShipper, Shipper } from '@/lib/api';

/**
 * Shippers List Page
 *
 * Converted from admin/Shipper_LietKe.aspx
 * Features:
 * - List all shippers
 * - Add/Edit/Delete operations
 */
export default function ShippersPage() {
  const queryClient = useQueryClient();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingShipper, setEditingShipper] = useState<Shipper | null>(null);
  const [formData, setFormData] = useState({
    shipperName: '',
    shipperPhone: '',
    shipperAddress: '',
  });

  // Fetch shippers
  const { data: shippers, isLoading, error } = useQuery({
    queryKey: ['shippers'],
    queryFn: getShippers,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createShipper,
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['shippers'] });
        setShowModal(false);
        resetForm();
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateShipper(id, data),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['shippers'] });
        setEditingShipper(null);
        setShowModal(false);
        resetForm();
      }
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteShipper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shippers'] });
    },
  });

  const resetForm = () => {
    setFormData({
      shipperName: '',
      shipperPhone: '',
      shipperAddress: '',
    });
  };

  const handleOpenModal = (shipper?: Shipper) => {
    if (shipper) {
      setEditingShipper(shipper);
      setFormData({
        shipperName: shipper.ShipperName,
        shipperPhone: shipper.ShipperPhone,
        shipperAddress: shipper.ShipperAddress,
      });
    } else {
      setEditingShipper(null);
      resetForm();
    }
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShipper) {
      updateMutation.mutate({ id: editingShipper.ID, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Quản lý Shipper</h1>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thêm mới
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {String(error)}</div>
        ) : shippers?.length === 0 ? (
          <div className="p-8 text-center">Chưa có shipper nào</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Shipper</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số điện thoại</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Địa chỉ</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shippers?.map((shipper) => (
                <tr key={shipper.ID} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{shipper.ID}</td>
                  <td className="px-4 py-3 text-sm font-medium">{shipper.ShipperName}</td>
                  <td className="px-4 py-3 text-sm">{shipper.ShipperPhone}</td>
                  <td className="px-4 py-3 text-sm">{shipper.ShipperAddress}</td>
                  <td className="px-4 py-3 text-center space-x-1">
                    <button
                      onClick={() => handleOpenModal(shipper)}
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Bạn có chắc chắn muốn xóa?')) {
                          deleteMutation.mutate(shipper.ID);
                        }
                      }}
                      className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingShipper ? 'Sửa Shipper' : 'Thêm Shipper mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên shipper *</label>
                  <input
                    type="text"
                    value={formData.shipperName}
                    onChange={(e) => setFormData({ ...formData, shipperName: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại *</label>
                  <input
                    type="text"
                    value={formData.shipperPhone}
                    onChange={(e) => setFormData({ ...formData, shipperPhone: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <textarea
                    value={formData.shipperAddress}
                    onChange={(e) => setFormData({ ...formData, shipperAddress: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingShipper(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
