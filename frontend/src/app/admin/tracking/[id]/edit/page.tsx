'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import {
  FiArrowLeft, FiPackage, FiUser, FiHash, FiCalendar,
  FiTruck, FiGlobe, FiTag, FiFileText, FiSave,
} from 'react-icons/fi'; // FiUser needed for username dropdown

interface TrackingData {
  TrackingID: number;
  UserName: string;
  TrackingNumber: string;
  OrderNumber: string;
  NgayDatHang: string;
  NhaVanChuyenID: number;
  QuocGiaID: number;
  TinhTrang: string;
  GhiChu: string;
  Kien: string;
  Mawb: string;
  Hawb: string;
}

interface FormData {
  username: string;
  trackingNumber: string;
  orderNumber: string;
  ngayDatHang: string;
  nhaVanChuyenId: string;
  quocGiaId: string;
  tinhTrang: string;
  ghiChu: string;
  kien: string;
  mawb: string;
  hawb: string;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface TrackingUserOption {
  UserName: string;
}

interface ShippingCarrierOption {
  NhaVanChuyenID: number;
  TenNhaVanChuyen?: string;
  Name?: string;
}

interface CountryOption {
  QuocGiaID: number;
  TenQuocGia: string;
  Name?: string;
}

const tinhTrangOptions = ['Received', 'InTransit', 'InVN', 'VNTransit', 'Completed', 'Cancelled'];

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 focus:outline-none transition-all placeholder:text-slate-400 bg-white';
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5';

function FieldWithIcon({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
      <div className="[&>input]:pl-9 [&>select]:pl-9">{children}</div>
    </div>
  );
}

export default function EditTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    username: '', trackingNumber: '', orderNumber: '',
    ngayDatHang: '',
    nhaVanChuyenId: '', quocGiaId: '', tinhTrang: 'Received',
    ghiChu: '', kien: '', mawb: '', hawb: '',
  });

  // Fetch tracking data
  const { isLoading: isFetching, error: fetchError } = useQuery({
    queryKey: ['tracking', id, 'details'],
    queryFn: async () => {
      const response = await apiClient.get<TrackingData>(`/tracking/${id}/details`);
      const data = response.data;

      // Convert date format from ISO to yyyy-MM-dd for input
      const ngayDatHang = data.NgayDatHang
        ? new Date(data.NgayDatHang).toISOString().split('T')[0]
        : '';

      setFormData({
        username: data.UserName || '',
        trackingNumber: data.TrackingNumber || '',
        orderNumber: data.OrderNumber || '',
        ngayDatHang,
        nhaVanChuyenId: data.NhaVanChuyenID?.toString() || '',
        quocGiaId: data.QuocGiaID?.toString() || '',
        tinhTrang: data.TinhTrang || 'Received',
        ghiChu: data.GhiChu || '',
        kien: data.Kien || '',
        mawb: data.Mawb || '',
        hawb: data.Hawb || '',
      });

      return data;
    },
  });

  // Fetch dropdown data from API
  const { data: userList = [] } = useQuery({
    queryKey: ['tracking-users'],
    queryFn: () => apiClient.get<TrackingUserOption[]>('/tracking/dropdown/users').then(r => r.data || []),
  });

  const { data: nhaVanChuyenList = [] } = useQuery({
    queryKey: ['nha-van-chuyen'],
    queryFn: () => apiClient.get<ShippingCarrierOption[]>('/tracking/dropdown/nha-van-chuyen').then(r => r.data || []),
  });

  const { data: quocGiaList = [] } = useQuery({
    queryKey: ['quoc-gia'],
    queryFn: () => apiClient.get<CountryOption[]>('/orders/countries').then(r => r.data || []),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: matching C# logic (line 156-158)
    if (!formData.trackingNumber.trim() || !formData.ngayDatHang.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin có dấu *');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiClient.put(`/tracking/${id}`, {
        username: formData.username,
        trackingNumber: formData.trackingNumber,
        orderNumber: formData.orderNumber,
        ngayDatHang: formData.ngayDatHang,
        nhaVanChuyenId: formData.nhaVanChuyenId ? Number(formData.nhaVanChuyenId) : undefined,
        quocGiaId: formData.quocGiaId ? Number(formData.quocGiaId) : undefined,
        tinhTrang: formData.tinhTrang,
        ghiChu: formData.ghiChu,
        kien: formData.kien,
        mawb: formData.mawb,
        hawb: formData.hawb,
      });
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
      queryClient.invalidateQueries({ queryKey: ['tracking-counts'] });
      router.push('/admin/tracking');
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 border-2 border-[#14264b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (fetchError || !formData.trackingNumber) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-rose-500">
        <FiPackage className="h-10 w-10 opacity-40" />
        <p>Lỗi tải dữ liệu</p>
        <button onClick={() => router.push('/admin/tracking')}
          className="text-sm text-slate-500 hover:text-slate-700 underline cursor-pointer">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Breadcrumb + header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/tracking"
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#14264b] transition-colors cursor-pointer">
          <FiArrowLeft className="h-4 w-4" />
          Danh sách tracking
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700 font-mono">{formData.trackingNumber}</span>
        <span className="text-slate-300">/</span>
        <span className="text-sm font-medium text-slate-700">Chỉnh sửa</span>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14264b]/10">
          <FiPackage className="h-5 w-5 text-[#14264b]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Chỉnh sửa Tracking</h1>
          <p className="text-sm text-slate-500">Cập nhật thông tin mã vận chuyển</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-5 text-sm">
          <FiTag className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section: Thông tin cơ bản */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">Thông tin cơ bản</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Tracking Number <span className="text-rose-500">*</span></label>
              <FieldWithIcon icon={FiHash}>
                <input type="text" name="trackingNumber" value={formData.trackingNumber} onChange={handleChange}
                  required className={inputCls} placeholder="VD: 1Z999AA10123456784" />
              </FieldWithIcon>
            </div>
            <div>
              <label className={labelCls}>Order Number</label>
              <FieldWithIcon icon={FiHash}>
                <input type="text" name="orderNumber" value={formData.orderNumber} onChange={handleChange}
                  className={inputCls} placeholder="Số đơn hàng" />
              </FieldWithIcon>
            </div>
            <div>
              <label className={labelCls}>Ngày đặt hàng</label>
              <FieldWithIcon icon={FiCalendar}>
                <input type="date" name="ngayDatHang" value={formData.ngayDatHang} onChange={handleChange}
                  className={inputCls} />
              </FieldWithIcon>
            </div>
          </div>
        </div>

        {/* Section: Vận chuyển */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-slate-700 mb-4 pb-3 border-b border-slate-100">Thông tin vận chuyển</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Username</label>
              <FieldWithIcon icon={FiUser}>
                <select name="username" value={formData.username} onChange={handleChange} className={inputCls}>
                  <option value="">-- Chọn username --</option>
                  {Array.isArray(userList) && userList.map((user) => (
                    <option key={user.UserName} value={user.UserName}>{user.UserName}</option>
                  ))}
                </select>
              </FieldWithIcon>
            </div>
            <div>
              <label className={labelCls}>Nhà vận chuyển</label>
              <FieldWithIcon icon={FiTruck}>
                <select name="nhaVanChuyenId" value={formData.nhaVanChuyenId} onChange={handleChange} className={inputCls}>
                  <option value="">-- Chọn nhà vận chuyển --</option>
                  {Array.isArray(nhaVanChuyenList) && nhaVanChuyenList.map((nvc) => (
                    <option key={nvc.NhaVanChuyenID} value={nvc.NhaVanChuyenID}>{nvc.TenNhaVanChuyen || nvc.Name}</option>
                  ))}
                </select>
              </FieldWithIcon>
            </div>
            <div>
              <label className={labelCls}>Quốc gia</label>
              <FieldWithIcon icon={FiGlobe}>
                <select name="quocGiaId" value={formData.quocGiaId} onChange={handleChange} className={inputCls}>
                  <option value="">-- Chọn quốc gia --</option>
                  {Array.isArray(quocGiaList) && quocGiaList.map((qg) => (
                    <option key={qg.QuocGiaID} value={qg.QuocGiaID}>{qg.TenQuocGia || qg.Name}</option>
                  ))}
                </select>
              </FieldWithIcon>
            </div>
            <div>
              <label className={labelCls}>Tình trạng</label>
              <FieldWithIcon icon={FiTag}>
                <select name="tinhTrang" value={formData.tinhTrang} onChange={handleChange} className={inputCls}>
                  {tinhTrangOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </FieldWithIcon>
            </div>
            <div>
              <label className={labelCls}>Kiện</label>
              <FieldWithIcon icon={FiPackage}>
                <input type="text" name="kien" value={formData.kien} onChange={handleChange}
                  className={inputCls} placeholder="Số kiện hàng" />
              </FieldWithIcon>
            </div>
            <div>
              <label className={labelCls}>MAWB</label>
              <FieldWithIcon icon={FiHash}>
                <input type="text" name="mawb" value={formData.mawb} onChange={handleChange}
                  className={inputCls} placeholder="Master Air Waybill" />
              </FieldWithIcon>
            </div>
            <div>
              <label className={labelCls}>HAWB</label>
              <FieldWithIcon icon={FiHash}>
                <input type="text" name="hawb" value={formData.hawb} onChange={handleChange}
                  className={inputCls} placeholder="House Air Waybill" />
              </FieldWithIcon>
            </div>
          </div>
        </div>

        {/* Section: Ghi chú */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <label className={labelCls}>
            <FiFileText className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
            Ghi chú
          </label>
          <textarea name="ghiChu" value={formData.ghiChu} onChange={handleChange} rows={3}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:border-[#14264b] focus:ring-2 focus:ring-[#14264b]/20 focus:outline-none transition-all placeholder:text-slate-400 bg-white resize-none"
            placeholder="Ghi chú thêm về đơn hàng..." />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading}
            className="flex items-center gap-2 bg-[#14264b] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-cyan-400 transition-colors cursor-pointer disabled:opacity-50 shadow-sm shadow-cyan-300/40">
            <FiSave className="h-4 w-4" />
            {loading ? 'Đang lưu...' : 'Cập nhật tracking'}
          </button>
          <button type="button" onClick={() => router.push('/admin/tracking')}
            className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors cursor-pointer">
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
