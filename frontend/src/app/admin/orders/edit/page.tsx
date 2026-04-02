'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getOrder, updateOrderDetail, getExchangeRatesForEdit, getProductTypesForEdit, getCountries, getUsernames, uploadOrderImage, calculateServiceFee } from '@/lib/api';

/**
 * Edit Order Detail Page
 *
 * Features:
 * - Single: /edit?id=123
 * - Edit full order details (from EditOrderDetail.aspx.cs)
 * - Upload and resize image to 640x480
 * - Calculate prices with exchange rate
 * - Check permission before update (KiemTraDuacCapNhatDonHang)
 *
 * Field names match old ASP.NET code (snake_case)
 */

// Zod schema with field names matching old ASP.NET code
const orderEditFormSchema = z.object({
  // Order info (snake_case like old code)
  ordernumber: z.string().min(1, 'Số đơn hàng là bắt buộc'),
  username: z.string().min(1, 'Username là bắt buộc'),
  trangthaiOrder: z.string().optional(),

  // Product info (snake_case like old code)
  linkweb: z.string().optional(),
  linkhinh: z.string().optional(),
  corlor: z.string().optional(),
  size: z.string().optional(),
  soluong: z.number().min(1, 'Số lượng phải lớn hơn 0'),
  dongiaweb: z.number().min(0, 'Đơn giá phải là số'),

  // Pricing (snake_case like old code)
  saleoff: z.number().min(0).default(0),
  phuthu: z.number().min(0).default(0),
  shipUSA: z.number().min(0).default(0),
  tax: z.number().min(0).default(0),
  cong: z.number().min(0).default(0),

  // Currency (snake_case like old code)
  loaitien: z.string().min(1, 'Loại tiền là bắt buộc'),
  tygia: z.number().min(0),

  // Calculated values (snake_case like old code)
  giasauoffUSD: z.number().min(0).default(0),
  giasauoffVND: z.number().min(0).default(0),
  tiencongUSD: z.number().min(0).default(0),
  tiencongVND: z.number().min(0).default(0),
  tongtienUSD: z.number().min(0).default(0),
  tongtienVND: z.number().min(0).default(0),

  // Additional info (snake_case like old code)
  ghichu: z.string().optional(),
  adminNote: z.string().optional(),
  ngaymuahang: z.string().optional(),
  ngayveVN: z.string().optional(),

  // References (like old code)
  LoaiHangID: z.union([z.number(), z.string()]).optional(),
  QuocGiaID: z.union([z.number(), z.string()]).optional(),
}).transform((data) => ({
  ...data,
  soluong: Number(data.soluong),
  dongiaweb: Number(data.dongiaweb),
  saleoff: Number(data.saleoff),
  phuthu: Number(data.phuthu),
  shipUSA: Number(data.shipUSA),
  tax: Number(data.tax),
  cong: Number(data.cong),
  tygia: Number(data.tygia),
  giasauoffUSD: Number(data.giasauoffUSD),
  giasauoffVND: Number(data.giasauoffVND),
  tiencongUSD: Number(data.tiencongUSD),
  tiencongVND: Number(data.tiencongVND),
  tongtienUSD: Number(data.tongtienUSD),
  tongtienVND: Number(data.tongtienVND),
  LoaiHangID: data.LoaiHangID ? (typeof data.LoaiHangID === 'string' ? (data.LoaiHangID ? Number(data.LoaiHangID) : undefined) : data.LoaiHangID) : undefined,
  QuocGiaID: data.QuocGiaID ? (typeof data.QuocGiaID === 'string' ? (data.QuocGiaID ? Number(data.QuocGiaID) : undefined) : data.QuocGiaID) : undefined,
}));

type OrderEditFormData = z.input<typeof orderEditFormSchema>;

/**
 * Loading skeleton component
 */
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 bg-gray-200 animate-pulse rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-200 animate-pulse rounded"></div>
        ))}
      </div>
    </div>
  );
}

/**
 * Error state component
 */
function ErrorDisplay({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-red-800 font-semibold mb-2">Lỗi</h2>
        <p className="text-red-600">{message}</p>
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Quay lại
        </button>
      </div>
    </div>
  );
}

/**
 * Edit Order Detail Page Content
 */
function EditOrderDetailPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [congEnabled, setCongEnabled] = useState<boolean>(true);

  // Get order ID from query param
  const orderId = parseInt(searchParams.get('id') || '', 10);
  const returnUrl = searchParams.get('rt') || '/admin/orders/list';

  // Fetch order data
  const { data: order, isLoading: isLoadingOrder, error: orderError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !isNaN(orderId) && orderId > 0,
  });

  // Fetch exchange rates
  const { data: exchangeRates = [] } = useQuery({
    queryKey: ['exchange-rates-edit'],
    queryFn: getExchangeRatesForEdit,
  });

  // Fetch product types
  const { data: productTypes = [] } = useQuery({
    queryKey: ['product-types-edit'],
    queryFn: getProductTypesForEdit,
  });

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  // Fetch usernames
  const { data: usernames = [] } = useQuery({
    queryKey: ['usernames'],
    queryFn: getUsernames,
  });

  // React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderEditFormData>({
    resolver: zodResolver(orderEditFormSchema),
    defaultValues: {
      username: '',
      ordernumber: '',
      saleoff: 0,
      phuthu: 0,
      shipUSA: 0,
      tax: 0,
      cong: 0,
      giasauoffUSD: 0,
      giasauoffVND: 0,
      tiencongUSD: 0,
      tiencongVND: 0,
      tongtienUSD: 0,
      tongtienVND: 0,
    },
  });

  // Watch fields for calculation (snake_case)
  const watchedFields = watch(['dongiaweb', 'saleoff', 'phuthu', 'shipUSA', 'tax', 'cong', 'tygia', 'soluong']);
  const watchedUsername = watch('username');
  const watchedLoaiTien = watch('loaitien');

  // Fetch GiaTienCong when username or loaitien changes
  useEffect(() => {
    const fetchGiaTienCong = async () => {
      if (watchedUsername && watchedLoaiTien && watchedFields[0]) {
        try {
          const result = await calculateServiceFee({
            loaitien: watchedLoaiTien,
            dongiaweb: watchedFields[0],
            username: watchedUsername,
          });
          setCongEnabled(result.tinhTheoPhanTram);
          if (result.tinhTheoPhanTram) {
            setValue('cong', result.tienCong1Mon);
          } else {
            setValue('cong', 0);
          }
        } catch (error) {
          console.error('Error fetching GiaTienCong:', error);
        }
      }
    };
    fetchGiaTienCong();
  }, [watchedUsername, watchedLoaiTien, watchedFields[0], setValue]);

  // Calculate prices when fields change
  useEffect(() => {
    const [dongiaweb, saleoff, phuthu, shipUSA, tax, cong, tygia, soluong] = watchedFields;

    if (dongiaweb && !isNaN(dongiaweb)) {
      const giasauoffUSD = dongiaweb * (1 - (saleoff || 0) / 100);
      const tongtienUSD = (giasauoffUSD + (phuthu || 0) + (shipUSA || 0) + (tax || 0)) * (soluong || 1);
      const tiencongUSD = cong ? (cong / 100) * giasauoffUSD * (soluong || 1) : 0;

      setValue('giasauoffUSD', Math.round(giasauoffUSD * 100) / 100);
      setValue('tongtienUSD', Math.round(tongtienUSD * 100) / 100);
      setValue('tiencongUSD', Math.round(tiencongUSD * 100) / 100);

      // VND calculation
      const tygiaNum = Number(tygia) || 1;
      setValue('giasauoffVND', Math.round(giasauoffUSD * tygiaNum));
      setValue('tongtienVND', Math.round(tongtienUSD * tygiaNum));
      setValue('tiencongVND', Math.round(tiencongUSD * tygiaNum));
    }
  }, [watchedFields, setValue]);

  // Populate form when order loads
  useEffect(() => {
    if (order) {
      // Map API response (various formats) to form fields (snake_case like old code)
      const o = order as any;
      setValue('ordernumber', o.ordernumber || o.OrderNumber || o.ordernumber || '');
      setValue('username', o.username || o.UserName || '');
      setValue('linkweb', o.linkweb || o.LinkWeb || o.linkweb || '');
      setValue('linkhinh', o.linkhinh || o.LinkHinh || o.linkhinh || '');
      setValue('corlor', o.corlor || o.Color || o.corlor || '');
      setValue('size', o.size || o.Size || '');
      setValue('soluong', o.soluong || o.SoLuong || o.soluong || 1);
      setValue('dongiaweb', o.dongiaweb || o.DonGiaWeb || o.dongiaweb || 0);
      setValue('saleoff', o.saleoff || o.SaleOff || o.saleoff || 0);
      setValue('phuthu', o.phuthu || o.PhuThu || o.phuthu || 0);
      setValue('shipUSA', o.shipUSA || o.ShipUSA || o.shipUSA || 0);
      setValue('tax', o.tax || o.Tax || 0);
      setValue('cong', o.cong || o.Cong || 0);
      setValue('loaitien', o.loaitien || o.LoaiTien || o.loaitien || 'USD');
      setValue('tygia', o.tygia || o.TyGia || o.tygia || 1);
      setValue('giasauoffUSD', o.giasauoffUSD || o.GiaSauOffUSD || o.giasauoffUSD || 0);
      setValue('giasauoffVND', o.giasauoffVND || o.GiaSauOffVND || o.giasauoffVND || 0);
      setValue('tiencongUSD', o.tiencongUSD || o.TienCongUSD || o.tiencongUSD || 0);
      setValue('tiencongVND', o.tiencongVND || o.TienCongVND || o.tiencongVND || 0);
      setValue('tongtienUSD', o.tongtienUSD || o.TongTienUSD || o.tongtienUSD || 0);
      setValue('tongtienVND', o.tongtienVND || o.TongTienVND || o.tongtienVND || 0);
      setValue('ghichu', o.ghichu || o.GhiChu || o.ghichu || '');
      setValue('trangthaiOrder', o.trangthaiOrder || o.TrangThaiOrder || o.trangthaiOrder || '');
      setValue('adminNote', o.adminNote || o.AdminNote || '');
      // Handle date fields - may come as string or Date
      const parseDate = (d: any) => {
        if (!d) return '';
        if (typeof d === 'string') {
          const date = new Date(d);
          if (!isNaN(date.getTime())) return date.toISOString().split('T')[0];
        }
        if (d instanceof Date) return d.toISOString().split('T')[0];
        return '';
      };
      setValue('ngaymuahang', parseDate(o.ngaymuahang || o.NgayMuaHang || o.ngaymuahang));
      setValue('ngayveVN', parseDate(o.ngayveVN || o.NgayVeVN || o.ngayveVN));
      setValue('LoaiHangID', o.LoaiHangID || o.loaiHangId || undefined);
      setValue('QuocGiaID', o.QuocGiaID || o.quocGiaId || undefined);
      // Set image preview
      if (o.linkhinh || o.LinkHinh || o.linkhinh) {
        setImagePreview(o.linkhinh || o.LinkHinh || o.linkhinh);
      }
    }
  }, [order, setValue, usernames]);

  // Update order detail mutation (full flow with permission check)
  const updateOrderDetailMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateOrderDetail(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      router.push(returnUrl);
    },
    onError: (error: Error) => {
      // Handle closed period error
      if (error.message?.includes('closed_period')) {
        alert('Không được cập nhật đơn hàng này do đã đóng kỳ');
      } else {
        alert(`Lỗi cập nhật: ${error.message}`);
      }
    },
  });

  // Handle form submit (uses updateOrderDetail for full edit flow)
  const onSubmit = async (data: OrderEditFormData) => {
    try {
      // Get current user from auth store
      const { useAuthStore } = await import('@/hooks/use-auth');
      const currentUser = useAuthStore.getState().user;

      // Upload image if selected
      let linkhinh = data.linkhinh || '';
      if (imageFile) {
        const uploadResult = await uploadOrderImage(orderId, imageFile);
        linkhinh = uploadResult.linkHinh || uploadResult.linkhinh || '';
      }

      // Keep date in YYYY-MM-DD format (SQL Server expected format)
      const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        // Already in YYYY-MM-DD format from input type="date", return as-is
        return dateStr;
      };

      const payload = {
        username: data.username,
        linkweb: data.linkweb || '',
        linkhinh,
        corlor: data.corlor || '',
        size: data.size || '',
        soluong: data.soluong,
        dongiaweb: data.dongiaweb,
        saleoff: data.saleoff || 0,
        phuthu: data.phuthu || 0,
        shipUSA: data.shipUSA || 0,
        tax: data.tax || 0,
        cong: data.cong || 0,
        loaitien: data.loaitien || 'USD',
        ghichu: data.ghichu || '',
        tygia: data.tygia || 1,
        giasauoffUSD: data.giasauoffUSD || 0,
        giasauoffVND: data.giasauoffVND || 0,
        tiencongUSD: data.tiencongUSD || 0,
        tiencongVND: data.tiencongVND || 0,
        tongtienUSD: data.tongtienUSD || 0,
        tongtienVND: data.tongtienVND || 0,
        ordernumber: data.ordernumber || '',
        trangthaiOrder: data.trangthaiOrder || '',
        ngaymuahang: formatDate(data.ngaymuahang || ''),
        ngayveVN: formatDate(data.ngayveVN || ''),
        adminNote: data.adminNote || '',
        LoaiHangID: data.LoaiHangID,
        QuocGiaID: data.QuocGiaID,
        usernamesave: currentUser?.username || '',
        nguoiTao: currentUser?.username || '',
      };

      await updateOrderDetailMutation.mutateAsync({ id: orderId, data: payload });
    } catch {
      // Error handled in mutation
    }
  };

  // Handle back
  const handleBack = () => {
    router.push(returnUrl);
  };

  // Loading state
  if (isLoadingOrder) {
    return (
      <div className="container mx-auto p-6">
        <LoadingSkeleton />
      </div>
    );
  }

  // Error state
  if (orderError || !order) {
    return (
      <div className="container mx-auto p-6">
        <ErrorDisplay
          message={orderError?.message || 'Không tìm thấy đơn hàng'}
          onBack={handleBack}
        />
      </div>
    );
  }

  // Order statuses (match old ASP.NET code)
  const orderStatuses = [
    'Received',
    'Ordered',
    'Shipped',
    'Completed',
    'Cancelled',
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chỉnh sửa đơn hàng #{(order as any).ordernumber || (order as any).orderNumber || order.orderNumber}</h1>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Order Info Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Order Number */}
            <div>
              <label className="block text-sm font-medium mb-1">Số đơn hàng</label>
              <input
                {...register('ordernumber')}
                type="text"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.ordernumber && (
                <p className="text-red-500 text-sm mt-1">{errors.ordernumber.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <select
                {...register('username')}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn username</option>
                {usernames.map((u: { username: string }) => (
                  <option key={u.username} value={u.username}>
                    {u.username}
                  </option>
                ))}
              </select>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">Trạng thái</label>
              <select
                {...register('trangthaiOrder')}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Ngày mua hàng */}
            <div>
              <label className="block text-sm font-medium mb-1">Ngày mua hàng</label>
              <input
                {...register('ngaymuahang')}
                type="date"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Ngày về VN */}
            <div>
              <label className="block text-sm font-medium mb-1">Ngày về VN</label>
              <input
                {...register('ngayveVN')}
                type="date"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Loại hàng */}
            <div>
              <label className="block text-sm font-medium mb-1">Loại hàng</label>
              <select
                {...register('LoaiHangID', {
                  setValueAs: (value) => (value ? (isNaN(Number(value)) ? undefined : Number(value)) : undefined),
                })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn loại hàng</option>
                {productTypes.map((pt: { LoaiHangID: number; TenLoaiHang: string }) => (
                  <option key={pt.LoaiHangID} value={pt.LoaiHangID}>
                    {pt.TenLoaiHang}
                  </option>
                ))}
              </select>
            </div>

            {/* Quốc gia */}
            <div>
              <label className="block text-sm font-medium mb-1">Quốc gia</label>
              <select
                {...register('QuocGiaID', {
                  setValueAs: (value) => (value ? (isNaN(Number(value)) ? undefined : Number(value)) : undefined),
                })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn quốc gia</option>
                {countries.map((c: { QuocGiaID: number; TenQuocGia: string }) => (
                  <option key={c.QuocGiaID} value={c.QuocGiaID}>
                    {c.TenQuocGia}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin sản phẩm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Link web */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Link sản phẩm</label>
              <input
                {...register('linkweb')}
                type="text"
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Link hình */}
            <div>
              <label className="block text-sm font-medium mb-1">Link hình ảnh</label>
              <input
                {...register('linkhinh')}
                type="text"
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Upload hình */}
            <div>
              <label className="block text-sm font-medium mb-1">Tải lên hình ảnh</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    setImagePreview(URL.createObjectURL(file));
                  }
                }}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="mt-2 h-20 object-contain" />
              )}
            </div>

            {/* Màu sắc */}
            <div>
              <label className="block text-sm font-medium mb-1">Màu sắc</label>
              <input
                {...register('corlor')}
                type="text"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <input
                {...register('size')}
                type="text"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Số lượng */}
            <div>
              <label className="block text-sm font-medium mb-1">Số lượng</label>
              <input
                {...register('soluong')}
                type="number"
                min="1"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.soluong && (
                <p className="text-red-500 text-sm mt-1">{errors.soluong.message}</p>
              )}
            </div>

            {/* Đơn giá web */}
            <div>
              <label className="block text-sm font-medium mb-1">Đơn giá web</label>
              <input
                {...register('dongiaweb')}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
              {errors.dongiaweb && (
                <p className="text-red-500 text-sm mt-1">{errors.dongiaweb.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Thông tin giá</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Sale off */}
            <div>
              <label className="block text-sm font-medium mb-1">Sale off (%)</label>
              <input
                {...register('saleoff')}
                type="number"
                min="0"
                max="100"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Phụ thu */}
            <div>
              <label className="block text-sm font-medium mb-1">Phụ thu</label>
              <input
                {...register('phuthu')}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Ship USA */}
            <div>
              <label className="block text-sm font-medium mb-1">Ship USA</label>
              <input
                {...register('shipUSA')}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tax */}
            <div>
              <label className="block text-sm font-medium mb-1">Thuế</label>
              <input
                {...register('tax')}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* % Công */}
            <div>
              <label className="block text-sm font-medium mb-1">% Công</label>
              <input
                {...register('cong')}
                type="number"
                step="0.01"
                min="0"
                disabled={!congEnabled}
                className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 ${!congEnabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Loại tiền */}
            <div>
              <label className="block text-sm font-medium mb-1">Loại tiền</label>
              <select
                {...register('loaitien')}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                {exchangeRates.map((er: { name: string; rate: number }, idx: number) => (
                  <option key={`${er.name}-${idx}`} value={er.name}>
                    {er.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tỷ giá */}
            <div>
              <label className="block text-sm font-medium mb-1">Tỷ giá</label>
              <input
                {...register('tygia')}
                type="number"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Empty space for layout */}
            <div></div>

            {/* Readonly calculated values */}
            <div>
              <label className="block text-sm font-medium mb-1">Giá sau off (USD)</label>
              <input
                {...register('giasauoffUSD')}
                type="number"
                step="0.01"
                readOnly
                className="w-full px-3 py-2 border bg-gray-100 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Giá sau off (VND)</label>
              <input
                {...register('giasauoffVND')}
                type="number"
                readOnly
                className="w-full px-3 py-2 border bg-gray-100 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tiền công (USD)</label>
              <input
                {...register('tiencongUSD')}
                type="number"
                step="0.01"
                readOnly
                className="w-full px-3 py-2 border bg-gray-100 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tiền công (VND)</label>
              <input
                {...register('tiencongVND')}
                type="number"
                readOnly
                className="w-full px-3 py-2 border bg-gray-100 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tổng tiền (USD)</label>
              <input
                {...register('tongtienUSD')}
                type="number"
                step="0.01"
                readOnly
                className="w-full px-3 py-2 border bg-gray-100 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tổng tiền (VND)</label>
              <input
                {...register('tongtienVND')}
                type="number"
                readOnly
                className="w-full px-3 py-2 border bg-gray-100 rounded"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium mb-1">Ghi chú</label>
              <textarea
                {...register('ghichu')}
                rows={3}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Admin note */}
            <div>
              <label className="block text-sm font-medium mb-1">Admin ghi chú</label>
              <textarea
                {...register('adminNote')}
                rows={3}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Main page component with Suspense
 */
export default function EditOrderDetailPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <EditOrderDetailPageContent />
    </Suspense>
  );
}
