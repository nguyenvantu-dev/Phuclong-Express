/**
 * API Client
 *
 * Axios instance and API methods for communicating with the backend.
 * Provides typed methods for order operations.
 */

import axios, { AxiosInstance } from 'axios';
import {
  Order,
  QueryParams,
  PaginatedResponse,
  MassUpdateRequest,
  MassDeleteRequest,
  MassCompleteRequest,
} from '@/types/order';
import { OrderStatus } from '@/types/order-status';
import { getAccessToken, useAuthStore } from '@/hooks/use-auth';

/**
 * Create axios instance with base URL from environment
 *
 * The base URL is read from NEXT_PUBLIC_API_URL environment variable.
 * Defaults to localhost if not set.
 */
const createApiClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const client = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    // Timeout after 30 seconds
    timeout: 30000,
    paramsSerializer: (params) => {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, v));
        } else if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      return searchParams.toString();
    },
  });

  // Add JWT token to requests from localStorage
  client.interceptors.request.use(async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle 401 responses - redirect to login
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      // Debug log
      console.log('[API Error]', { status, message, error: error.message });

      // Check for any auth-related error and redirect to login
      if (
        status === 401 ||
        status === 403 ||
        message?.includes('unauthorized') ||
        message?.includes('invalid token') ||
        message?.includes('token') ||
        message?.includes('Unauthorized') ||
        message?.includes('Forbidden')
      ) {
        if (typeof window !== 'undefined') {
          console.log('[Auth] Redirecting to login due to auth error');
          // Clear auth store (zustand)
          useAuthStore.getState().logout();
          // Also clear localStorage keys
          localStorage.removeItem('auth-storage');
          // Redirect to login page with full URL
          const currentOrigin = window.location.origin;
          window.location.href = `${currentOrigin}/login`;
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
};

const apiClient = createApiClient();

/**
 * API Methods for Order operations
 *
 * These methods handle communication with the backend orders endpoint.
 */

/**
 * Get orders list with filters and pagination (POST method)
 *
 * @param params - Query parameters for filtering, sorting, and pagination
 * @returns Paginated list of orders
 */
export const getOrders = async (params: QueryParams): Promise<PaginatedResponse<Order>> => {
  const response = await apiClient.post<PaginatedResponse<Order>>('/orders/list', params);
  return response.data;
};

/**
 * Get orders for QLDatHang_LietKe (Order Management List)
 * Converted from: QLDatHang_LietKe.aspx.cs
 *
 * Response matches DonHangPhanTrang from C#:
 * - totalItem: total count
 * - danhSachDonHang: list of orders
 *
 * @param params - Query parameters matching QLDatHang filters
 * @returns QLDatHang response
 */
export interface QLDatHangResponse {
  totalItem: number;
  danhSachDonHang: Order[];
  page: number;
  limit: number;
}

export const getOrdersQLDatHang = async (params: QueryParams): Promise<QLDatHangResponse> => {
  const response = await apiClient.post<QLDatHangResponse>('/orders/qldathang-list', params);
  return response.data;
};

/**
 * Get a single order by ID
 *
 * @param id - Order ID
 * @param includeDeleted - Whether to include soft-deleted orders
 * @returns Order object
 */
export const getOrder = async (id: number, includeDeleted = false): Promise<Order> => {
  const response = await apiClient.get<Order>(`/orders/${id}`, {
    params: { includeDeleted },
  });
  return response.data;
};

/**
 * Create a new order
 *
 * @param order - Order data to create
 * @returns Created order object
 */
export const createOrder = async (order: Partial<Order>): Promise<Order> => {
  const response = await apiClient.post<Order>('/orders', order);
  return response.data;
};

/**
 * Create a quick order (DatHangM)
 *
 * @param order - Quick order data
 * @returns Success result
 */
export const createQuickOrder = async (order: {
  linkWeb: string;
  linkHinh?: string;
  color?: string;
  size?: string;
  soLuong: number;
  donGiaWeb?: number;
  loaiTien?: string;
  ghiChu?: string;
  tyGia?: number;
  saleOff?: number;
  quocGiaId?: number;
  nguoiTao?: string;
}): Promise<{ success: boolean; error?: string }> => {
  const response = await apiClient.post<{ success: boolean; error?: string }>('/orders/quick', order);
  return response.data;
};

/**
 * Create multiple quick orders at once
 *
 * @param orders - Array of quick order data
 * @returns Batch result
 */
export const createQuickOrders = async (orders: Array<{
  linkWeb: string;
  linkHinh?: string;
  color?: string;
  size?: string;
  soLuong: number;
  donGiaWeb?: number;
  loaiTien?: string;
  ghiChu?: string;
  tyGia?: number;
  saleOff?: number;
  quocGiaId?: number;
  nguoiTao?: string;
}>): Promise<{ success: number; failed: number; errors: string[] }> => {
  const response = await apiClient.post<{ success: number; failed: number; errors: string[] }>('/orders/quick/batch', { orders });
  return response.data;
};

/**
 * Calculate service fee for QLDatHang_Them
 */
export const calculateTienCong = async (params: {
  loaiTien: string;
  donGiaWeb: number;
  soLuong: number;
  saleOff: number;
  cong: number;
  tyGia: number;
  username: string;
}): Promise<{ tienCongVnd: number; giaSauOffUsd: number; tongTienUsd: number; tongTienVnd: number }> => {
  const response = await apiClient.post<{ tienCongVnd: number; giaSauOffUsd: number; tongTienUsd: number; tongTienVnd: number }>('/orders/quick/calculate', params);
  return response.data;
};

/**
 * Upload image for QLDatHang_Them
 */
export const uploadQuickOrderImage = async (file: File): Promise<{ linkHinh: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ linkHinh: string }>('/orders/quick/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Add order for QLDatHang_Them (uses SP_Them_DonHang_Simple_CoTamTinh)
 */
export const addQuickOrder = async (order: {
  linkWeb: string;
  linkHinh?: string;
  color?: string;
  size?: string;
  soLuong: number;
  donGiaWeb?: number;
  loaiTien?: string;
  ghiChu?: string;
  tyGia?: number;
  saleOff?: number;
  quocGiaId?: number;
  nguoiTao?: string;
  websiteName?: string;
  username?: string;
  shipUsa?: number;
  tax?: number;
  phuThu?: number;
  cong?: number;
}): Promise<{ success: boolean; error?: string }> => {
  const response = await apiClient.post<{ success: boolean; error?: string }>('/orders/quick/add', order);
  return response.data;
};

/**
 * Update an existing order
 *
 * @param id - Order ID to update
 * @param order - Partial order data to update
 * @returns Updated order object
 */
export const updateOrder = async (id: number, order: Partial<Order>): Promise<Order> => {
  const response = await apiClient.put<Order>(`/orders/${id}`, order);
  return response.data;
};

/**
 * Delete an order (soft delete)
 *
 * @param id - Order ID to delete
 */
export const deleteOrder = async (id: number): Promise<void> => {
  await apiClient.delete(`/orders/${id}`);
};

/**
 * Mass delete orders (soft delete)
 *
 * @param ids - Array of order IDs to delete
 * @param username - Username performing the delete
 * @param note - Note/reason for deletion
 * @returns Number of deleted orders
 */
export const massDelete = async (
  ids: number[],
  username?: string,
  note?: string,
): Promise<{ deleted: number }> => {
  const response = await apiClient.post<{ deleted: number }>('/orders/mass-delete', {
    ids,
    username,
    note,
  } as MassDeleteRequest);
  return response.data;
};

/**
 * Mass update orders
 *
 * @param items - Array of order updates (id + fields to update)
 * @param username - Username performing the action
 * @returns Number of updated orders
 */
export const massUpdate = async (
  items: { id: number; trangThaiOrder?: OrderStatus; adminNote?: string; orderNumber?: string; tyGia?: number; cong?: number; saleOff?: number; phuThu?: number; shipUsa?: number; tax?: number; totalCharged?: number; totalItem?: number; heThongTuTinhCong?: boolean }[],
  username?: string,
): Promise<{ updated: number }> => {
  const response = await apiClient.post<{ updated: number }>('/orders/mass-update', {
    items,
    username,
  } as MassUpdateRequest);
  return response.data;
};

/**
 * Mass complete orders using stored procedure (giống EditOrder logic)
 *
 * @param ids - Array of order IDs to complete
 * @param username - Username performing the action
 * @returns Number of completed orders
 */
export const massComplete = async (
  ids: number[],
  username?: string,
): Promise<{ completed: number }> => {
  const response = await apiClient.post<{ completed: number }>('/orders/mass-complete', {
    ids,
    username,
  } as MassCompleteRequest);
  return response.data;
};

/**
 * Mass received orders using stored procedure (giống EditOrder logic)
 * Converted from: EditOrder.cs - lbtMassReceived_Click + DBConnect.MassReceived
 * Checks kỳ đóng before executing, logs action to system
 *
 * @param ids - Array of order IDs to mark as received
 * @param username - Username performing the action
 * @returns Number of received orders
 */
export const massReceived = async (
  ids: number[],
  username?: string,
): Promise<{ received: number }> => {
  const response = await apiClient.post<{ received: number }>('/orders/mass-received', {
    ids,
    username,
  });
  return response.data;
};

/**
 * Mass shipped orders using stored procedure (giống EditOrder logic)
 * Converted from: EditOrder.cs - lbtMassShipped_Click + DBConnect.MassShipped
 * Calls: SP_CapNhat_MassShipped (@id), logs action to system
 *
 * @param ids - Array of order IDs to mark as shipped
 * @param username - Username performing the action
 * @returns Number of shipped orders
 */
export const massShipped = async (
  ids: number[],
  username?: string,
): Promise<{ shipped: number }> => {
  const response = await apiClient.post<{ shipped: number }>('/orders/mass-shipped', {
    ids,
    username,
  });
  return response.data;
};

/**
 * Restore a soft-deleted order
 *
 * @param id - Order ID to restore
 * @returns Restored order object
 */
export const restoreOrder = async (id: number): Promise<Order> => {
  const response = await apiClient.post<Order>(`/orders/${id}/restore`);
  return response.data;
};

/**
 * Get deleted orders
 *
 * @param params - Query parameters
 * @returns Paginated list of deleted orders
 */
export const getDeletedOrders = async (
  params: QueryParams,
): Promise<PaginatedResponse<Order>> => {
  const response = await apiClient.get<PaginatedResponse<Order>>('/orders/deleted', { params });
  return response.data;
};

/**
 * Get order details (products in order)
 *
 * @param id - Order ID
 * @param includeDeleted - Include deleted orders
 * @returns Order details
 */
export const getOrderDetails = async (
  id: number,
  includeDeleted = false,
): Promise<Order> => {
  const response = await apiClient.get<Order>(`/orders/${id}/details`, {
    params: { includeDeleted },
  });
  return response.data;
};

/**
 * Update order note (add additional note) - batch version
 *
 * @param ids - Order IDs array
 * @param note - Additional note
 * @returns Updated order (first one)
 */
export const updateOrderNoteBatch = async (
  ids: number[],
  note: string,
): Promise<Order> => {
  const response = await apiClient.put<Order>(`/orders/note/batch`, {
    ids,
    boSungGhiChu: note,
  });
  return response.data;
};

/**
 * Update order note (add additional note) - single version
 *
 * @param id - Order ID
 * @param note - Additional note
 * @returns Updated order
 */
export const updateOrderNote = async (
  id: number,
  note: string,
): Promise<Order> => {
  const response = await apiClient.put<Order>(`/orders/${id}/note`, {
    boSungGhiChu: note,
  });
  return response.data;
};

/**
 * Update order return date to Vietnam
 *
 * @param id - Order ID
 * @param data - Return date update data
 * @returns Updated order
 */
export const updateOrderReturnDate = async (
  id: number,
  data: {
    ngayVeVn: string;
    boSungGhiChu?: string;
    chuyenVeCompleted?: boolean;
    username?: string;
  },
): Promise<Order> => {
  const response = await apiClient.put<Order>(`/orders/${id}/return-date`, data);
  return response.data;
};

/**
 * Import orders from Excel file
 *
 * @param file - Excel file
 * @param importDto - Import options
 * @returns Import result
 */
export const importOrders = async (
  file: File,
  importDto: { sheetName?: string; mode?: string },
): Promise<{ imported: number; errors?: string[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  if (importDto.sheetName) formData.append('sheetName', importDto.sheetName);
  if (importDto.mode) formData.append('mode', importDto.mode);

  const response = await apiClient.post<{ imported: number; errors?: string[] }>(
    '/orders/import',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );
  return response.data;
};

/**
 * API Methods for Debt Reports
 *
 * These methods handle communication with the backend debt-reports endpoint.
 * Matches: BaoCao_ChiTietCongNo.aspx page logic
 */

/**
 * Query parameters for debt reports
 */
export interface DebtReportQueryParams {
  username?: string;
  fromKyId?: number;
  toKyId?: number;
  page?: number;
  limit?: number;
}

/**
 * Debt report summary
 */
export interface DebtReportSummary {
  dauKy: number;
  tongPhatSinh: number;
  tongThanhToan: number;
  cuoiKy: number;
}

/**
 * Debt report data row
 */
export interface DebtReportItem {
  CongNo_ID: number;
  NoiDung: string;
  NgayGhiNo: string;
  DR: number;
  CR: number;
  LuyKe: number;
  GhiChu: string;
}

/**
 * Period (Ky) item
 */
export interface PeriodItem {
  KyID: number;
  TenKy: string;
  NgayBatDau: string;
  NgayKetThuc: string;
  DaDong: boolean;
}

/**
 * Get debt reports with filters and pagination
 * Matches: LoadBaoCaoChiTietCongNo() in C#
 */
export const getDebtReports = async (
  params: DebtReportQueryParams,
): Promise<{
  data: DebtReportItem[];
  total: number;
  page: number;
  limit: number;
  summary: DebtReportSummary;
}> => {
  const response = await apiClient.get('/debt-reports', { params });
  return response.data;
};

/**
 * Get periods (Ky) for dropdown
 * Matches: LoadDanhSachKy() in C#
 */
export const getPeriods = async (includeClosed?: boolean): Promise<PeriodItem[]> => {
  const response = await apiClient.get('/debt-reports/periods', {
    params: { includeClosed },
  });
  return response.data;
};

/**
 * Get users for dropdown
 * Matches: LoadDataUser() in C#
 */
export const getDebtReportUsers = async (): Promise<{ Id: string; UserName: string }[]> => {
  const response = await apiClient.get('/debt-reports/users');
  return response.data;
};

/**
 * Update debt record
 * Matches: gvCongNo_RowUpdating() in C#
 */
export const updateDebtRecord = async (
  id: number,
  updateData: { noiDung?: string; dr?: number; cr?: number; ghiChu?: string },
): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.put(`/debt-reports/${id}`, updateData);
  return response.data;
};

/**
 * Export debt report to Excel/CSV
 * Matches: btExportToExcelAllWithFilter_Click() in C#
 */
/**
 * Customer Debt Report (BaoCao_CongNoKhachHang)
 * Data: UserName, TienNo, TienHangChuaGiao, PhanTram
 */
export interface CustomerDebtReportItem {
  UserName: string;
  TienNo: number;
  TienHangChuaGiao: number;
  PhanTram: number;
}

export const getCustomerDebtReport = async (): Promise<CustomerDebtReportItem[]> => {
  const response = await apiClient.get('/debt-reports/customer');
  // Handle both array and object response
  const data = response.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === 'object' && Array.isArray((data as any).data)) {
    return (data as any).data;
  }
  // Handle single object response - wrap in array
  if (data && typeof data === 'object' && (data as any).UserName) {
    return [data as CustomerDebtReportItem];
  }
  return [];
};

export const exportCustomerDebtReport = async (): Promise<{ csv: string; filename: string }> => {
  const response = await apiClient.post('/debt-reports/customer/export');
  return response.data;
};

export const exportDebtReport = async (
  username: string,
  fromKyId: number,
  toKyId: number,
): Promise<{ csv: string; filename: string }> => {
  const response = await apiClient.post('/debt-reports/export', {
    username,
    fromKyId,
    toKyId,
  });
  return response.data;
};

// ========== Debt Report by Lot (BaoCao_CongNoKhachHangTheoLo) ==========

export interface LotDebtItem {
  UserName: string;
  NgayLoHang: string;
  TenLoHang: string;
  LoaiTien: string;
  TyGia: number;
  TienLoHangA: number;
  TienPhiHaiQuanB: number;
  TongTienLoHangAB: number;
  DaThu: number;
  ConLai: number;
}

export const getDebtReportByLot = async (
  fromDate?: string,
  toDate?: string,
): Promise<LotDebtItem[]> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const response = await apiClient.get(`/debt-reports/by-lot?${params}`);
  return response.data;
};

export const exportDebtReportByLot = async (
  fromDate?: string,
  toDate?: string,
): Promise<{ csv: string; filename: string }> => {
  const response = await apiClient.post('/debt-reports/by-lot/export', {
    fromDate,
    toDate,
  });
  return response.data;
};

// ========== Debt Report by Shipment Lot (BaoCao_CongNoTheoDotHang) ==========

export interface ShipmentLotDebtItem {
  UserName: string;
  HoTen: string;
  TenDotHang: string;
  NgayVeVN: string;
  TienHang: number;
  TienShip: number;
  TongTien: number;
  PhoneNumber: string;
  DiaChi: string;
}

export const getDebtReportByShipmentLot = async (
  fromDate?: string,
  toDate?: string,
): Promise<ShipmentLotDebtItem[]> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const response = await apiClient.get(`/debt-reports/by-shipment-lot?${params}`);
  return response.data;
};

