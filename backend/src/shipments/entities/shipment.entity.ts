import { DataTypes, Model } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

/**
 * Shipment Model (Sequelize)
 *
 * Represents a shipment batch (DotHang) in the Phuc Long Express system.
 */
export class Shipment extends Model {
  ID: number;
  tenDotHang: string;
  username: string;
  maDatHang: string;
  canNang: number;
  phiShipVeVnUsd: number;
  tyGia: number;
  phiShipVeVnVnd: number;
  tienHangUsd: number;
  tienHangVnd: number;
  shipperId: number;
  yeuCauGuiHang: number;
  yeuCauGuiGhiChu: string;
  ngayGuiHang: Date;
  soVanDon: string;
  phiShipTrongNuoc: number;
  diaChiNhanHang: string;
  datCoc: number;
  ngayTao: Date;
  nguoiTao: string;
  isCompleted: boolean;
}

export const ShipmentModel = (sequelize: Sequelize) => {
  Shipment.init(
    {
      ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        field: 'ID',
      },
      tenDotHang: {
        type: DataTypes.STRING(255),
        field: 'ten_dot_hang',
        unique: true,
      },
      username: {
        type: DataTypes.STRING(100),
      },
      maDatHang: {
        type: DataTypes.STRING(100),
        field: 'ma_dat_hang',
      },
      canNang: {
        type: DataTypes.DECIMAL(10, 2),
      },
      phiShipVeVnUsd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'phi_ship_ve_vn_usd',
      },
      tyGia: {
        type: DataTypes.DECIMAL(15, 2),
      },
      phiShipVeVnVnd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'phi_ship_ve_vn_vnd',
      },
      tienHangUsd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'tien_hang_usd',
      },
      tienHangVnd: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'tien_hang_vnd',
      },
      shipperId: {
        type: DataTypes.INTEGER,
        field: 'shipper_id',
      },
      yeuCauGuiHang: {
        type: DataTypes.INTEGER,
        field: 'yeu_cau_gui_hang',
        defaultValue: 0,
      },
      yeuCauGuiGhiChu: {
        type: DataTypes.TEXT,
        field: 'yeu_cau_gui_ghichu',
      },
      ngayGuiHang: {
        type: DataTypes.DATE,
        field: 'ngay_gui_hang',
      },
      soVanDon: {
        type: DataTypes.STRING(100),
        field: 'so_van_don',
      },
      phiShipTrongNuoc: {
        type: DataTypes.DECIMAL(15, 2),
        field: 'phi_ship_trong_nuoc',
      },
      diaChiNhanHang: {
        type: DataTypes.TEXT,
        field: 'dia_chi_nhan_hang',
      },
      datCoc: {
        type: DataTypes.DECIMAL(15, 2),
      },
      ngayTao: {
        type: DataTypes.DATE,
        field: 'ngay_tao',
      },
      nguoiTao: {
        type: DataTypes.STRING(100),
        field: 'nguoi_tao',
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        field: 'is_completed',
        defaultValue: false,
      },
    },
    {
      sequelize,
      tableName: 'DotHang',
      timestamps: false,
    },
  );

  return Shipment;
};
