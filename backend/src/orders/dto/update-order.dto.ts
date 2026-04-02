import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  Min,
} from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

/**
 * Update Order DTO
 *
 * Data Transfer Object for updating an existing order.
 * All fields are optional as this is a partial update.
 */
export class UpdateOrderDto {
  @IsString()
  @IsOptional()
  orderNumber?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  usernameSave?: string;

  @IsString()
  @IsOptional()
  linkWeb?: string;

  @IsString()
  @IsOptional()
  linkHinh?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  soLuong?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  donGiaWeb?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  saleOff?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  phuThu?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  shipUsa?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tax?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cong?: number;

  @IsString()
  @IsOptional()
  loaiTien?: string;

  @IsString()
  @IsOptional()
  ghiChu?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tyGia?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  giaSauOffUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  giaSauOffVnd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tienCongUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tienCongVnd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tongTienUsd?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  tongTienVnd?: number;

  @IsEnum(OrderStatus)
  @IsOptional()
  trangThaiOrder?: OrderStatus;

  @IsString()
  @IsOptional()
  adminNote?: string;

  @IsDateString()
  @IsOptional()
  ngayVeVn?: string;

  @IsDateString()
  @IsOptional()
  ngaySaveLink?: string;

  @IsDateString()
  @IsOptional()
  ngayMuaHang?: string;

  @IsNumber()
  @IsOptional()
  namTaiChinh?: number;

  @IsString()
  @IsOptional()
  websiteName?: string;

  @IsString()
  @IsOptional()
  tenDotHang?: string;

  @IsNumber()
  @IsOptional()
  yeuCauGuiHang?: number;

  @IsBoolean()
  @IsOptional()
  daQuaHanMuc?: boolean;

  @IsBoolean()
  @IsOptional()
  laKhachVip?: boolean;

  @IsDateString()
  @IsOptional()
  ngayYeuCauGuiHang?: string;

  @IsString()
  @IsOptional()
  yeuCauGuiGhiChu?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  guiHangSoKg?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  guiHangTien?: number;

  @IsNumber()
  @IsOptional()
  loaiHangId?: number;

  @IsString()
  @IsOptional()
  tenLoaiHang?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  canHangSoKg?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  canHangTienShipVeVn?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  canHangTienShipTrongNuoc?: number;

  @IsBoolean()
  @IsOptional()
  hangKhoan?: boolean;

  @IsString()
  @IsOptional()
  maSoHang?: string;

  @IsNumber()
  @IsOptional()
  quocGiaId?: number;

  @IsString()
  @IsOptional()
  tenQuocGia?: string;

  @IsString()
  @IsOptional()
  linkTaiKhoanMang?: string;

  @IsString()
  @IsOptional()
  vungMien?: string;

  @IsString()
  @IsOptional()
  nguoiTao?: string;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;
}