export const exportDebtReportByShipmentLot = async (
  fromDate?: string,
  toDate?: string,
): Promise<{ csv: string; filename: string }> => {
  const response = await apiClient.post('/debt-reports/by-shipment-lot/export', {
    fromDate,
    toDate,
  });
  return response.data;
};

// ========== Debt Reconciliation (BaoCao_DoiChieuCongNo) ==========

export interface DebtReconciliationItem {
  ordernumber: string;
  UserName: string;
  ngaymuahang: string;
  SoLinkA: number;
  SotienA: number;
  SoLinkB: number;
  SotienB: number;
  tracking_number: string;
  SotienAVND: number;
  SotienBVND: number;
  KiemTraVND: number;
}

export const getDebtReconciliation = async (
  fromDate?: string,
  toDate?: string,
  username?: string,
  orderNumber?: string,
): Promise<DebtReconciliationItem[]> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (username) params.append('username', username);
  if (orderNumber) params.append('orderNumber', orderNumber);
  const response = await apiClient.get(`/debt-reports/reconciliation?${params}`);
  return response.data;
};

export const moveToReceived = async (
  ordernumber: string,
): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.post('/debt-reports/reconciliation/move-to-received', {
    ordernumber,
  });
  return response.data;
};

export const updateOrderTotalVND = async (
  ordernumber: string,
  trackingNumber: string,
  tongTienOrderVND: number,
): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.put('/debt-reports/reconciliation/update-total-vnd', {
    ordernumber,
    trackingNumber,
    tongTienOrderVND,
  });
  return response.data;
};

