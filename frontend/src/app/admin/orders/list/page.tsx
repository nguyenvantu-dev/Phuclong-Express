'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { getOrders, getStatusCounts, massDelete, massComplete, massReceived, massShipped, getUsernames, getQuocGia } from '@/lib/api';
import { useAuthStore } from '@/hooks/use-auth';
import { Order, QueryParams } from '@/types/order';
import { OrderStatus, OrderStatusConfig } from '@/types/order-status';

// Note Modal Component
function NoteModal({
  open,
  orderIds,
  onClose,
}: {
  open: boolean;
  orderIds: number[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [ghiChu, setGhiChu] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async () => {
    if (!ghiChu.trim()) {
      setError('Vui lòng nhập ghi chú');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const { updateOrderNoteBatch } = await import('@/lib/api');
      await updateOrderNoteBatch(orderIds, ghiChu);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
      setGhiChu('');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-transform duration-200">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Bổ sung ghi chú {orderIds.length > 1 && `(${orderIds.length} đơn)`}
        </h3>
        {error && <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>}
        <div>
          <textarea
            value={ghiChu}
            onChange={(e) => { setGhiChu(e.target.value); setError(''); }}
            rows={4}
            className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            placeholder="Nhập ghi chú..."
            autoFocus
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Return Date Modal Component
function ReturnDateModal({
  open,
  orderIds,
  onClose,
}: {
  open: boolean;
  orderIds: number[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const dateInputRef = useRef<HTMLInputElement>(null);
  const [ngayVeVn, setNgayVeVn] = useState('');
  const [boSungGhiChu, setBoSungGhiChu] = useState('');
  const [chuyenVeCompleted, setChuyenVeCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Initialize flatpickr when modal opens
  useEffect(() => {
    if (!open || !dateInputRef.current) return;
    const fp = flatpickr(dateInputRef.current, {
      dateFormat: 'd/m/Y',
      defaultDate: ngayVeVn ? new Date(ngayVeVn) : undefined,
      onChange: (dates) => {
        if (dates[0]) {
          const d = dates[0];
          const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
          setNgayVeVn(formatted);
          setError('');
        }
      },
    });
    return () => { fp.destroy(); };
  }, [open]);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!ngayVeVn) {
      setError('Vui lòng chọn ngày về VN');
      return;
    }
    setIsSubmitting(true);
    setError('');
    try {
      const { updateOrderReturnDate } = await import('@/lib/api');
      await Promise.all(orderIds.map((id) =>
        updateOrderReturnDate(id, {
          ngayVeVn,
          boSungGhiChu,
          chuyenVeCompleted,
          username: '',
        })
      ));
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-transform duration-200">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Cập nhật ngày về VN {orderIds.length > 1 && `(${orderIds.length} đơn)`}
        </h3>
        <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          Chú ý: Khi cập nhật ngày về VN hệ thống sẽ tự động tạo đợt hàng cần ship cho các item này
        </div>
        {error && <div className="mb-4 rounded bg-red-50 p-2 text-sm text-red-600">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ngày về VN <span className="text-red-500">*</span>
            </label>
            <input
              ref={dateInputRef}
              type="text"
              placeholder="dd/mm/yyyy"
              className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Bổ sung ghi chú</label>
            <textarea
              value={boSungGhiChu}
              onChange={(e) => setBoSungGhiChu(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none"
              placeholder="Nhập ghi chú bổ sung..."
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="chuyenCompleted"
              checked={chuyenVeCompleted}
              onChange={(e) => setChuyenVeCompleted(e.target.checked)}
              className="rounded border-gray-400 bg-white"
            />
            <label htmlFor="chuyenCompleted" className="text-sm font-medium text-gray-700">
              Chuyển sang trạng thái Completed
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Confirmation Modal Component
function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'default',
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl transition-transform duration-200">
        <h3 className="mb-3 text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mb-6 text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * EditOrder List Page
 *
 * Converted from admin/EditOrder.aspx
 * Features:
 * - Tab navigation: Danh sách Order | Chi tiết Order | Ngày về VN
 * - Filters: Status checkboxes, search, mã đặt hàng, date range, quốc gia, username
 * - Actions: Export Excel 1 trang, Export Excel theo bộ lọc
 * - Mass actions: Cập nhật ngày về, Mass cancel/complete/received/shipped, Bổ sung ghi chú
 * - GridView with columns: Checkbox, Edit/Trọn gói, THÔNG TIN ĐH, USERNAME+Vùng miền, etc.
 * - Pagination
 */
export default function EditOrderListPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const currentUsername = user?.username || '';

  // Role-based visibility (convert từ EditOrder.aspx.cs)
  // Admin/Order: thấy tất cả | Kho: chỉ complete | Sale: không thấy gì
  const userRoles = user?.roles || [];
  const isAdminOrOrder = userRoles.some(r => ['Admin', 'Order'].includes(r));
  const isKho = userRoles.includes('Kho');
  const isSale = userRoles.includes('Sale');

  // Buttons visibility
  const canUpdateNgayVe = isAdminOrOrder; // Cập nhật ngày về
  const canMassCancel = isAdminOrOrder; // Mass cancel
  const canMassComplete = isAdminOrOrder; // Mass complete
  const canMassReceived = isAdminOrOrder; // Mass received
  const canMassShipped = isAdminOrOrder; // Mass shipped
  const canBoSungGhiChu = isAdminOrOrder; // Bổ sung ghi chú

  // Refs for date inputs
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);

  // Filter state - matching EditOrder.aspx filters
  // "Filter" (tbNoiDungTim) -> search, "Mã đặt hàng" (tbMaDatHang) -> ids (exact match by ID)
  const [filters, setFilters] = useState<QueryParams & { statuses?: string[] }>({
    page: 1,
    limit: 200, // Match EditOrder.aspx pageSize
    statuses: ['Ordered'], // Default selected in C#
    sortBy: 'ID',
    sortOrder: 'DESC',
  });

  // Separate state for "Mã đặt hàng" (tbMaDatHang) - exact ID match
  const [maDatHang, setMaDatHang] = useState<string>('');

  // Selection state for mass operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Status checkboxes state (matching cblTrangThaiOrder in C#)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['Ordered']);

  // Return date modal state
  const [returnDateModalOpen, setReturnDateModalOpen] = useState(false);

  // Note modal state
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    variant: 'default' | 'danger';
    onConfirm: () => void;
  }>({ open: false, title: '', message: '', variant: 'default', onConfirm: () => {} });

  // Show confirmation modal helper
  const showConfirm = (title: string, message: string, variant: 'default' | 'danger' = 'default', onConfirm: () => void) => {
    setConfirmModal({ open: true, title, message, variant, onConfirm });
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

  // Fetch orders with TanStack Query
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getOrders(filters),
  });

  // Fetch status counts for badges
  const { data: statusCounts } = useQuery({
    queryKey: ['order-status-counts'],
    queryFn: getStatusCounts,
  });

  // Fetch usernames for dropdown
  const { data: usernames } = useQuery({
    queryKey: ['usernames'],
    queryFn: getUsernames,
  });

  // Fetch countries for dropdown
  const { data: quocGias } = useQuery({
    queryKey: ['quocGia'],
    queryFn: getQuocGia,
  });

  // Mass received mutation (dùng stored procedure giống EditOrder)
  const massReceivedMutation = useMutation({
    mutationFn: (params: { ids: number[]; username: string }) =>
      massReceived(params.ids, params.username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-status-counts'] });
      setSelectedIds([]);
    },
    onError: (error: any) => {
      alert(error?.response?.data?.message || error?.message || 'Có lỗi xảy ra');
    },
  });

  // Mass shipped mutation (dùng stored procedure giống EditOrder)
  const massShippedMutation = useMutation({
    mutationFn: (params: { ids: number[]; username: string }) =>
      massShipped(params.ids, params.username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-status-counts'] });
      setSelectedIds([]);
    },
  });

  // Mass delete mutation (soft delete - giống EditOrder MassCancel1)
  const deleteMutation = useMutation({
    mutationFn: (params: { ids: number[]; username: string; note: string }) =>
      massDelete(params.ids, params.username, params.note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-status-counts'] });
      setSelectedIds([]);
    },
  });

  // Mass complete mutation (dùng stored procedure giống EditOrder)
  const massCompleteMutation = useMutation({
    mutationFn: (params: { id: number; username: string }[]) =>
      massComplete(
        params.map((p) => p.id),
        params[0]?.username
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order-status-counts'] });
      setSelectedIds([]);
    },
  });

  // Handle status checkbox change
  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...selectedStatuses, status]
      : selectedStatuses.filter((s) => s !== status);

    setSelectedStatuses(newStatuses);
    setFilters((prev) => ({ ...prev, statuses: newStatuses, page: 1 }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof QueryParams, value: string) => {
    const processedValue = key === 'quocGiaId' && value ? parseInt(value, 10) : (value || undefined);
    setFilters((prev) => ({ ...prev, [key]: processedValue, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Handle select all - matching CheckAllItem() in C#
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

  // Handle search button click (matching btTimKiem_Click in C#)
  // Both search and ids can be used together (matching EditOrder.aspx)
  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: prev.search || undefined,
      ids: maDatHang || undefined,
      page: 1
    }));
  };

  // Handle mass cancel (soft delete - giống EditOrder MassCancel1)
  const handleMassCancel = () => {
    showConfirm(
      'Xác nhận hủy đơn',
      `Bạn có chắc muốn hủy ${selectedIds.length} đơn hàng đã chọn?`,
      'danger',
      () => {
        deleteMutation.mutate(
          { ids: selectedIds, username: currentUsername, note: '' },
          {
            onSuccess: () => {
              alert(`Đã hủy ${selectedIds.length} đơn hàng`);
            },
            onError: () => {
              alert('Có lỗi xảy ra khi hủy đơn');
            },
          },
        );
      }
    );
  };

  // Handle mass complete (dùng stored procedure giống EditOrder)
  const handleMassComplete = () => {
    showConfirm(
      'Xác nhận complete',
      'Bạn có chắc muốn complete các đơn đã chọn?',
      'default',
      () => {
        const selectedOrders = data?.data.filter((o) => selectedIds.includes(o.id));
        const invalidOrders = selectedOrders?.filter(
          (o) => !['Ordered', 'Shipped'].includes(o.trangThaiOrder)
        );
        if (invalidOrders && invalidOrders.length > 0) {
          alert('Có đơn hàng không thể complete - chỉ có thể complete đơn hàng đã Ordered hoặc Shipped');
          return;
        }
        const validOrders = selectedOrders?.filter((o) =>
          ['Ordered', 'Shipped'].includes(o.trangThaiOrder)
        );
        if (validOrders && validOrders.length > 0) {
          massCompleteMutation.mutate(validOrders.map((o) => ({ id: o.id, username: currentUsername })));
        }
      }
    );
  };

  // Handle mass received (dùng stored procedure giống EditOrder)
  const handleMassReceived = () => {
    showConfirm(
      'Xác nhận chuyển received',
      'Bạn có chắc muốn chuyển các đơn đã chọn sang Received?',
      'default',
      () => {
        massReceivedMutation.mutate({ ids: selectedIds, username: currentUsername });
      }
    );
  };

  // Handle mass shipped (dùng stored procedure giống EditOrder)
  const handleMassShipped = () => {
    showConfirm(
      'Xác nhận chuyển shipped',
      'Bạn có chắc muốn chuyển các đơn đã chọn sang Shipped?',
      'default',
      () => {
        massShippedMutation.mutate({ ids: selectedIds, username: currentUsername });
      }
    );
  };

  // Get selected order IDs for bulk actions

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

  // Format date - matching dd/MM/yyyy in C#
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
  };

  // Handle export current page to CSV
  const handleExportCurrentPage = () => {
    if (!data?.data) return;

    const lines: string[] = [];
    const headers = [
      'Mã ĐH', 'OrderNumber', 'Website', 'Username', 'Ngày ĐH', 'Ngày Save',
      'Quốc gia', 'Link', 'Màu', 'Size', 'Số lượng',
      'Giá web', '%Công', '%SaleOff', 'Phụ thu', 'ShipUS', 'Tax',
      'Công VNĐ', 'Tổng VNĐ', 'Tỷ giá', 'Loại tiền',
      'Vùng miền', 'Ghi chú', 'Trạng thái', 'Đợt hàng'
    ];
    lines.push(headers.join(','));

    for (const order of data.data) {
      const values = [
        order.id,
        order.orderNumber || '',
        order.websiteName || '',
        order.username || '',
        formatDate(order.ngayMuaHang),
        formatDate(order.ngaySaveLink),
        order.tenQuocGia || '',
        (order.linkWeb || '').replace(/,/g, ';'),
        order.color || '',
        order.size || '',
        order.soLuong || 0,
        order.donGiaWeb || 0,
        order.cong || 0,
        order.saleOff || 0,
        order.phuThu || 0,
        order.shipUsa || 0,
        order.tax || 0,
        order.tienCongVnd || 0,
        order.tongTienVnd || 0,
        order.tyGia || 0,
        order.loaiTien || 'USD',
        order.vungMien || '',
        (order.ghiChu || '').replace(/,/g, ';'),
        order.trangThaiOrder || '',
        order.tenDotHang || ''
      ];
      lines.push(values.join(','));
    }

    const csv = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DanhSachDonHang_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;
    link.click();
  };

  // Handle export by filter - fetch ALL matching records (no pagination) then download CSV
  const handleExportByFilter = async () => {
    // Fetch all records matching current filters (limit=99999 to get all)
    const exportFilters = { ...filters, page: 1, limit: 99999 };
    try {
      const result = await getOrders(exportFilters);
      const allOrders = result?.data || [];

      const lines: string[] = [];
      const headers = [
        'Mã ĐH', 'OrderNumber', 'Website', 'Username', 'Ngày ĐH', 'Ngày Save',
        'Quốc gia', 'Link', 'Màu', 'Size', 'Số lượng',
        'Giá web', '%Công', '%SaleOff', 'Phụ thu', 'ShipUS', 'Tax',
        'Công VNĐ', 'Tổng VNĐ', 'Tỷ giá', 'Loại tiền',
        'Vùng miền', 'Ghi chú', 'Trạng thái', 'Đợt hàng'
      ];
      lines.push(headers.join(','));

      for (const order of allOrders) {
        const values = [
          order.id,
          order.orderNumber || '',
          order.websiteName || '',
          order.username || '',
          formatDate(order.ngayMuaHang),
          formatDate(order.ngaySaveLink),
          order.tenQuocGia || '',
          (order.linkWeb || '').replace(/,/g, ';'),
          order.color || '',
          order.size || '',
          order.soLuong || 0,
          order.donGiaWeb || 0,
          order.cong || 0,
          order.saleOff || 0,
          order.phuThu || 0,
          order.shipUsa || 0,
          order.tax || 0,
          order.tienCongVnd || 0,
          order.tongTienVnd || 0,
          order.tyGia || 0,
          order.loaiTien || 'USD',
          order.vungMien || '',
          (order.ghiChu || '').replace(/,/g, ';'),
          order.trangThaiOrder || '',
          order.tenDotHang || ''
        ];
        lines.push(values.join(','));
      }

      const csv = '\uFEFF' + lines.join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `DanhSachDonHang_Filter_${new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')}.csv`;
      link.click();
    } catch (err) {
      alert('Không thể xuất file: ' + (err as Error).message);
    }
  };

  // Status config for display
  const statuses = ['Received', 'Ordered', 'Shipped', 'Completed', 'Cancelled'];

  const totalPages = data ? Math.ceil(data.total / data.limit) : 0;

  return (
    <div className="space-y-4">
      {/* Tab navigation - matching mytab in EditOrder.aspx */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <Link
          href="/admin/orders/list"
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white"
        >
          Danh sách Order
        </Link>
        {/* <Link
          href="/admin/orders"
          className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Chi tiết Order
        </Link> */}
        {/* <Link
          href="/admin/orders/return-dates"
          className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
        >
          Ngày về VN
        </Link> */}
      </div>

      <h3 className="text-lg font-bold text-gray-900">DANH SÁCH ĐẶT HÀNG</h3>

      {/* Status checkboxes - matching cblTrangThaiOrder in C# */}
      <div className="flex flex-wrap gap-4">
        {statuses.map((status) => {
          const count = statusCounts?.[status] || 0;
          const isSelected = selectedStatuses.includes(status);
          return (
            <label key={status} className="flex cursor-pointer items-center gap-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => handleStatusChange(status, e.target.checked)}
                className="rounded border-gray-400 bg-white"
              />
              <span className="text-sm font-medium text-gray-900">
                {status} ({count})
              </span>
            </label>
          );
        })}
      </div>

      {/* Filter panel - matching EditOrder.aspx filters */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-wrap gap-4">
          {/* Filter - search text */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Filter</label>
            <input
              type="text"
              placeholder="Filter"
              className="w-32 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Mã đặt hàng - matching tbMaDatHang in C# */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Mã đặt hàng</label>
            <input
              type="text"
              placeholder="Mã đặt hàng"
              className="w-32 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
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
                className="w-28 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">Đến ngày</label>
              <input
                ref={endDateRef}
                type="text"
                placeholder="dd/mm/yyyy"
                className="w-28 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quốc gia - matching ddQuocGia in C# */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Quốc gia</label>
            <select
              className="w-40 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              value={filters.quocGiaId || ''}
              onChange={(e) => handleFilterChange('quocGiaId', e.target.value)}
            >
              <option value="">--Tất cả Quốc gia--</option>
              {quocGias?.map((qg: any) => (
                <option key={qg.QuocGiaID} value={qg.QuocGiaID}>
                  {qg.TenQuocGia}
                </option>
              ))}
            </select>
          </div>

          {/* Username - matching ddUserName in C# */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Username</label>
            <select
              className="w-48 rounded-lg border border-gray-400 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              value={filters.username || ''}
              onChange={(e) => handleFilterChange('username', e.target.value)}
            >
              <option value="">--Tất cả User--</option>
              {usernames?.map((u: any) => (
                <option key={u.username} value={u.username}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button - matching btTimKiem in C# */}
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              className="rounded-lg bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600"
            >
              Xem
            </button>
          </div>

          {/* Export buttons - matching btExportToExcel1Page, btExportToExcelAllWithFilter in C# */}
          <div className="flex items-end gap-2">
            <button onClick={handleExportCurrentPage} className="rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">
              Xuất ra excel 1 trang
            </button>
            <button onClick={handleExportByFilter} className="rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600">
              Xuất ra excel theo bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Mass actions toolbar - matching LinkButtons in EditOrder.aspx with role visibility */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
        {selectedIds.length > 0 && (
          <span className="mr-2 text-sm font-medium text-gray-700">
            Đã chọn: <span className="font-bold text-blue-600">{selectedIds.length}</span> đơn
          </span>
        )}
        <div className="flex flex-wrap gap-2">
          {canUpdateNgayVe && (
            <button
              onClick={() => setReturnDateModalOpen(true)}
              disabled={selectedIds.length === 0}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cập nhật ngày về
            </button>
          )}
          {canMassCancel && (
            <button
              onClick={handleMassCancel}
              disabled={selectedIds.length === 0 || deleteMutation.isPending}
              className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Đang hủy...' : 'Mass cancel'}
            </button>
          )}
          {canMassComplete && (
            <button
              onClick={handleMassComplete}
              disabled={selectedIds.length === 0 || massCompleteMutation.isPending}
              className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {massCompleteMutation.isPending ? 'Đang xử lý...' : 'Mass complete'}
            </button>
          )}
          {canMassReceived && (
            <button
              onClick={handleMassReceived}
              disabled={selectedIds.length === 0 || massReceivedMutation.isPending}
              className="rounded bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              {massReceivedMutation.isPending ? 'Đang xử lý...' : 'Mass received'}
            </button>
          )}
          {canMassShipped && (
            <button
              onClick={handleMassShipped}
              disabled={selectedIds.length === 0 || massShippedMutation.isPending}
              className="rounded bg-cyan-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-700 disabled:opacity-50"
            >
              {massShippedMutation.isPending ? 'Đang xử lý...' : 'Mass shipped'}
            </button>
          )}
          {canBoSungGhiChu && (
            <button
              onClick={() => setNoteModalOpen(true)}
              disabled={selectedIds.length === 0}
              className="rounded bg-gray-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bổ sung ghi chú
            </button>
          )}
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

      {/* Data table - matching gvDonHang in EditOrder.aspx */}
      {!isLoading && !error && data && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-100">
                <tr>
                  <th className="w-8 px-1 py-2 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === data.data.length}
                      onChange={handleSelectAll}
                      className="rounded border-gray-400 bg-white"
                    />
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    Edit
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-bold uppercase text-gray-700">
                    THÔNG TIN ĐH
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    USERNAME
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    QUỐC GIA
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    LINK
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    HÌNH
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    THUẾ/ PHÍ
                  </th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    GIÁ WEB
                  </th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    SL
                  </th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    % CÔNG
                  </th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    CÔNG NGOẠI TỆ
                  </th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    TỔNG NGOẠI TỆ
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    LOẠI TIỀN
                  </th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    TỶ GIÁ
                  </th>
                  <th className="px-1 py-2 text-right text-xs font-medium uppercase text-gray-500">
                    TỔNG VNĐ
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    VN STATUS
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    ĐỢT HÀNG
                  </th>
                  <th className="px-1 py-2 text-left text-xs font-medium uppercase text-gray-500">
                    GHI CHÚ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.data.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    {/* Checkbox */}
                    <td className="px-1 py-1 text-gray-900">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(order.id)}
                        onChange={() => handleSelect(order.id)}
                        className="rounded border-gray-400 bg-white"
                      />
                    </td>

                    {/* Edit/Trọn gói - matching HangKhoan logic in C# */}
                    <td className="px-1 py-1 whitespace-nowrap">
                      {order.hangKhoan ? (
                        <span className="text-gray-500">Trọn gói</span>
                      ) : (
                        <Link
                          href={`/admin/orders/edit?id=${order.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Detail
                        </Link>
                      )}
                    </td>

                    {/* THÔNG TIN ĐH - matching ID, ngaymuahang, ordernumber, trangthaiOrder in C# */}
                    <td className="px-1 py-1 text-left whitespace-nowrap text-gray-900">
                      <div className="text-left">
                        <span className="font-bold">Mã ĐH: </span>{order.id}
                        <br />
                        <span className="font-bold">Ngày ĐH: </span>{formatDate(order.ngayMuaHang)}
                        <br />
                        <span className="font-bold">OrderNumber: </span>{order.orderNumber}
                        <br />
                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-medium ${OrderStatusConfig[order.trangThaiOrder as OrderStatus]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {order.trangThaiOrder}
                        </span>
                      </div>
                    </td>

                    {/* USERNAME + Vùng miền - matching username, LinkTaiKhoanMang, VungMien in C# */}
                    <td className="px-1 py-1 text-left whitespace-nowrap text-gray-900">
                      {order.linkTaiKhoanMang ? (
                        <a
                          href={order.linkTaiKhoanMang}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {order.username}
                        </a>
                      ) : (
                        <span>{order.username}</span>
                      )}
                      <br />
                      <span className="font-medium">Vùng miền: </span>{order.vungMien || '-'}
                    </td>

                    {/* QUỐC GIA */}
                    <td className="px-1 py-1 text-left whitespace-nowrap text-gray-900">
                      {order.tenQuocGia || '-'}
                    </td>

                    {/* LINK - matching linkweb, corlor, size in C# */}
                    <td className="px-1 py-1 text-left max-w-[100px] text-gray-900">
                      {order.linkWeb ? (
                        <a
                          href={order.linkWeb}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-900 block truncate font-medium"
                        >
                          {order.linkWeb}
                        </a>
                      ) : (
                        '-'
                      )}
                      <div className="text-left">
                        <span className="font-medium">Màu: </span>{order.color || '-'}
                        <br />
                        <span className="font-medium">Size: </span>{order.size || '-'}
                      </div>
                    </td>

                    {/* HÌNH */}
                    <td className="px-1 py-1 text-gray-900">
                      {order.linkHinh ? (
                        <img
                          src={order.linkHinh}
                          alt="Product"
                          className="h-[50px] w-auto"
                        />
                      ) : (
                        '-'
                      )}
                    </td>

                    {/* THUẾ/PHÍ - matching phuthu, saleoff, shipUSA, tax in C# */}
                    <td className="px-1 py-1 text-left whitespace-nowrap text-gray-900">
                      <div className="text-left">
                        <span className="font-medium">Phụ thu: </span>{formatNumber(order.phuThu)}
                        <br />
                        <span className="font-medium">Sale off: </span>{formatNumber(order.saleOff)}
                        <br />
                        <span className="font-medium">ShipUS: </span>{formatNumber(order.shipUsa)}
                        <br />
                        <span className="font-medium">Tax: </span>{formatNumber(order.tax)}
                      </div>
                    </td>

                    {/* GIÁ WEB */}
                    <td className="px-1 py-1 text-right whitespace-nowrap text-gray-900">
                      {formatNumber(order.donGiaWeb)}
                    </td>

                    {/* SL */}
                    <td className="px-1 py-1 text-right whitespace-nowrap text-gray-900">
                      {order.soLuong}
                    </td>

                    {/* % CÔNG */}
                    <td className="px-1 py-1 text-right whitespace-nowrap text-gray-900">
                      {formatNumber(order.cong)}
                    </td>

                    {/* CÔNG NGOẠI TỆ */}
                    <td className="px-1 py-1 text-right whitespace-nowrap text-gray-900">
                      {formatNumber(order.tienCongUsd)}
                    </td>

                    {/* TỔNG NGOẠI TỆ */}
                    <td className="px-1 py-1 text-right whitespace-nowrap text-gray-900">
                      {formatNumber(order.tongTienUsd)}
                    </td>

                    {/* LOẠI TIỀN */}
                    <td className="px-1 py-1 text-left whitespace-nowrap text-gray-900">
                      {order.loaiTien || 'USD'}
                    </td>

                    {/* TỶ GIÁ */}
                    <td className="px-1 py-1 text-right whitespace-nowrap text-gray-900">
                      {formatNumber(order.tyGia)}
                    </td>

                    {/* TỔNG VNĐ */}
                    <td className="px-1 py-1 text-right whitespace-nowrap font-medium">
                      {formatNumber(order.tongTienVnd)}
                    </td>

                    {/* VN STATUS - matching "Đợt hàng {0:dd/MM/yyyy}" format in C# */}
                    <td className="px-1 py-1 text-left whitespace-nowrap text-gray-900">
                      {order.ngayVeVn ? `Đợt hàng ${formatDate(order.ngayVeVn)}` : '-'}
                    </td>

                    {/* ĐỢT HÀNG */}
                    <td className="px-1 py-1 text-left whitespace-nowrap text-gray-900">
                      {order.tenDotHang || '-'}
                    </td>

                    {/* GHI CHÚ */}
                    <td className="px-1 py-1 text-left max-w-[150px] truncate text-gray-900">
                      {order.ghiChu || order.adminNote || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination - matching ucPhanTrang in C# */}
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
              className="rounded-lg border border-gray-400 bg-white px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(data.page + 1)}
              disabled={data.page === totalPages}
              className="rounded-lg border border-gray-400 bg-white px-3 py-1 text-sm hover:bg-gray-100 disabled:opacity-50"
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

      {/* Confirmation Modal */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        onConfirm={() => {
          confirmModal.onConfirm();
          setConfirmModal(prev => ({ ...prev, open: false }));
        }}
        onCancel={() => setConfirmModal(prev => ({ ...prev, open: false }))}
      />

      {/* Return Date Modal */}
      <ReturnDateModal
        open={returnDateModalOpen}
        orderIds={selectedIds}
        onClose={() => setReturnDateModalOpen(false)}
      />

      {/* Note Modal */}
      <NoteModal
        open={noteModalOpen}
        orderIds={selectedIds}
        onClose={() => setNoteModalOpen(false)}
      />
    </div>
  );
}