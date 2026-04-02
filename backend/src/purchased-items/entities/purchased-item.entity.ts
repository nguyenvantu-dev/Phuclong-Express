import { DataTypes, Model, Sequelize } from 'sequelize';

/**
 * Purchased Item Entity (HangKhoan)
 *
 * Represents orders marked as "purchased" (HangKhoan).
 * This is actually the same as DonHang but with hangKhoan flag.
 * Fields match DonHang entity.
 */
export class PurchasedItem extends Model {
  id!: number;
  orderNumber!: string;
  websiteName!: string;
  username!: string;
  ngaySaveLink!: Date;
  loaiTien!: string;
  tenQuocGia!: string;
  linkWeb!: string;
  linkHinh!: string;
  color!: string;
  size!: string;
  soLuong!: number;
  donGiaWeb!: number;
  cong!: number;
  saleOff!: number;
  phuThu!: number;
  shipUsa!: number;
  tax!: number;
  tienCongVnd!: number;
  tongTienVnd!: number;
  vungMien!: string;
  ghiChu!: string;
  usernameSave!: string;
  trangThaiOrder!: number;
  hangKhoan!: boolean;
  daXoa!: boolean;
}

export function PurchasedItemModel(sequelize: Sequelize): typeof PurchasedItem {
  PurchasedItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'ID',
      },
      orderNumber: {
        type: DataTypes.STRING(50),
        field: 'ordernumber',
      },
      websiteName: {
        type: DataTypes.STRING(100),
        field: 'WebsiteName',
      },
      username: {
        type: DataTypes.STRING(100),
        field: 'username',
      },
      ngaySaveLink: {
        type: DataTypes.DATE,
        field: 'ngaySaveLink',
      },
      loaiTien: {
        type: DataTypes.STRING(10),
        field: 'loaiTien',
      },
      tenQuocGia: {
        type: DataTypes.STRING(100),
        field: 'tenQuocGia',
      },
      linkWeb: {
        type: DataTypes.STRING(500),
        field: 'linkWeb',
      },
      linkHinh: {
        type: DataTypes.STRING(500),
        field: 'linkHinh',
      },
      color: {
        type: DataTypes.STRING(50),
        field: 'color',
      },
      size: {
        type: DataTypes.STRING(50),
        field: 'size',
      },
      soLuong: {
        type: DataTypes.INTEGER,
        field: 'soLuong',
      },
      donGiaWeb: {
        type: DataTypes.FLOAT,
        field: 'donGiaWeb',
      },
      cong: {
        type: DataTypes.FLOAT,
        field: 'cong',
      },
      saleOff: {
        type: DataTypes.FLOAT,
        field: 'saleOff',
      },
      phuThu: {
        type: DataTypes.FLOAT,
        field: 'phuThu',
      },
      shipUsa: {
        type: DataTypes.FLOAT,
        field: 'shipUsa',
      },
      tax: {
        type: DataTypes.FLOAT,
        field: 'tax',
      },
      tienCongVnd: {
        type: DataTypes.FLOAT,
        field: 'tienCongVnd',
      },
      tongTienVnd: {
        type: DataTypes.FLOAT,
        field: 'tongTienVnd',
      },
      vungMien: {
        type: DataTypes.STRING(100),
        field: 'vungMien',
      },
      ghiChu: {
        type: DataTypes.STRING(1000),
        field: 'ghiChu',
      },
      usernameSave: {
        type: DataTypes.STRING(100),
        field: 'usernameSave',
      },
      trangThaiOrder: {
        type: DataTypes.INTEGER,
        field: 'trangThaiOrder',
      },
      hangKhoan: {
        type: DataTypes.BOOLEAN,
        field: 'HangKhoan',
      },
      daXoa: {
        type: DataTypes.BOOLEAN,
        field: 'DaXoa',
      },
    },
    {
      sequelize,
      tableName: 'DonHang',
      timestamps: false,
    },
  );

  return PurchasedItem;
}