export const exportDebtReconciliation = async (
  fromDate?: string,
  toDate?: string,
  username?: string,
  orderNumber?: string,
): Promise<{ csv: string; filename: string }> => {
  const response = await apiClient.post('/debt-reports/reconciliation/export', {
    fromDate,
    toDate,
    username,
    orderNumber,
  });
  return response.data;
};

// ========== BaoCao_TongDoanhThu ==========

export interface TotalRevenueItem {
  dauKy: number;
  phanNo: number;
  phanCo: number;
  chenhLech: number;
  canDoi: number;
}

export const getTotalRevenue = async (
  fromDate?: string,
  toDate?: string,
): Promise<TotalRevenueItem> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const response = await apiClient.get(`/debt-reports/total-revenue?${params}`);
  return response.data;
};

// ========== BaoCao_TongCongNoTheoUser ==========

export interface DebtByUserItem {
  UserName: string;
  DauKy: number;
  PhanThu: number;
  PhanChi: number;
  CuoiKy: number;
}

export const getDebtByUser = async (
  fromDate?: string,
  toDate?: string,
  username?: string,
): Promise<DebtByUserItem[]> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  if (username) params.append('username', username);
  const response = await apiClient.get(`/debt-reports/debt-by-user?${params}`);
  return response.data;
};

