'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getOrder, updateOrderDetail, getExchangeRatesForEdit, getProductTypesForEdit, getCountries, getUsernames, uploadOrderImage, calculateServiceFee } from '@/lib/api';

const STYLES = {
  input: 'w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200',
  select: 'w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 cursor-pointer',
  label: 'block text-sm font-medium text-gray-700 mb-1.5',
  card: 'bg-white rounded-xl shadow-sm border border-gray-100 p-6',
  sectionTitle: 'text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100',
  buttonPrimary: 'px-6 py-2.5 bg-cyan-500 text-white font-medium rounded-lg hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200',
  buttonSecondary: 'px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200',
};

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
// Number fields must be registered with { valueAsNumber: true } so React Hook Form
// converts <input type="number"> string values to numbers before zod validates.
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
  soluong: z.number({ error: 'Số lượng phải là số' }).min(1, 'Số lượng phải lớn hơn 0'),
  dongiaweb: z.number({ error: 'Đơn giá phải là số' }).min(0, 'Đơn giá phải là số'),

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

  // References (number from <select> setValueAs)
  LoaiHangID: z.number().optional(),
  QuocGiaID: z.number().optional(),
});

type OrderEditFormData = z.input<typeof orderEditFormSchema>;

/**
 * Loading skeleton component
 */
