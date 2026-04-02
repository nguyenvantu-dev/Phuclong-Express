/**
 * Order Types
 *
 * TypeScript types matching the backend Order entity.
 * These types are used throughout the frontend for order-related functionality.
 */

import { OrderStatus } from './order-status';

/**
 * Order entity interface
 *
 * Represents an order in the Phuc Long Express system.
 * Maps to the backend Order entity.
 */
export interface Order {
  id: number;
  orderNumber: string;
  username: string;
  usernameSave: string | null;
  linkWeb: string | null;
  linkHinh: string | null;
  color: string | null;
  size: string | null;
  soLuong: number;
  donGiaWeb: number;
  saleOff: number | null;
  phuThu: number | null;
  shipUsa: number | null;
  tax: number;
  cong: number | null;
  loaiTien: string;
  ghiChu: string | null;
  tyGia: number | null;
  giaSauOffUsd: number | null;
  giaSauOffVnd: number | null;
  tienCongUsd: number | null;
  tienCongVnd: number | null;
  tongTienUsd: number | null;
  tongTienVnd: number | null;
  trangThaiOrder: OrderStatus;
  adminNote: string | null;
  ngayVeVn: Date | null;
  ngaySaveLink: Date;
  ngayMuaHang: Date | null;
  namTaiChinh: number | null;
  websiteName: string | null;
  tenDotHang: string | null;
  yeuCauGuiHang: number;
  daQuaHanMuc: boolean;
  laKhachVip: boolean;
  ngayYeuCauGuiHang: Date | null;
  yeuCauGuiGhiChu: string | null;
  guiHangSoKg: number | null;
  guiHangTien: number | null;
  loaiHangId: number | null;
  tenLoaiHang: string | null;
  canHangSoKg: number | null;
  canHangTienShipVeVn: number | null;
  canHangTienShipTrongNuoc: number | null;
  hangKhoan: boolean;
  maSoHang: string | null;
  quocGiaId: number | null;
  tenQuocGia: string | null;
  linkTaiKhoanMang: string | null;
  vungMien: string | null;
  nguoiTao: string | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Query parameters for fetching orders
 *
 * Used for filtering, pagination, and sorting orders.
 */
export interface QueryParams {
  website?: string;
  username?: string;
  status?: OrderStatus;
  statuses?: string[];
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  quocGiaId?: number;
  ids?: string;
}

/**
 * Paginated response structure
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Mass update item
 *
 * Represents a single order update for mass operations.
 */
export interface MassUpdateItem {
  id: number;
  trangThaiOrder?: OrderStatus;
  adminNote?: string;
  // QLDatHang_MassUpdate fields
  orderNumber?: string;
  tyGia?: number;
  cong?: number;
  saleOff?: number;
  phuThu?: number;
  shipUsa?: number;
  tax?: number;
  totalCharged?: number;
  totalItem?: number;
  heThongTuTinhCong?: boolean;
}

/**
 * Mass update request
 */
export interface MassUpdateRequest {
  items: MassUpdateItem[];
  username?: string;
}

/**
 * Mass delete request
 */
export interface MassDeleteRequest {
  ids: number[];
  username?: string;
  note?: string;
}

/**
 * Order summary for footer calculations
 */
export interface OrderSummary {
  totalItems: number;
  totalPriceUsd: number;
  totalPriceVnd: number;
}

/**
 * Mass complete request (dùng stored procedure giống EditOrder)
 */
export interface MassCompleteRequest {
  ids: number[];
  username?: string;
}