export const exportDebtByUser = async (
  fromDate?: string,
  toDate?: string,
  username?: string,
): Promise<{ csv: string; filename: string }> => {
  const response = await apiClient.post('/debt-reports/debt-by-user/export', {
    fromDate,
    toDate,
    username,
  });
  return response.data;
};

// ========== BaoCao_PhanTichLaiLoTheoLoHang ==========

export interface ProfitLossByLotItem {
  NgayLoHang: string;
  TenLoHang: string;
  TienLoHangA: number;
  TienPhiHaiQuanB: number;
  TongTienLoHangAB: number;
  TienChiPhiLoHangC: number;
  LaiLoD: number;
}

export const getProfitLossByLot = async (
  fromDate?: string,
  toDate?: string,
): Promise<ProfitLossByLotItem[]> => {
  const params = new URLSearchParams();
  if (fromDate) params.append('fromDate', fromDate);
  if (toDate) params.append('toDate', toDate);
  const response = await apiClient.get(`/debt-reports/profit-loss-by-lot?${params}`);
  return response.data;
};

export const exportProfitLossByLot = async (
  fromDate?: string,
  toDate?: string,
): Promise<{ csv: string; filename: string }> => {
  const response = await apiClient.post('/debt-reports/profit-loss-by-lot/export', {
    fromDate,
    toDate,
  });
  return response.data;
};

