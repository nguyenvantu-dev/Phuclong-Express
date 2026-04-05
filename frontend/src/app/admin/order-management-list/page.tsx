'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { getOrdersQLDatHang, getUsernames, getCountries, massDelete, massUpdate, updateOrder } from '@/lib/api';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/hooks/use-auth';
import { Order, QueryParams } from '@/types/order';
import { OrderStatus } from '@/types/order-status';

/**
 * MassUpdate Modal Component
 * Converted from admin/QLDatHang_MassUpdate.aspx
 */
function MassUpdateModal({
  open,
  selectedIds,
  websiteName,
  currentUsername,
  onClose,
}: {
  open: boolean;
  selectedIds: number[];
  websiteName: string;
  currentUsername: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [orderNumber, setOrderNumber] = useState('');
  const [tyGia, setTyGia] = useState('');
  const [cong, setCong] = useState('');
  const [saleOff, setSaleOff] = useState('');
  const [tax, setTax] = useState('');
  const [totalCharged, setTotalCharged] = useState('');
  const [totalItem, setTotalItem] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (params: { items: { id: number; orderNumber?: string; tyGia?: number; cong?: number; saleOff?: number; tax?: number; totalCharged?: number; totalItem?: number }[]; username?: string }) =>
      massUpdate(params.items, params.username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      alert('Cập nhật thành công');
      onClose();
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra');
    },
  });

  const handleSubmit = async () => {
    setError('');

    // Validation
    if (!orderNumber.trim()) {
      setError('Phải nhập Order number');
      return;
    }
    if (!tyGia.trim()) {
      setError('Phải nhập tỷ giá');
      return;
    }
    if (isNaN(Number(tyGia))) {
      setError('Tỷ giá phải là kiểu số');
      return;
    }
    if (saleOff && isNaN(Number(saleOff))) {
      setError('Sale off(%) phải là kiểu số');
      return;
    }
    if (cong && isNaN(Number(cong))) {
      setError('Công phải là kiểu số');
      return;
    }
    if (tax && isNaN(Number(tax))) {
      setError('Tax phải là kiểu số');
      return;
    }
    if (totalCharged && isNaN(Number(totalCharged))) {
      setError('Total charged phải là kiểu số');
      return;
    }
    if (!totalItem.trim()) {
      setError('Phải nhập Total item');
      return;
    }
    if (isNaN(Number(totalItem))) {
      setError('Total item phải là kiểu số');
      return;
    }

    setIsSubmitting(true);

    // Update each order with the mass update data
    const updateItems = selectedIds.map(id => ({
      id,
      orderNumber: orderNumber.trim(),
      tyGia: tyGia ? Number(tyGia) : undefined,
      cong: cong ? Number(cong) : undefined,
      saleOff: saleOff ? Number(saleOff) : undefined,
      tax: tax ? Number(tax) : undefined,
      totalCharged: totalCharged ? Number(totalCharged) : undefined,
      totalItem: totalItem ? Number(totalItem) : undefined,
    }));

    updateMutation.mutate({ items: updateItems, username: currentUsername });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Mass Update - {selectedIds.length} đơn
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Đang cập nhật những ID của Website {websiteName}: {selectedIds.join(', ')}
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Order number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Nhập order number"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tỷ giá <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={tyGia}
              onChange={(e) => setTyGia(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Nhập tỷ giá"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Công (%)</label>
              <input
                type="number"
                step="0.01"
                value={cong}
                onChange={(e) => setCong(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Sale off (%)</label>
              <input
                type="number"
                step="0.01"
                value={saleOff}
                onChange={(e) => setSaleOff(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tax</label>
              <input
                type="number"
                step="0.01"
                value={tax}
                onChange={(e) => setTax(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Total charged</label>
              <input
                type="number"
                step="0.01"
                value={totalCharged}
                onChange={(e) => setTotalCharged(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Total item <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={totalItem}
              onChange={(e) => setTotalItem(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Nhập tổng số item"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || updateMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting || updateMutation.isPending ? 'Đang xử lý...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * QLDatHang_LietKe Page - Converted from admin/QLDatHang_LietKe.aspx
 *
 * Features:
 * - Tab navigation: Quản lý Item | Tạo mới item | Mass update | Thêm mới bằng excel | Đơn hàng đã xóa
 * - Filters: Filter, Mã đặt hàng, Từ ngày - Đến ngày, Website, Quốc gia, Username
 * - Summary: Total item, Tổng tiền (USD), Tổng tiền VND
 * - Actions: Mass update (popup), Mass delete (Admin only), Mass cancel
 * - Data table: 23 columns matching C# GridView
 * - Inline edit support via Edit button
 */

export default function QLDatHangLietKePage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentUsername = user?.username || '';
  const isAdmin = user?.roles?.includes('Admin') || false;

  // Refs for date inputs
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  // Filter state - matching QLDatHang_LietKe.aspx default filter: status = Received
  const [filters, setFilters] = useState<QueryParams>({
    page: 1,
    limit: 2000, // C# default: pageSize = 2000
    statuses: ['Received'],
    sortBy: 'ID',
    sortOrder: 'DESC',
  });

  // Separate state for "Mã đặt hàng" (exact ID match)
  const [maDatHang, setMaDatHang] = useState<string>('');

  // Selection state for mass operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Mass update modal state
  const [massUpdateModalOpen, setMassUpdateModalOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');

  // Inline editing state
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    websiteName: string;
    username: string;
    loaiTien: string;
    quocGiaId: number | null;
    linkWeb: string;
    linkHinh: string;
    color: string;
    size: string;
    soLuong: number;
    donGiaWeb: number;
    cong: number;
    saleOff: number;
    phuThu: number;
    shipUsa: number;
    tax: number;
    ghiChu: string;
    tyGia: number;
  } | null>(null);

  // Inline edit mutation
  const inlineEditMutation = useMutation({
    mutationFn: async (orderId: number) => {
      if (!editForm) return;
      const response = await updateOrder(orderId, {
        websiteName: editForm.websiteName,
        username: editForm.username,
        loaiTien: editForm.loaiTien,
        quocGiaId: editForm.quocGiaId || undefined,
        linkWeb: editForm.linkWeb,
        linkHinh: editForm.linkHinh,
        color: editForm.color,
        size: editForm.size,
        soLuong: editForm.soLuong,
        donGiaWeb: editForm.donGiaWeb,
        cong: editForm.cong,
        saleOff: editForm.saleOff,
        phuThu: editForm.phuThu,
        shipUsa: editForm.shipUsa,
        tax: editForm.tax,
        ghiChu: editForm.ghiChu,
        tyGia: editForm.tyGia,
        usernameSave: currentUsername,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setEditingOrderId(null);
      setEditForm(null);
      alert('Cập nhật thành công');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra');
    },
  });

  // Start editing
  const handleStartEdit = (order: Order) => {
    setEditingOrderId(order.id);
    setEditForm({
      websiteName: order.websiteName || '',
      username: order.username || '',
      loaiTien: order.loaiTien || 'USD',
      quocGiaId: order.quocGiaId || null,
      linkWeb: order.linkWeb || '',
      linkHinh: order.linkHinh || '',
      color: order.color || '',
      size: order.size || '',
      soLuong: order.soLuong || 0,
      donGiaWeb: order.donGiaWeb || 0,
      cong: order.cong || 0,
      saleOff: order.saleOff || 0,
      phuThu: order.phuThu || 0,
      shipUsa: order.shipUsa || 0,
      tax: order.tax || 0,
      ghiChu: order.ghiChu || '',
      tyGia: order.tyGia || 1,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingOrderId(null);
    setEditForm(null);
  };

  // Save editing
  const handleSaveEdit = () => {
    if (editingOrderId && editForm) {
      inlineEditMutation.mutate(editingOrderId);
    }
  };

  // Update form field
  const handleEditFormChange = (field: string, value: any) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  // Initialize flatpickr for date inputs
  useEffect(() => {
    if (!startDateRef.current || !endDateRef.current) return;

    const fpStart = flatpickr(startDateRef.current, {
      dateFormat: 'd/m/Y',
      onChange: (dates) => {
        if (dates[0]) {
          const d = dates[0];
          const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          setFilters(prev => ({ ...prev, startDate: formatted, page: 1 }));
        }
      },
    });

    const fpEnd = flatpickr(endDateRef.current, {
      dateFormat: 'd/m/Y',
      onChange: (dates) => {
        if (dates[0]) {
          const d = dates[0];
          const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          setFilters(prev => ({ ...prev, endDate: formatted, page: 1 }));
        }
      },
    });

    return () => {
      fpStart.destroy();
      fpEnd.destroy();
    };
  }, []);

  // Fetch orders with TanStack Query using QLDatHang API
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getOrdersQLDatHang(filters),
  });

  // Fetch usernames for dropdown
  const { data: usernames } = useQuery({
    queryKey: ['usernames'],
    queryFn: getUsernames,
  });

  // Fetch countries for dropdown
  const { data: quocGias } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  // Fetch websites for dropdown - from Website table
  const { data: websiteList } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: { WebsiteName: string }[] }>('/websites');
      return response.data?.data?.map((w: { WebsiteName: string }) => w.WebsiteName) || [];
    },
  });

  // Mass delete mutation (soft delete)
  const deleteMutation = useMutation({
    mutationFn: (params: { ids: number[]; username: string; note: string }) =>
      massDelete(params.ids, params.username, params.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedIds([]);
      alert('Đã xóa đơn hàng thành công');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra');
    },
  });

  // Calculate selected totals
  const selectedSummary = useMemo(() => {
    if (!data?.danhSachDonHang || selectedIds.length === 0) {
      return { totalItems: 0, totalPriceUsd: 0, totalPriceVnd: 0 };
    }

    const selectedOrders = data.danhSachDonHang.filter(o => selectedIds.includes(o.id));
    return selectedOrders.reduce(
      (acc, order) => {
        const tyGia = order.tyGia || 1;
        const tongTienVnd = (order.tongTienVnd && order.tongTienVnd > 0)
          ? order.tongTienVnd
          : ((Number(order.tongTienUsd) || 0) * tyGia) + (Number(order.tienCongVnd) || 0);

        return {
          totalItems: acc.totalItems + order.soLuong,
          totalPriceUsd: acc.totalPriceUsd + (Number(order.donGiaWeb) || 0) * order.soLuong,
          totalPriceVnd: acc.totalPriceVnd + tongTienVnd,
        };
      },
      { totalItems: 0, totalPriceUsd: 0, totalPriceVnd: 0 },
    );
  }, [data?.danhSachDonHang, selectedIds]);

  // Handle filter changes
  const handleFilterChange = (key: keyof QueryParams, value: string) => {
    const processedValue = key === 'quocGiaId' && value ? parseInt(value, 10) : (value || undefined);
    setFilters((prev) => ({ ...prev, [key]: processedValue, page: 1 }));
  };

  // Handle website filter change - store for mass update
  const handleWebsiteChange = (value: string) => {
    setSelectedWebsite(value);
    setFilters((prev) => ({ ...prev, website: value || undefined, page: 1 }));
  };

  // Handle search button click
  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: prev.search || undefined,
      ids: maDatHang || undefined,
      page: 1,
    }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.length === data?.danhSachDonHang.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.danhSachDonHang.map((o) => o.id) || []);
    }
  };

  // Handle individual select
  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  // Handle mass update - OPEN MODAL instead of redirect
  const handleMassUpdate = () => {
    if (selectedIds.length === 0) return;
    // Get website from first selected order
    const firstSelectedOrder = data?.danhSachDonHang.find(o => selectedIds.includes(o.id));
    setSelectedWebsite(firstSelectedOrder?.websiteName || selectedWebsite || '');
    setMassUpdateModalOpen(true);
  };

  // Handle mass delete
  const handleMassDelete = () => {
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} đơn hàng đã chọn?`)) return;

    const note = prompt('Nhập ghi chú lý do xóa:');
    if (note === null) return;

    deleteMutation.mutate({
      ids: selectedIds,
      username: currentUsername,
      note,
    });
  };

  // Handle mass cancel
  const handleMassCancel = useMutation({
    mutationFn: async () => {
      const { massUpdate } = await import('@/lib/api');
      return massUpdate(
        selectedIds.map((id) => ({ id, trangThaiOrder: OrderStatus.CANCELLED })),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setSelectedIds([]);
      alert('Đã hủy đơn hàng thành công');
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra');
    },
  });

  // Format currency
  const formatCurrency = (value: number | null | undefined, currency: string = 'VND') => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  // Format number
  const formatNumber = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  };

  // Check if username should be red
  const isUsernameRed = (order: Order) => {
    return order.daQuaHanMuc && !order.laKhachVip;
  };

  // Check if link should be disabled
  const isLinkDisabled = (order: Order) => {
    return order.daQuaHanMuc && !order.laKhachVip;
  };

  const totalPages = data ? Math.ceil(data.totalItem / data.limit) : 0;

  return (
    <div className="space-y-4">
      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <span className="rounded bg-gray-600 px-3 py-1 text-sm text-white">
          Quản lý Item
        </span>
        <Link
          href="/admin/orders/new"
          className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Tạo mới item
        </Link>
        <Link
          href="/admin/orders/import"
          className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Thêm mới item bằng excel
        </Link>
      </div>

      {/* <h3 className="text-lg font-bold text-gray-900">QUẢN LÝ ĐẶT HÀNG</h3> */}

      {/* Filter panel */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-wrap gap-4">
          {/* Filter */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Filter</label>
            <input
              type="text"
              placeholder="Filter"
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
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
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={maDatHang}
              onChange={(e) => setMaDatHang(e.target.value)}
            />
          </div>

          {/* Từ ngày - đến ngày */}
          <div className="flex gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Từ ngày</label>
              <input
                ref={startDateRef}
                type="text"
                placeholder="dd/mm/yyyy"
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Đến ngày</label>
              <input
                ref={endDateRef}
                type="text"
                placeholder="dd/mm/yyyy"
                className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Website</label>
            <select
              className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.website || ''}
              onChange={(e) => handleWebsiteChange(e.target.value)}
            >
              <option value="">--Tất cả website--</option>
              {(websiteList || []).map((w: string, i: number) => (
                <option key={`${w}-${i}`} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          {/* Quốc gia */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Quốc gia</label>
            <select
              className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.quocGiaId || ''}
              onChange={(e) => handleFilterChange('quocGiaId', e.target.value)}
            >
              <option value="">--Tất cả quốc gia--</option>
              {quocGias?.map((qg: any) => (
                <option key={qg.QuocGiaID} value={qg.QuocGiaID}>
                  {qg.TenQuocGia}
                </option>
              ))}
            </select>
          </div>

          {/* Username */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Username</label>
            <select
              className="w-48 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              value={filters.username || ''}
              onChange={(e) => handleFilterChange('username', e.target.value)}
            >
              <option value="">--Tất cả user--</option>
              {usernames?.map((u: any) => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
            >
              Xem
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="flex flex-wrap gap-6">
          <p className="text-sm font-medium">
            Total item: <span className="text-lg font-bold">{selectedSummary.totalItems}</span>
          </p>
          <p className="text-sm font-medium">
            Tổng tiền: <span className="text-lg font-bold">{formatCurrency(selectedSummary.totalPriceUsd, 'USD')}</span>
          </p>
          <p className="text-sm font-medium">
            Tổng tiền VND: <span className="text-lg font-bold">{formatCurrency(selectedSummary.totalPriceVnd, 'VND')}</span>
          </p>
        </div>

        {/* Mass actions */}
        <div className="mt-3 flex flex-wrap gap-4 border-t border-gray-200 pt-3">
          <button
            onClick={handleMassUpdate}
            disabled={selectedIds.length === 0}
            className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mass update
          </button>
          {isAdmin && (
            <>
              <span className="text-gray-400">|</span>
              <button
                onClick={handleMassDelete}
                disabled={selectedIds.length === 0 || deleteMutation.isPending}
                className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Đang xóa...' : 'Mass delete'}
              </button>
            </>
          )}
          <span className="text-gray-400">|</span>
          <button
            onClick={() => {
              if (confirm(`Hủy ${selectedIds.length} đơn hàng đã chọn?`)) {
                handleMassCancel.mutate();
              }
            }}
            disabled={selectedIds.length === 0 || handleMassCancel.isPending}
            className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
          >
            {handleMassCancel.isPending ? 'Đang hủy...' : 'Mass Cancel'}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Error loading orders: {(error as Error).message}
        </div>
      )}

      {/* Data table */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-8 px-1 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === data.danhSachDonHang.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Edit</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Mã ĐH</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Website</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Username</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Ngày save</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Loại tiền</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Quốc gia</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Link SP</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Hình</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Màu</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Size</th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">Số lượng</th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">Giá web</th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">%Công</th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">% sale off</th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">$Phụ thu</th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">$ShipUS</th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">Tax</th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">Công VNĐ</th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">Tổng VNĐ</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Vùng miền</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">Ghi chú</th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">user added</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.danhSachDonHang.map((order) => {
                  const usernameRed = isUsernameRed(order);
                  const linkDisabled = isLinkDisabled(order);

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-1 py-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={() => handleSelect(order.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-1 py-1 whitespace-nowrap">
                        {editingOrderId === order.id ? (
                          <div className="flex gap-1">
                            <button
                              onClick={handleSaveEdit}
                              disabled={inlineEditMutation.isPending}
                              className="rounded bg-green-500 px-2 py-1 text-xs text-white hover:bg-green-600 disabled:opacity-50"
                            >
                              {inlineEditMutation.isPending ? '...' : 'Save'}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartEdit(order)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="text"
                            value={editForm?.websiteName || ''}
                            onChange={(e) => handleEditFormChange('websiteName', e.target.value)}
                            className="w-20 rounded border border-gray-300 px-1 py-1 text-xs"
                          />
                        ) : (
                          order.id
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="text"
                            value={editForm?.websiteName || ''}
                            onChange={(e) => handleEditFormChange('websiteName', e.target.value)}
                            className="w-20 rounded border border-gray-300 px-1 py-1 text-xs"
                          />
                        ) : (
                          order.websiteName || '-'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1" style={{ color: usernameRed ? 'red' : 'black' }}>
                        {editingOrderId === order.id ? (
                          <input
                            type="text"
                            value={editForm?.username || ''}
                            onChange={(e) => handleEditFormChange('username', e.target.value)}
                            className="w-16 rounded border border-gray-300 px-1 py-1 text-xs"
                          />
                        ) : (
                          order.username
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-gray-900">
                        {formatDate(order.ngaySaveLink)}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-gray-900">
                        {editingOrderId === order.id ? (
                          <select
                            value={editForm?.loaiTien || 'USD'}
                            onChange={(e) => handleEditFormChange('loaiTien', e.target.value)}
                            className="w-16 rounded border border-gray-300 px-1 py-1 text-xs"
                          >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="CNY">CNY</option>
                            <option value="JPY">JPY</option>
                          </select>
                        ) : (
                          order.loaiTien || 'USD'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-gray-900">
                        {editingOrderId === order.id ? (
                          <select
                            value={editForm?.quocGiaId || ''}
                            onChange={(e) => handleEditFormChange('quocGiaId', e.target.value ? parseInt(e.target.value) : null)}
                            className="w-24 rounded border border-gray-300 px-1 py-1 text-xs"
                          >
                            <option value="">--Chọn--</option>
                            {quocGias?.map((qg: any) => (
                              <option key={qg.QuocGiaID} value={qg.QuocGiaID}>
                                {qg.TenQuocGia}
                              </option>
                            ))}
                          </select>
                        ) : (
                          order.tenQuocGia || '-'
                        )}
                      </td>
                      <td className="max-w-[150px] truncate px-1 py-1">
                        {editingOrderId === order.id ? (
                          <input
                            type="text"
                            value={editForm?.linkWeb || ''}
                            onChange={(e) => handleEditFormChange('linkWeb', e.target.value)}
                            className="w-full rounded border border-gray-300 px-1 py-1 text-xs"
                          />
                        ) : order.linkWeb ? (
                          <a
                            href={linkDisabled ? '#' : order.linkWeb}
                            target={linkDisabled ? '_self' : '_blank'}
                            rel="noopener noreferrer"
                            className={linkDisabled ? 'text-gray-400 pointer-events-none' : 'text-blue-600 hover:text-blue-800'}
                          >
                            {order.linkWeb}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-1 py-1">
                        {editingOrderId === order.id ? (
                          <input
                            type="text"
                            value={editForm?.linkHinh || ''}
                            onChange={(e) => handleEditFormChange('linkHinh', e.target.value)}
                            className="w-20 rounded border border-gray-300 px-1 py-1 text-xs"
                            placeholder="URL hoặc upload"
                          />
                        ) : order.linkHinh ? (
                          <img src={order.linkHinh} alt="Product" className="h-[30px] w-auto" />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="text"
                            value={editForm?.color || ''}
                            onChange={(e) => handleEditFormChange('color', e.target.value)}
                            className="w-12 rounded border border-gray-300 px-1 py-1 text-xs"
                          />
                        ) : (
                          order.color || '-'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="text"
                            value={editForm?.size || ''}
                            onChange={(e) => handleEditFormChange('size', e.target.value)}
                            className="w-12 rounded border border-gray-300 px-1 py-1 text-xs"
                          />
                        ) : (
                          order.size || '-'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-right text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="number"
                            value={editForm?.soLuong || 0}
                            onChange={(e) => handleEditFormChange('soLuong', parseInt(e.target.value) || 0)}
                            className="w-12 rounded border border-gray-300 px-1 py-1 text-xs text-right"
                          />
                        ) : (
                          order.soLuong
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-right text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm?.donGiaWeb || 0}
                            onChange={(e) => handleEditFormChange('donGiaWeb', parseFloat(e.target.value) || 0)}
                            className="w-16 rounded border border-gray-300 px-1 py-1 text-xs text-right"
                          />
                        ) : (
                          formatNumber(order.donGiaWeb)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-right text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm?.cong || 0}
                            onChange={(e) => handleEditFormChange('cong', parseFloat(e.target.value) || 0)}
                            className="w-12 rounded border border-gray-300 px-1 py-1 text-xs text-right"
                          />
                        ) : (
                          formatNumber(order.cong)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-right text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm?.saleOff || 0}
                            onChange={(e) => handleEditFormChange('saleOff', parseFloat(e.target.value) || 0)}
                            className="w-12 rounded border border-gray-300 px-1 py-1 text-xs text-right"
                          />
                        ) : (
                          formatNumber(order.saleOff)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-right text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm?.phuThu || 0}
                            onChange={(e) => handleEditFormChange('phuThu', parseFloat(e.target.value) || 0)}
                            className="w-12 rounded border border-gray-300 px-1 py-1 text-xs text-right"
                          />
                        ) : (
                          formatNumber(order.phuThu)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-right text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm?.shipUsa || 0}
                            onChange={(e) => handleEditFormChange('shipUsa', parseFloat(e.target.value) || 0)}
                            className="w-12 rounded border border-gray-300 px-1 py-1 text-xs text-right"
                          />
                        ) : (
                          formatNumber(order.shipUsa)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-right text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editForm?.tax || 0}
                            onChange={(e) => handleEditFormChange('tax', parseFloat(e.target.value) || 0)}
                            className="w-12 rounded border border-gray-300 px-1 py-1 text-xs text-right"
                          />
                        ) : (
                          formatNumber(order.tax)
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-right text-gray-900">{formatNumber(order.tienCongVnd)}</td>
                      <td className="whitespace-nowrap px-1 py-1 text-right font-medium text-gray-900">{formatNumber(order.tongTienVnd)}</td>
                      <td className="whitespace-nowrap px-1 py-1 text-gray-900">{order.vungMien || '-'}</td>
                      <td className="max-w-[150px] truncate px-1 py-1 text-gray-900">
                        {editingOrderId === order.id ? (
                          <input
                            type="text"
                            value={editForm?.ghiChu || ''}
                            onChange={(e) => handleEditFormChange('ghiChu', e.target.value)}
                            className="w-full rounded border border-gray-300 px-1 py-1 text-xs"
                          />
                        ) : (
                          order.ghiChu || '-'
                        )}
                      </td>
                      <td className="whitespace-nowrap px-1 py-1 text-gray-900">{order.usernameSave || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(data.page - 1) * data.limit + 1} to {Math.min(data.page * data.limit, data.totalItem)} of {data.totalItem} orders
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

      {/* Mass Update Modal */}
      <MassUpdateModal
        open={massUpdateModalOpen}
        selectedIds={selectedIds}
        websiteName={selectedWebsite}
        currentUsername={currentUsername}
        onClose={() => setMassUpdateModalOpen(false)}
      />
    </div>
  );
}
