'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { getOrders, updateOrderReturnDate } from '@/lib/api';

/**
 * Edit Order Return Date Page
 *
 * Features:
 * - Single: /edit-return-date?id=123
 * - Mass: /edit-return-date?id=1,2,3
 * - Update Vietnam return date (ngayVeVN)
 * - Auto-generate tenDotHang = yyyyMMdd (from SP_CapNhat_NgayVeVN)
 * - Optional: change status to Completed
 * - Optional: add additional note
 * - Redirect support: rt=ch → /can-hang, default → /admin/orders
 */

// Zod schema for return date form
const returnDateFormSchema = z.object({
  ngayVeVn: z.string().min(1, 'Ngày về VN là bắt buộc'),
  boSungGhiChu: z.string().optional(),
  chuyenVeCompleted: z.boolean().optional(),
});

type ReturnDateFormData = z.infer<typeof returnDateFormSchema>;

/**
 * Edit Return Date Page Component
 */
function EditReturnDatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Get order IDs and redirect param from query param
  const idsParam = searchParams.get('id') || '';
  const returnUrl = searchParams.get('rt') === 'ch' ? '/can-hang' : '/admin/orders';
  const orderIds = idsParam ? idsParam.split(',').map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)) : [];
  const isMassUpdate = orderIds.length > 1;
  const isSingleUpdate = orderIds.length === 1;

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ReturnDateFormData>({
    resolver: zodResolver(returnDateFormSchema),
    defaultValues: {
      ngayVeVn: '',
      boSungGhiChu: '',
      chuyenVeCompleted: false,
    },
  });

  // Fetch orders data (for single or multiple)
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['orders', { ids: orderIds.join(',') }],
    queryFn: () => getOrders({ page: 1, limit: orderIds.length, ids: orderIds.join(',') }),
    enabled: orderIds.length > 0,
  });

  // Get first order for single mode
  const order = isSingleUpdate && ordersData?.data?.[0] ? ordersData.data[0] : null;
  // Get username from first order for system logging
  const username = order?.username || 'System';

  // Redirect URL based on rt param (from EditOrder_NgayVeVN.aspx.cs)

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ReturnDateFormData) => {
      if (isSingleUpdate && orderIds[0]) {
        // Single update
        await updateOrderReturnDate(orderIds[0], {
          ngayVeVn: data.ngayVeVn,
          boSungGhiChu: data.boSungGhiChu,
          chuyenVeCompleted: data.chuyenVeCompleted,
          username: username,
        });
      } else if (isMassUpdate) {
        // Mass update - call API for each order
        const promises = orderIds.map((id) =>
          updateOrderReturnDate(id, {
            ngayVeVn: data.ngayVeVn,
            boSungGhiChu: data.boSungGhiChu,
            chuyenVeCompleted: data.chuyenVeCompleted,
            username: username,
          })
        );
        await Promise.all(promises);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      router.push(returnUrl);
    },
    onError: (err) => {
      alert(`Error updating return date: ${(err as Error).message}`);
    },
  });

  // Form submit handler
  const onSubmit = (data: ReturnDateFormData) => {
    updateMutation.mutate(data);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  // No IDs provided
  if (orderIds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          Vui lòng chọn đơn hàng trước khi cập nhật ngày về.
        </div>
        <Link href="/admin/orders" className="text-blue-600 hover:underline">
          ← Quay lại danh sách orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {isMassUpdate ? `Cập nhật ngày về VN (${orderIds.length} đơn)` : 'Cập nhật ngày về VN'}
          </h1>
        </div>
      </div>

      {/* Notice */}
      <div className="rounded-lg bg-blue-50 p-3 text-blue-700 text-sm">
        Chú ý: Khi cập nhật ngày về VN hệ thống sẽ tự động tạo đợt hàng cần ship cho các item này
      </div>

      {/* Orders info */}
      {ordersData?.data && (
        <div className="rounded-lg bg-blue-50 p-4">
          {!isMassUpdate && order ? (
            // Single order - show detailed info
            <div className="space-y-2">
              <div className="flex gap-4">
                <span className="font-medium text-gray-700">Mã ĐH:</span>
                <span className="text-gray-900">#{order.id}</span>
              </div>
              {order.maSoHang && (
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700">Mã số hàng:</span>
                  <span className="text-gray-900">{order.maSoHang}</span>
                </div>
              )}
              {order.orderNumber && (
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700">OrderNumber:</span>
                  <span className="text-gray-900">{order.orderNumber}</span>
                </div>
              )}
              <div className="flex gap-4">
                <span className="font-medium text-gray-700">Username:</span>
                <span className="text-gray-900">{order.username}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium text-gray-700">Trạng thái:</span>
                <span className="font-medium text-gray-900">{order.trangThaiOrder}</span>
              </div>
              {order.ngayVeVn && (
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700">Ngày về VN hiện tại:</span>
                  <span className="text-gray-900">{new Date(order.ngayVeVn).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {order.tenDotHang && (
                <div className="flex gap-4">
                  <span className="font-medium text-gray-700">Đợt hàng:</span>
                  <span className="text-gray-900">{order.tenDotHang}</span>
                </div>
              )}
            </div>
          ) : (
            // Mass update - show list of orders
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {orderIds.length} đơn hàng được chọn:
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-1 pr-4">Mã ĐH</th>
                      <th className="py-1 pr-4">Username</th>
                      <th className="py-1 pr-4">Trạng thái</th>
                      <th className="py-1">Ngày về VN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersData.data.map((o: any) => (
                      <tr key={o.id} className="border-t border-gray-200">
                        <td className="py-1 pr-4 text-gray-900">#{o.id}</td>
                        <td className="py-1 pr-4 text-gray-900">{o.username}</td>
                        <td className="py-1 pr-4 text-gray-900">{o.trangThaiOrder}</td>
                        <td className="py-1 text-gray-900">{o.ngayVeVn ? new Date(o.ngayVeVn).toLocaleDateString('vi-VN') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-xs text-blue-600">
                (Tất cả đơn sẽ được cập nhật cùng ngày về)
              </p>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-lg bg-white p-6 shadow">
        {/* Ngay Ve VN */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Ngày về VN <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            {...register('ngayVeVn')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
          {errors.ngayVeVn && (
            <p className="mt-1 text-sm text-red-600">{errors.ngayVeVn.message}</p>
          )}
        </div>

        {/* Bo Sung Ghi Chu */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Bổ sung ghi chú
          </label>
          <textarea
            {...register('boSungGhiChu')}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            placeholder="Nhập ghi chú bổ sung..."
          />
        </div>

        {/* Chuyen Ve Completed */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            {...register('chuyenVeCompleted')}
            id="chuyenVeCompleted"
            className="rounded border-gray-300"
          />
          <label htmlFor="chuyenVeCompleted" className="text-sm font-medium text-gray-700">
            Chuyển sang trạng thái Completed
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4 border-t pt-4">
          <Link
            href="/admin/orders"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={!isDirty || updateMutation.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditReturnDatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12">Loading...</div>}>
      <EditReturnDatePageContent />
    </Suspense>
  );
}