// ========== BaoCao_InPhieuShipTheoDotHang ==========

export interface ShippingSlipCustomerInfo {
  HoTen: string;
  PhoneNumber: string;
  DiaChiNhanHang: string;
  NgayVeVN: string;
  TongTien: number;
  TienShipVeVN: number;
  TienShipTrongNuoc: number;
  TienHang: number;
  TienDatCoc: number;
  TienPhaiThanhToan: number;
}

export interface ShippingSlipOrderItem {
  ID: number;
  MaSoHang: string;
  linkhinh: string;
  corlor: string;
  size: string;
  soluong: number;
  dongiaweb: number;
  tongtienVND: number;
}

export interface ShippingSlipData {
  customerInfo: ShippingSlipCustomerInfo;
  orderItems: ShippingSlipOrderItem[];
}

export const getShippingSlip = async (
  orderId: string,
  userName: string,
): Promise<ShippingSlipData> => {
  const params = new URLSearchParams();
  params.append('orderId', orderId);
  params.append('user', userName);
  const response = await apiClient.get(`/debt-reports/shipping-slip?${params}`);
  return response.data;
};

// ========== Debt Management (ManageCongNo) ==========

export interface DebtManagementQuery {
  username?: string;
  status?: number;
  loaiPhatSinh?: string;
  bankAccount?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface DebtManagementItem {
  CongNo_ID: number;
  UserName: string;
  NoiDung: string;
  NgayGhiNo: string;
  DR: number;
  CR: number;
  GhiChu: string;
  Status: boolean;
  NguoiTao: string;
  LoHangID?: number;
  TenLoHang?: string;
}

export interface DebtManagementResponse {
  data: DebtManagementItem[];
  total: number;
  page: number;
  limit: number;
}

export const getDebtManagementList = async (
  params: DebtManagementQuery,
): Promise<DebtManagementResponse> => {
  const response = await apiClient.get('/debt-reports/management/list', { params });
  return response.data;
};

export interface CreateDebtParams {
  username: string;
  noiDung: string;
  ngay: string;
  dr?: number;
  cr?: number;
  ghiChu?: string;
  loHangId?: number;
  loaiPhatSinh?: number;
}

export const createDebt = async (data: CreateDebtParams): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.post('/debt-reports/management', data);
  return response.data;
};

