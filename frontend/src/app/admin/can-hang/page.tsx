'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { getOrders, updateOrder, massUpdate, getUsernames, getBatches, getProductTypes, getStatusCounts, calculateShipping } from '@/lib/api';
import { Order, QueryParams } from '@/types/order';
import { OrderStatus, OrderStatusConfig } from '@/types/order-status';

/**
 * CanHang Page - Weighing/ Shipping Management
 *
 * Converted from admin/CanHang.aspx
 * Features:
 * - Filter panel: status (checkbox list), filter, maDatHang, username, dotHang
 * - Data table with editable columns: CanHang_SoKg, LoaiHang, TienShipVeVN
 * - Actions: Cap nhat ngay ve, Mass complete, Mass shipped
 * - Edit inline for weight and shipping
 */

const ORDER_STATUSES = [
  { value: OrderStatus.RECEIVED, label: 'Received' },
  { value: OrderStatus.ORDERED, label: 'Ordered' },
  { value: OrderStatus.SHIPPED, label: 'Shipped' },
  { value: OrderStatus.COMPLETED, label: 'Completed' },
  { value: OrderStatus.CANCELLED, label: 'Cancelled' },
];

export default function CanHangPage() {
  const queryClient = useQueryClient();

  // Filter state - matching CanHang.aspx filters
  const [filters, setFilters] = useState<QueryParams>({
    page: 1,
    limit: 200,
    sortBy: 'id',
    sortOrder: 'DESC',
  });

  // Status checkboxes (multi-select)
  const [selectedStatuses, setSelectedStatuses] = useState<OrderStatus[]>([
    OrderStatus.ORDERED, // Default selected
  ]);

  // Selection state for mass operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Editing state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    canHangSoKg: '',
    loaiHangId: '',
    canHangTienShipVeVn: '',
    canHangGhiChuShipVeVn: '',
  });

  // Fetch usernames for dropdown
  const { data: usernamesData } = useQuery({
    queryKey: ['usernames'],
    queryFn: getUsernames,
  });

  // Fetch batches for dropdown
  const { data: batchesData } = useQuery({
    queryKey: ['batches'],
    queryFn: getBatches,
  });

  // Fetch product types for dropdown
  const { data: productTypesData } = useQuery({
    queryKey: ['productTypes'],
    queryFn: getProductTypes,
  });

  // Fetch status counts
  const { data: statusCountsData } = useQuery({
    queryKey: ['statusCounts'],
    queryFn: getStatusCounts,
  });

  // Fetch orders with TanStack Query
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['orders', filters, selectedStatuses],
    queryFn: () =>
      getOrders({
        ...filters,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      }),
  });

  // Mass complete mutation
  const completeMutation = useMutation({
    mutationFn: (ids: number[]) =>
      massUpdate(
        ids.map((id) => ({
          id,
          trangThaiOrder: OrderStatus.COMPLETED,
        })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedIds([]);
    },
  });

  // Mass shipped mutation
  const shippedMutation = useMutation({
    mutationFn: (ids: number[]) =>
      massUpdate(
        ids.map((id) => ({
          id,
          trangThaiOrder: OrderStatus.SHIPPED,
        })),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedIds([]);
    },
  });

  // Update single order (CanHang)
  const updateCanHangMutation = useMutation({
    mutationFn: (params: {
      id: number;
      canHangSoKg?: number;
      loaiHangId?: number;
      canHangTienShipVeVn?: number;
      canHangGhiChuShipVeVn?: string;
    }) => updateOrder(params.id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingId(null);
    },
  });

  // Calculate shipping mutation
  const calcShippingMutation = useMutation({
    mutationFn: (params: {
      weight: number;
      loaiHangId: number;
      loaiTien: string;
      username: string;
    }) => calculateShipping(params),
  });

  // Handle filter changes
  const handleFilterChange = (key: keyof QueryParams, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  // Handle status checkbox change
  const handleStatusChange = (status: OrderStatus) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      }
      return [...prev, status];
    });
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === data?.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.data.map((o) => o.id) || []);
    }
  };

  // Handle individual select
  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Handle mass complete (only Ordered/Shipped)
  const handleMassComplete = () => {
    const invalidOrders = data?.data.filter(
      (o) =>
        selectedIds.includes(o.id) &&
        o.trangThaiOrder !== OrderStatus.ORDERED &&
        o.trangThaiOrder !== OrderStatus.SHIPPED,
    );
    if (invalidOrders && invalidOrders.length > 0) {
      alert('Có đơn hàng không thể complete - chỉ có thể complete đơn hàng đã Ordered hoặc Shipped');
      return;
    }
    if (confirm('Bạn có chắc muốn complete không?')) {
      completeMutation.mutate(selectedIds);
    }
  };

  // Handle mass shipped
  const handleMassShipped = () => {
    if (confirm('Bạn có chắc muốn chuyển shipped không?')) {
      shippedMutation.mutate(selectedIds);
    }
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    // Build CSV
    if (!data?.data.length) return;

    const headers = [
      'Mã ĐH',
      'Ngày ĐH',
      'Order Number',
      'Username',
      'Loại tiền',
      'Cân nặng',
      'Loại hàng',
      'Tiền ship về VN',
      'Link',
      'Màu',
      'Size',
      'SL',
      'Giá web',
      'Tổng VNĐ',
      'Tình trạng',
      'Đợt hàng',
      'Ghi chú',
    ];

    const rows = data.data.map((order) => [
      order.id,
      order.ngayMuaHang ? new Date(order.ngayMuaHang).toLocaleDateString('vi-VN') : '',
      order.orderNumber || '',
      order.username,
      order.loaiTien || 'USD',
      order.canHangSoKg || '',
      order.tenLoaiHang || '',
      order.canHangTienShipVeVn || '',
      order.linkWeb || '',
      order.color || '',
      order.size || '',
      order.soLuong,
      order.donGiaWeb || 0,
      order.tongTienVnd || 0,
      OrderStatusConfig[order.trangThaiOrder]?.label || order.trangThaiOrder,
      order.ngayVeVn ? new Date(order.ngayVeVn).toLocaleDateString('vi-VN') : '',
      order.ghiChu || '',
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join('\t')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'DanhSachCanHang.xls';
    link.click();
  };

  // Handle edit row
  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setEditForm({
      canHangSoKg: order.canHangSoKg?.toString() || '',
      loaiHangId: order.loaiHangId?.toString() || '',
      canHangTienShipVeVn: order.canHangTienShipVeVn?.toString() || '',
      canHangGhiChuShipVeVn: '',
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
  };

  // Handle save edit
  const handleSaveEdit = () => {
    if (!editingId) return;

    const canHangSoKg = parseFloat(editForm.canHangSoKg) || 0;
    const canHangTienShipVeVn = parseFloat(editForm.canHangTienShipVeVn) || 0;

    updateCanHangMutation.mutate({
      id: editingId,
      canHangSoKg,
      loaiHangId: editForm.loaiHangId ? parseInt(editForm.loaiHangId) : undefined,
      canHangTienShipVeVn,
      canHangGhiChuShipVeVn: editForm.canHangGhiChuShipVeVn,
    });
  };

  // Format currency
  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('vi-VN');
  };

  // Calculate status counts from API
  const statusCounts: Record<OrderStatus, number> = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      [OrderStatus.RECEIVED]: 0,
      [OrderStatus.ORDERED]: 0,
      [OrderStatus.SHIPPED]: 0,
      [OrderStatus.COMPLETED]: 0,
      [OrderStatus.CANCELLED]: 0,
    };
    if (statusCountsData) {
      Object.entries(statusCountsData).forEach(([key, value]) => {
        const statusKey = key as OrderStatus;
        if (statusKey in counts) {
          counts[statusKey] = value;
        }
      });
    }
    return counts;
  }, [statusCountsData]);

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">CÂN HÀNG</h1>

      {/* Filter panel - matching CanHang.aspx filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        {/* Status CheckBoxList */}
        <div className="mb-4">
          <span className="font-medium">Status: </span>
          <div className="mt-2 flex flex-wrap gap-4">
            {ORDER_STATUSES.map((status) => (
              <label key={status.value} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.value)}
                  onChange={() => handleStatusChange(status.value)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">
                  {status.label} ({statusCounts[status.value] || 0})
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Filter inputs */}
        <div className="grid gap-4 md:grid-cols-5">
          {/* Filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Filter</label>
            <input
              type="text"
              placeholder="Filter"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Mã đặt hàng */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Mã đặt hàng</label>
            <input
              type="text"
              placeholder="Mã đặt hàng"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Username */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Username</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.username || ''}
              onChange={(e) => handleFilterChange('username', e.target.value)}
            >
              <option value="">--All--</option>
              {usernamesData?.map((u) => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          {/* Đợt hàng */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Đợt hàng</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            >
              <option value="">--All--</option>
              {batchesData?.map((b) => (
                <option key={b.tenDotHang} value={b.tenDotHang}>
                  {b.tenDotHang}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button className="flex-1 rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600">
              Xem
            </button>
            <button
              onClick={handleExportToExcel}
              className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Error loading orders: {(error as Error).message}
        </div>
      )}

      {/* Actions bar */}
      <div className="flex gap-4">
        <button className="text-sm font-medium text-blue-600 hover:underline">
          Cập nhật ngày về
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={handleMassComplete}
          disabled={selectedIds.length === 0 || completeMutation.isPending}
          className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
        >
          Mass complete
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={handleMassShipped}
          disabled={selectedIds.length === 0 || shippedMutation.isPending}
          className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
        >
          Mass shipped
        </button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {/* Data table - matching gvDonHang in C# */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-10 px-2 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === data.data.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Detail</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Edit</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Mã ĐH</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Ngày ĐH</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Order Number</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Username</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Loại tiền</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Cân nặng</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Loại hàng</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Tiền ship về VN</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Link</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Hình</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Màu</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Size</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">SL</th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">Giá web</th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase text-gray-500">Tổng VNĐ</th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">Tình trạng ĐH</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Đợt hàng</th>
                  <th className="px-2 py-3 text-xs font-medium uppercase text-gray-500">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.data.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => handleSelect(order.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Link
                        href={`/orders/${order.id}/edit-return-date`}
                        target="_blank"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Detail
                      </Link>
                    </td>
                    <td className="px-2 py-2">
                      {editingId === order.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={handleSaveEdit}
                            disabled={updateCanHangMutation.isPending}
                            className="text-green-600 hover:text-green-800"
                          >
                            Update
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="text-red-600 hover:text-red-800"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(order)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">{order.id}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {formatDate(order.ngayMuaHang)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.orderNumber || '-'}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">{order.username}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">{order.loaiTien || 'USD'}</td>

                    {/* Cân nặng - Editable */}
                    <td className="px-2 py-2">
                      {editingId === order.id ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editForm.canHangSoKg}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, canHangSoKg: e.target.value }))
                            }
                            className="w-16 rounded border border-gray-300 px-1 py-1 text-xs"
                          />
                          <button
                            type="button"
                            onClick={async () => {
                              const weight = parseFloat(editForm.canHangSoKg) || 0;
                              const loaiHangId = parseInt(editForm.loaiHangId) || 0;
                              if (weight > 0 && loaiHangId > 0) {
                                const result = await calcShippingMutation.mutateAsync({
                                  weight,
                                  loaiHangId,
                                  loaiTien: order.loaiTien || 'USD',
                                  username: order.username,
                                });
                                setEditForm((prev) => ({
                                  ...prev,
                                  canHangTienShipVeVn: result.shippingFee.toString(),
                                }));
                              }
                            }}
                            disabled={calcShippingMutation.isPending}
                            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                          >
                            Tính=&#62;
                          </button>
                        </div>
                      ) : (
                        <span>{order.canHangSoKg || '-'}</span>
                      )}
                    </td>

                    {/* Loại hàng - Editable with dropdown */}
                    <td className="px-2 py-2">
                      {editingId === order.id ? (
                        <select
                          value={editForm.loaiHangId}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, loaiHangId: e.target.value }))
                          }
                          className="rounded border border-gray-300 px-1 py-1 text-xs"
                        >
                          <option value="">-- Chọn --</option>
                          {productTypesData?.map((pt) => (
                            <option key={pt.LoaiHangID} value={pt.LoaiHangID}>
                              {pt.TenLoaiHang}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span>{order.tenLoaiHang || '-'}</span>
                      )}
                    </td>

                    {/* Tiền ship về VN - Editable */}
                    <td className="px-2 py-2 text-right">
                      {editingId === order.id ? (
                        <div>
                          <input
                            type="text"
                            value={editForm.canHangTienShipVeVn}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                canHangTienShipVeVn: e.target.value,
                              }))
                            }
                            className="w-20 rounded border border-gray-300 px-1 py-1 text-xs text-right"
                          />
                          <div className="mt-1 text-left text-xs">
                            Ghi chú:{' '}
                            <input
                              type="text"
                              value={editForm.canHangGhiChuShipVeVn}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  canHangGhiChuShipVeVn: e.target.value,
                                }))
                              }
                              className="w-20 rounded border border-gray-300 px-1 py-1 text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <span>{formatCurrency(order.canHangTienShipVeVn)}</span>
                      )}
                    </td>

                    <td className="max-w-[150px] truncate px-2 py-2">
                      {order.linkWeb ? (
                        <a
                          href={order.linkWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {order.linkWeb}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {order.linkHinh ? (
                        <img src={order.linkHinh} alt="Product" className="h-[50px] w-auto" />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">{order.color || '-'}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">{order.size || '-'}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">{order.soLuong}</td>
                    <td className="whitespace-nowrap px-2 py-2 text-right text-gray-900">
                      {formatCurrency(order.donGiaWeb)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-right font-medium text-gray-900">
                      {formatCurrency(order.tongTienVnd)}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {OrderStatusConfig[order.trangThaiOrder]?.label || order.trangThaiOrder}
                    </td>
                    <td className="whitespace-nowrap px-2 py-2 text-gray-900">
                      {order.ngayVeVn ? `Đợt hàng ${formatDate(order.ngayVeVn)}` : '-'}
                    </td>
                    <td className="max-w-[150px] truncate px-2 py-2 text-gray-900">
                      {order.ghiChu || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(data.page - 1) * data.limit + 1} to{' '}
            {Math.min(data.page * data.limit, data.total)} of {data.total} orders
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => handlePageChange(data.page - 1)}
              disabled={data.page === 1}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page === totalPages}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Fetching indicator */}
      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-gray-800 px-4 py-2 text-sm text-white">
          Updating...
        </div>
      )}
    </div>
  );
}
