import { DataTypes, Model } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

/**
 * Order Status Enum
 */
export enum OrderStatus {
  RECEIVED = 'Received',
  ORDERED = 'Ordered',
  SHIPPED = 'Shipped',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

/**
 * Order Model (Sequelize)
 */
export class Order extends Model {
  ID: number;
  orderNumber: string;
  username: string;
  usernameSave: string;
  linkWeb: string;
  linkHinh: string;
  corlor: string;
  size: string;
  soluong: number;
  donGiaWeb: number;
  saleOff: number;
  phuThu: number;
  shipUsa: number;
  tax: number;
  cong: number;
  loaiTien: string;
  ghiChu: string;
  tyGia: number;
  giaSauOffUsd: number;
  giaSauOffVnd: number;
  tienCongUsd: number;
  tienCongVnd: number;
  tongTienUsd: number;
  tongTienVnd: number;
  trangThaiOrder: string;
  adminNote: string;
  ngayVeVn: Date;
  ngaySaveLink: Date;
  ngayMuaHang: Date;
  namTaiChinh: number;
  websiteName: string;
  tenDotHang: string;
  yeuCauGuiHang: number;
  daQuaHanMuc: boolean;
  laKhachVip: boolean;
  ngayYeuCauGuiHang: Date;
  yeuCauGuiGhiChu: string;
  guiHangSoKg: number;
  guiHangTien: number;
  loaiHangId: number;
  tenLoaiHang: string;
  canHangSoKg: number;
  canHangTienShipVeVn: number;
  canHangTienShipTrongNuoc: number;
  hangKhoan: boolean;
  maSoHang: string;
  quocGiaId: number;
  tenQuocGia: string;
  linkTaiKhoanMang: string;
  vungMien: string;
  nguoiTao: string;
  DaXoa: boolean;
}

export const OrderModel = (sequelize: Sequelize) => {
  Order.init(
    {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      orderNumber: {
        type: DataTypes.STRING(50),
        field: 'ordernumber',
      },
      username: {
        type: DataTypes.STRING(100),
      },
      usernameSave: {
        type: DataTypes.STRING(100),
        field: 'usernamesave',
      },
      linkWeb: {
        type: DataTypes.TEXT,
        field: 'linkweb',
      },
      linkHinh: {
        type: DataTypes.TEXT,
        field: 'linkhinh',
      },
      corlor: {
        type: DataTypes.STRING(100),
      },
      size: {
        type: DataTypes.STRING(50),
      },
      soluong: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      donGiaWeb: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'dongiaweb',
        defaultValue: 0,
      },
      saleOff: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'saleoff',
      },
      phuThu: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'phuthu',
      },
      shipUsa: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'shipUSA',
      },
      tax: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0,
      },
      cong: {
        type: DataTypes.DECIMAL(15, 2),
      },
      loaiTien: {
        type: DataTypes.STRING(10),
        field: 'loaitien',
        defaultValue: 'USD',
      },
      ghiChu: {
        type: DataTypes.TEXT,
        field: 'ghichu',
      },
      tyGia: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'tygia',
      },
      giaSauOffUsd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'giasauoffUSD',
      },
      giaSauOffVnd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'giasauoffVND',
      },
      tienCongUsd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'tiencongUSD',
      },
      tienCongVnd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'tiencongVND',
      },
      tongTienUsd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'tongtienUSD',
      },
      tongTienVnd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'tongtienVND',
      },
      trangThaiOrder: {
        type: DataTypes.STRING(50),
        field: 'trangthaiOrder',
        defaultValue: OrderStatus.RECEIVED,
      },
      adminNote: {
        type: DataTypes.TEXT,
        field: 'AdminNote',
      },
      ngayVeVn: {
        type: DataTypes.DATE,
        field: 'ngayveVN',
      },
      ngaySaveLink: {
        type: DataTypes.DATE,
        field: 'ngaysaveLink',
      },
      ngayMuaHang: {
        type: DataTypes.DATE,
        field: 'ngaymuahang',
      },
      namTaiChinh: {
        type: DataTypes.INTEGER,
        field: 'nam_taichinh',
      },
      websiteName: {
        type: DataTypes.STRING(255),
        field: 'WebsiteName',
      },
      tenDotHang: {
        type: DataTypes.STRING(255),
        field: 'TenDotHang',
      },
      yeuCauGuiHang: {
        type: DataTypes.INTEGER,
        field: 'YeuCauGuiHang',
        defaultValue: 0,
      },
      daQuaHanMuc: {
        type: DataTypes.BOOLEAN,
        field: 'DaQuaHanMuc',
        defaultValue: false,
      },
      laKhachVip: {
        type: DataTypes.BOOLEAN,
        field: 'LaKhachVip',
        defaultValue: false,
      },
      ngayYeuCauGuiHang: {
        type: DataTypes.DATE,
        field: 'NgayYeuCauGuiHang',
      },
      yeuCauGuiGhiChu: {
        type: DataTypes.TEXT,
        field: 'YeuCauGui_GhiChu',
      },
      guiHangSoKg: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'GuiHang_SoKg',
      },
      guiHangTien: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'GuiHang_Tien',
      },
      loaiHangId: {
        type: DataTypes.INTEGER,
        field: 'LoaiHangID',
      },
      tenLoaiHang: {
        type: DataTypes.STRING(255),
        field: 'TenLoaiHang',
      },
      canHangSoKg: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'CanHang_SoKg',
      },
      canHangTienShipVeVn: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'CanHang_TienShipVeVN',
      },
      canHangTienShipTrongNuoc: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'CanHang_TienShipTrongNuoc',
      },
      hangKhoan: {
        type: DataTypes.BOOLEAN,
        field: 'HangKhoan',
        defaultValue: false,
      },
      maSoHang: {
        type: DataTypes.STRING(100),
        field: 'MaSoHang',
      },
      quocGiaId: {
        type: DataTypes.INTEGER,
        field: 'QuocGiaID',
      },
      tenQuocGia: {
        type: DataTypes.STRING(100),
        field: 'TenQuocGia',
      },
      linkTaiKhoanMang: {
        type: DataTypes.TEXT,
        field: 'LinkTaiKhoanMang',
      },
      vungMien: {
        type: DataTypes.STRING(100),
        field: 'VungMien',
      },
      nguoiTao: {
        type: DataTypes.STRING(100),
        field: 'nguoiTao',
      },
      DaXoa: {
        type: DataTypes.BOOLEAN,
        field: 'DaXoa',
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'DonHang',
      timestamps: false,
    },
  );

  return Order;
};