export interface UpdateDebtParams {
  username?: string;
  noiDung?: string;
  dr?: number;
  cr?: number;
  ghiChu?: string;
  status?: number;
  loHangId?: number;
}

export const updateDebt = async (
  id: number,
  data: UpdateDebtParams,
): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.put(`/debt-reports/management/${id}`, data);
  return response.data;
};

export const deleteDebt = async (id: number): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.delete(`/debt-reports/management/${id}`);
  return response.data;
};

export const approveDebt = async (id: number): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.post(`/debt-reports/management/${id}/approve`);
  return response.data;
};

export interface BankAccount {
  ID: number;
  TenNganHang: string;
  SoTaiKhoan: string;
  ChuTaiKhoan: string;
}

export const getBankAccounts = async (): Promise<BankAccount[]> => {
  const response = await apiClient.get('/debt-reports/management/bank-accounts');
  return response.data;
};

export interface BatchItem {
  LoHang_ID: number;
  TenLoHang: string;
  NgayLoHang: string;
}

export const getBatchesByUsername = async (username: string): Promise<BatchItem[]> => {
  const response = await apiClient.get('/debt-reports/management/batches', { params: { username } });
  return response.data;
};

// ========== Shippers ==========

export interface Shipper {
  ID: number;
  ShipperName: string;
  ShipperPhone: string;
  ShipperAddress: string;
}

export const getShippers = async (): Promise<Shipper[]> => {
  const response = await apiClient.get('/shippers');
  return response.data;
};