function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="h-7 bg-gray-100 animate-pulse rounded w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-14 bg-gray-100 animate-pulse rounded-lg"></div>
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
      <div className="bg-red-50 border border-red-100 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-red-800 font-semibold">Lỗi</h2>
        </div>
        <p className="text-red-600 text-sm mb-4">{message}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors cursor-pointer"
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
  // Mirror C# giaTienCong.TienCong1Mon — used as fixed fee per item when !TinhTheoPhanTram
  const [tienCong1Mon, setTienCong1Mon] = useState<number>(0);
  const isInitialLoad = useRef(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Mirror old C# EditOrderDetail + EditOrderDetail.aspx changetygia/changeloaihang:
  // - Initial load: only enable/disable cong field (preserve existing order cong value)
  // - User changes loaiTien/donGiaWeb: auto-set cong to DB default (TienCong1Mon) like LayPhanTramCongTheoLoaiTien
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
          setTienCong1Mon(Number(result.tienCong1Mon) || 0);
          if (isInitialLoad.current) {
            isInitialLoad.current = false;
          } else if (result.tinhTheoPhanTram) {
            setValue('cong', result.tienCong1Mon);
          }
        } catch (error) {
          console.error('Error fetching GiaTienCong:', error);
        }
      }
    };
    fetchGiaTienCong();
  }, [watchedUsername, watchedLoaiTien, watchedFields[0], setValue]);

  // Calculate prices when fields change.
  // Mirror C# OrderServices.TinhTienOrder (OrderServices.cs:77-108) exactly:
  //   num = (1 - saleoff/100) * dongia * soLuong
  //   if TinhTheoPhanTram: tienCongUSD = num * cong/100; tienCongVND = tienCongUSD * tygia
  //   else:                tienCongUSD = 0;             tienCongVND = TienCong1Mon * soLuong
  //   num += num * tax/100   (tax LÀ PHẦN TRĂM)
  //   num += ship * soLuong
  //   num += phuThu * soLuong
  //   tongTienUSD = num + tienCongUSD
  //   tongTienVND = RoundUp(num * tygia + tienCongVND, 0)
  useEffect(() => {
    const [dongiaweb, saleoff, phuthu, shipUSA, tax, cong, tygia, soluong] = watchedFields;

    if (!dongiaweb || isNaN(dongiaweb)) return;

    const sl = soluong || 1;
    const tygiaNum = Number(tygia) || 1;

    // num = giaSauOff × soLuong (tổng)
    let num = (1 - (saleoff || 0) / 100) * dongiaweb * sl;

    // tienCong — branch theo congEnabled (== TinhTheoPhanTram trong C#)
    let tienCongUSD: number;
    let tienCongVND: number;
    if (congEnabled) {
      tienCongUSD = num * (cong || 0) / 100;
      tienCongVND = tienCongUSD * tygiaNum;
    } else {
      tienCongUSD = 0;
      tienCongVND = tienCong1Mon * sl;
    }

    // tax là %, ship/phuThu là số tuyệt đối/món
    num += num * 0.01 * (tax || 0);
    num += (shipUSA || 0) * sl;
    num += (phuthu || 0) * sl;

    const tongTienUSD = num + tienCongUSD;
    // RoundUp đến số nguyên (EnhancedMath.RoundUp(..., 0))
    const tongTienVND = Math.ceil(num * tygiaNum + tienCongVND);

    // giaSauOff per-unit (giữ nguyên ý nghĩa hiển thị field)
    const giaSauOffPerUnit = dongiaweb * (1 - (saleoff || 0) / 100);

    setValue('giasauoffUSD', Math.round(giaSauOffPerUnit * 100) / 100);
    setValue('giasauoffVND', Math.round(giaSauOffPerUnit * tygiaNum));
    setValue('tiencongUSD', Math.round(tienCongUSD * 100) / 100);
    setValue('tiencongVND', Math.round(tienCongVND));
    setValue('tongtienUSD', Math.round(tongTienUSD * 100) / 100);
    setValue('tongtienVND', tongTienVND);
  }, [watchedFields, congEnabled, tienCong1Mon, setValue]);

  // Scroll to top when error occurs
  useEffect(() => {
    if (errorMessage) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [errorMessage]);

  // Populate form when order loads
  useEffect(() => {
    if (order) {
      // Map API response (various formats) to form fields (snake_case like old code).
      // SQL Server DECIMAL columns come back as strings via sequelize — coerce to number
      // so zod's z.number() validation passes.
      const o = order as any;
      const toNum = (v: any, fallback = 0): number => {
        if (v === null || v === undefined || v === '') return fallback;
        const n = Number(v);
        return Number.isFinite(n) ? n : fallback;
      };
      setValue('ordernumber', o.ordernumber || o.OrderNumber || o.ordernumber || '');
      setValue('username', o.username || o.UserName || '');
      setValue('linkweb', o.linkweb || o.LinkWeb || o.linkweb || '');
      setValue('linkhinh', o.linkhinh || o.LinkHinh || o.linkhinh || '');
      setValue('corlor', o.corlor || o.Color || o.corlor || '');
      setValue('size', o.size || o.Size || '');
      setValue('soluong', toNum(o.soluong ?? o.SoLuong, 1));
      setValue('dongiaweb', toNum(o.dongiaweb ?? o.DonGiaWeb));
      setValue('saleoff', toNum(o.saleoff ?? o.SaleOff));
      setValue('phuthu', toNum(o.phuthu ?? o.PhuThu));
      setValue('shipUSA', toNum(o.shipUSA ?? o.ShipUSA));
      setValue('tax', toNum(o.tax ?? o.Tax));
      setValue('cong', toNum(o.cong ?? o.Cong));
      setValue('loaitien', o.loaitien || o.LoaiTien || o.loaitien || 'USD');
      setValue('tygia', toNum(o.tygia ?? o.TyGia, 1));
      setValue('giasauoffUSD', toNum(o.giasauoffUSD ?? o.GiaSauOffUSD));
      setValue('giasauoffVND', toNum(o.giasauoffVND ?? o.GiaSauOffVND));
      setValue('tiencongUSD', toNum(o.tiencongUSD ?? o.TienCongUSD));
      setValue('tiencongVND', toNum(o.tiencongVND ?? o.TienCongVND));
      setValue('tongtienUSD', toNum(o.tongtienUSD ?? o.TongTienUSD));
      setValue('tongtienVND', toNum(o.tongtienVND ?? o.TongTienVND));
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
      const loaiHang = o.LoaiHangID ?? o.loaiHangId;
      const quocGia = o.QuocGiaID ?? o.quocGiaId;
      setValue('LoaiHangID', loaiHang ? toNum(loaiHang, 0) || undefined : undefined);
      setValue('QuocGiaID', quocGia ? toNum(quocGia, 0) || undefined : undefined);
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
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['order-status-counts'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['order', orderId], refetchType: 'all' }),
      ]);
      router.push(returnUrl);
      router.refresh();
    },
    onError: (error: Error) => {
      // Handle closed period error
      if (error.message?.includes('closed_period')) {
        setErrorMessage('Không được cập nhật đơn hàng này do đã đóng kỳ');
      } else if (error.message?.includes('debt_locked')) {
        setErrorMessage('Không được cập nhật do công nợ bị khóa');
      } else {
        console.log(error);
        setErrorMessage(`Lỗi cập nhật: ${error.message}`);
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

  // Surface zod validation failures instead of silently doing nothing
  const onInvalid = (formErrors: typeof errors) => {
    const messages = Object.entries(formErrors)
      .map(([field, err]: [string, any]) => `${field}: ${err?.message || 'không hợp lệ'}`)
      .join('; ');
    setErrorMessage(`Dữ liệu không hợp lệ — ${messages}`);
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
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Error message */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-red-700">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa đơn hàng</h1>
          <p className="text-sm text-gray-500 mt-1">#{(order as any).ordernumber || (order as any).OrderNumber || orderId}</p>
        </div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay lại
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        {/* Order Info Section */}
        <div className={STYLES.card}>
          <h2 className={STYLES.sectionTitle}>Thông tin đơn hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Order Number */}
            <div>
              <label className={STYLES.label}>Số đơn hàng</label>
              <input
                {...register('ordernumber')}
                type="text"
                className={STYLES.input}
              />
              {errors.ordernumber && (
                <p className="text-red-500 text-xs mt-1">{errors.ordernumber.message}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className={STYLES.label}>Username</label>
              <select
                {...register('username')}
                className={STYLES.select}
              >
                <option value="">Chọn username</option>
                {usernames.map((u: { username: string }) => (
                  <option key={u.username} value={u.username}>
                    {u.username}
                  </option>
                ))}
              </select>
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className={STYLES.label}>Trạng thái</label>
              <select
                {...register('trangthaiOrder')}
                className={STYLES.select}
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
              <label className={STYLES.label}>Ngày mua hàng</label>
              <input
                {...register('ngaymuahang')}
                type="date"
                className={STYLES.input}
              />
            </div>

            {/* Ngày về VN */}
            <div>
              <label className={STYLES.label}>Ngày về VN</label>
              <input
                {...register('ngayveVN')}
                type="date"
                className={STYLES.input}
              />
            </div>

            {/* Loại hàng */}
            <div>
              <label className={STYLES.label}>Loại hàng</label>
              <select
                {...register('LoaiHangID', {
                  setValueAs: (value) => (value ? (isNaN(Number(value)) ? undefined : Number(value)) : undefined),
                })}
                className={STYLES.select}
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
              <label className={STYLES.label}>Quốc gia</label>
              <select
                {...register('QuocGiaID', {
                  setValueAs: (value) => (value ? (isNaN(Number(value)) ? undefined : Number(value)) : undefined),
                })}
                className={STYLES.select}
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
        <div className={STYLES.card}>
          <h2 className={STYLES.sectionTitle}>Thông tin sản phẩm</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Link web */}
            <div className="md:col-span-2">
              <label className={STYLES.label}>Link sản phẩm</label>
              <input
                {...register('linkweb')}
                type="text"
                placeholder="https://..."
                className={STYLES.input}
              />
            </div>

            {/* Link hình */}
            <div>
              <label className={STYLES.label}>Link hình ảnh</label>
              <input
                {...register('linkhinh')}
                type="text"
                placeholder="https://..."
                className={STYLES.input}
              />
            </div>

            {/* Upload hình */}
            <div>
              <label className={STYLES.label}>Tải lên hình ảnh</label>
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
                className={`${STYLES.input} file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 cursor-pointer`}
              />
              {imagePreview && (
                <div className="mt-3 p-2 bg-gray-50 rounded-lg inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 w-auto object-contain" />
                </div>
              )}
            </div>

            {/* Màu sắc */}
            <div>
              <label className={STYLES.label}>Màu sắc</label>
              <input
                {...register('corlor')}
                type="text"
                className={STYLES.input}
              />
            </div>

            {/* Size */}
            <div>
              <label className={STYLES.label}>Size</label>
              <input
                {...register('size')}
                type="text"
                className={STYLES.input}
              />
            </div>

            {/* Số lượng */}
            <div>
              <label className={STYLES.label}>Số lượng</label>
              <input
                {...register('soluong', { valueAsNumber: true })}
                type="number"
                min="1"
                className={STYLES.input}
              />
              {errors.soluong && (
                <p className="text-red-500 text-xs mt-1">{errors.soluong.message}</p>
              )}
            </div>

            {/* Đơn giá web */}
            <div>
              <label className={STYLES.label}>Đơn giá web</label>
              <input
                {...register('dongiaweb', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className={STYLES.input}
              />
              {errors.dongiaweb && (
                <p className="text-red-500 text-xs mt-1">{errors.dongiaweb.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className={STYLES.card}>
          <h2 className={STYLES.sectionTitle}>Thông tin giá</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Sale off */}
            <div>
              <label className={STYLES.label}>Sale off (%)</label>
              <input
                {...register('saleoff', { valueAsNumber: true })}
                type="number"
                min="0"
                max="100"
                className={STYLES.input}
              />
            </div>

            {/* Phụ thu */}
            <div>
              <label className={STYLES.label}>Phụ thu</label>
              <input
                {...register('phuthu', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className={STYLES.input}
              />
            </div>

            {/* Ship USA */}
            <div>
              <label className={STYLES.label}>Ship USA</label>
              <input
                {...register('shipUSA', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className={STYLES.input}
              />
            </div>

            {/* Tax */}
            <div>
              <label className={STYLES.label}>Thuế</label>
              <input
                {...register('tax', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className={STYLES.input}
              />
            </div>

            {/* % Công */}
            <div>
              <label className={STYLES.label}>% Công</label>
              <input
                {...register('cong', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                disabled={!congEnabled}
                className={`${STYLES.input} ${!congEnabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : ''}`}
              />
            </div>

            {/* Loại tiền */}
            <div>
              <label className={STYLES.label}>Loại tiền</label>
              <select
                {...register('loaitien')}
                className={STYLES.select}
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
              <label className={STYLES.label}>Tỷ giá</label>
              <input
                {...register('tygia', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                className={STYLES.input}
              />
            </div>

            {/* Spacer */}
            <div></div>

            {/* Readonly calculated values */}
            <div>
              <label className={STYLES.label}>Giá sau off (USD)</label>
              <input
                {...register('giasauoffUSD', { valueAsNumber: true })}
                type="number"
                step="0.01"
                readOnly
                className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-lg text-gray-600"
              />
            </div>

            <div>
              <label className={STYLES.label}>Giá sau off (VND)</label>
              <input
                {...register('giasauoffVND', { valueAsNumber: true })}
                type="number"
                readOnly
                className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-lg text-gray-600"
              />
            </div>

            <div>
              <label className={STYLES.label}>Tiền công (USD)</label>
              <input
                {...register('tiencongUSD', { valueAsNumber: true })}
                type="number"
                step="0.01"
                readOnly
                className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-lg text-gray-600"
              />
            </div>

            <div>
              <label className={STYLES.label}>Tiền công (VND)</label>
              <input
                {...register('tiencongVND', { valueAsNumber: true })}
                type="number"
                readOnly
                className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-lg text-gray-600"
              />
            </div>

            <div>
              <label className={STYLES.label}>Tổng tiền (USD)</label>
              <input
                {...register('tongtienUSD', { valueAsNumber: true })}
                type="number"
                step="0.01"
                readOnly
                className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-lg text-gray-600"
              />
            </div>

            <div>
              <label className={STYLES.label}>Tổng tiền (VND)</label>
              <input
                {...register('tongtienVND', { valueAsNumber: true })}
                type="number"
                readOnly
                className="w-full px-3 py-2.5 border border-gray-100 bg-gray-50 rounded-lg text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className={STYLES.card}>
          <h2 className={STYLES.sectionTitle}>Ghi chú</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Ghi chú */}
            <div>
              <label className={STYLES.label}>Ghi chú</label>
              <textarea
                {...register('ghichu')}
                rows={3}
                className={`${STYLES.input} resize-none`}
              />
            </div>

            {/* Admin note */}
            <div>
              <label className={STYLES.label}>Admin ghi chú</label>
              <textarea
                {...register('adminNote')}
                rows={3}
                className={`${STYLES.input} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleBack}
            className={STYLES.buttonSecondary}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={STYLES.buttonPrimary}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Đang lưu...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Cập nhật
              </span>
            )}
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