export const getShipper = async (id: number): Promise<Shipper> => {
  const response = await apiClient.get(`/shippers/${id}`);
  return response.data;
};

export interface CreateShipperParams {
  shipperName: string;
  shipperPhone: string;
  shipperAddress?: string;
}

export const createShipper = async (
  data: CreateShipperParams,
): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.post('/shippers', data);
  return response.data;
};

export interface UpdateShipperParams {
  shipperName?: string;
  shipperPhone?: string;
  shipperAddress?: string;
}

export const updateShipper = async (
  id: number,
  data: UpdateShipperParams,
): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.put(`/shippers/${id}`, data);
  return response.data;
};

export const deleteShipper = async (id: number): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.delete(`/shippers/${id}`);
  return response.data;
};

// ========== Q&A ==========

export interface QnaQuery {
  username?: string;
  daTraLoi?: number;
  page?: number;
  limit?: number;
}

export interface QnaItem {
  ID: number;
  UserName: string;
  CauHoi: string;
  TraLoi: string;
  NgayHoi: string;
  NgayTraLoi?: string;
  DaTraLoi: boolean;
}

export interface QnaResponse {
  data: QnaItem[];
  total: number;
  page: number;
  limit: number;
}

export const getQnaList = async (params: QnaQuery): Promise<QnaResponse> => {
  const response = await apiClient.get('/qna', { params });
  return response.data;
};

export const answerQna = async (
  id: number,
  traLoi: string,
): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.put(`/qna/${id}/answer`, { traLoi });
  return response.data;
};

export const deleteQna = async (id: number): Promise<{ success: boolean; message?: string }> => {
  const response = await apiClient.delete(`/qna/${id}`);
  return response.data;
};

/**
 * Get list of usernames for can hang dropdown
 */
export const getUsernames = async (): Promise<{ username: string }[]> => {
  const response = await apiClient.get<{ username: string }[]>('/orders/usernames');
  return response.data;
};

/**
 * Get exchange rates
 */
export const getExchangeRates = async () => {
  const response = await apiClient.get<{ data: { name: string; rate: number }[] }>('/exchange-rates');
  return response.data.data;
};

/**
 * Get countries (alias for getQuocGia)
 */
export const getCountries = async () => {
  const response = await apiClient.get<{ QuocGiaID: number; TenQuocGia: string; PhiShipVeVN?: number }[]>('/orders/countries');
  return response.data;
};

/**
 * Get list of batches (DotHang) for can hang dropdown
 */
export const getBatches = async (): Promise<{ tenDotHang: string }[]> => {
  const response = await apiClient.get<{ tenDotHang: string }[]>('/orders/batches');
  return response.data;
};

/**
 * Get product types (LoaiHang) for can hang dropdown
 */
export const getProductTypes = async (): Promise<{ LoaiHangID: number; TenLoaiHang: string }[]> => {
  const response = await apiClient.get<{ data: { LoaiHangID: number; TenLoaiHang: string }[]}>('/orders/product-types');
  return response.data.data;
};

/**
 * Get order status counts for can hang page
 */
export const getStatusCounts = async (): Promise<Record<string, number>> => {
  const response = await apiClient.get<Record<string, number>>('/orders/status-counts');
  return response.data;
};

/**
 * Get list of countries (QuocGia) for dropdown
 */
export const getQuocGia = async () => {
  const response = await apiClient.get<{ QuocGiaID: number; TenQuocGia: string; PhiShipVeVN?: number }[]>('/orders/countries');
  return response.data;
};

/**
 * Calculate shipping fee
 */
export const calculateShipping = async (params: {
  weight: number;
  loaiHangId: number;
  loaiTien: string;
  username: string;
}): Promise<{ shippingFee: number }> => {
  const response = await apiClient.post<{ shippingFee: number }>('/orders/calculate-shipping', params);
  return response.data;
};

/**
 * Calculate service fee (GiaTienCong) for EditOrderDetail
 */
export const calculateServiceFee = async (params: {
  loaiTien?: string;
  donGiaWeb?: number;
  loaitien?: string;
  dongiaweb?: number;
  username: string;
}): Promise<{ tienCong1Mon: number; tinhTheoPhanTram: boolean }> => {
  // Support both camelCase and snake_case
  const payload = {
    loaiTien: params.loaiTien || params.loaitien || 'USD',
    donGiaWeb: params.donGiaWeb || params.dongiaweb || 0,
    username: params.username,
  };
  const response = await apiClient.post<{ tienCong1Mon: number; tinhTheoPhanTram: boolean }>(
    '/orders/calculate-fee',
    payload
  );
  return response.data;
};

/**
 * Update order detail (full edit flow from EditOrderDetail.aspx)
 * Includes: permission check, update, logging, ngayVeVN update
 */
export const updateOrderDetail = async (
  id: number,
  data: {
    username: string;
    linkweb?: string;
    linkhinh?: string;
    corlor?: string;
    size?: string;
    soluong: number;
    dongiaweb: number;
    saleoff: number;
    phuthu: number;
    shipUSA: number;
    tax: number;
    cong: number;
    loaitien: string;
    ghichu?: string;
    tygia: number;
    giasauoffUSD: number;
    giasauoffVND: number;
    tiencongUSD: number;
    tiencongVND: number;
    tongtienUSD: number;
    tongtienVND: number;
    ordernumber?: string;
    trangthaiOrder?: string;
    ngaymuahang?: string;
    ngayveVN?: string;
    adminNote?: string;
    LoaiHangID?: number;
    QuocGiaID?: number;
    usernamesave?: string;
    nguoiTao: string;
  }
): Promise<{ success: boolean; error?: string }> => {
  const response = await apiClient.put<{ success: boolean; error?: string }>(
    `/orders/${id}/detail`,
    data
  );
  return response.data;
};

/**
 * Upload image for EditOrderDetail (resize to 640x480)
 */
export const uploadOrderImage = async (orderId: number, file: File): Promise<{ linkHinh: string; linkhinh?: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<{ linkHinh: string }>(
    `/orders/${orderId}/upload-image`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return response.data;
};

/**
 * Get exchange rates for EditOrderDetail
 */
export const getExchangeRatesForEdit = async () => {
  const response = await apiClient.get<any>(
    '/orders/exchange-rates'
  );
  // Handle both wrapped and unwrapped response
  return response.data?.data || response.data;
};

/**
 * Get product types for EditOrderDetail
 */
export const getProductTypesForEdit = async (): Promise<{ LoaiHangID: number; TenLoaiHang: string }[]> => {
  const response = await apiClient.get<{ LoaiHangID: number; TenLoaiHang: string }[]>(
    '/orders/product-types-detail'
  );
  return response.data;
};

// ========== Authentication ==========

export interface LoginParams {
  username: string;
  password: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email?: string;
  hoTen?: string;
  roles: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
  hoTen?: string;
  diaChi?: string;
  tinhThanh?: string;
  soTaiKhoan?: string;
  hinhThucNhanHang?: string;
  khachBuon?: boolean;
  linkTaiKhoanMang?: string;
  vungMien?: string;
}

/**
 * Login user
 * POST /auth/login
 */
export const login = async (params: LoginParams): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', params);
  return response.data;
};

/**
 * Register new user
 * POST /auth/register
 */
export const register = async (
  params: RegisterParams,
): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', params);
  return response.data;
};

/**
 * Refresh access token
 * POST /auth/refresh
 */
export const refreshToken = async (
  refreshToken: string,
): Promise<{ accessToken: string }> => {
  const response = await apiClient.post<{ accessToken: string }>('/auth/refresh', {
    refreshToken,
  });
  return response.data;
};

/**
 * Get current user profile
 * GET /auth/profile
 */
export const getProfile = async (): Promise<AuthUser> => {
  const response = await apiClient.get<AuthUser>('/auth/profile');
  return response.data;
};

/**
 * Get all roles
 * GET /auth/roles
 */
export const getRoles = async (): Promise<{ Id: number; Name: string }[]> => {
  const response = await apiClient.get<{ Id: number; Name: string }[]>('/auth/roles');
  return response.data;
};

// ========== Tracking ==========

export interface TrackingSearchResult {
  found: boolean;
  message?: string;
  history?: { ngay: string; tinhTrang: string; moTa: string; ghiChu: string }[];
}

/**
 * Search tracking by code (public endpoint)
 * GET /tracking/search/:code
 */
export const searchTracking = async (code: string): Promise<TrackingSearchResult> => {
  const response = await apiClient.get<TrackingSearchResult>(`/tracking/search/${code}`);
  return response.data;
};

export default apiClient;
