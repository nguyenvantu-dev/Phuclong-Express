import { DataTypes, Model } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

/**
 * User Model (Sequelize)
 *
 * Represents a user in the Phuc Long Express system.
 * Maps to AspNetUsers table.
 */
export class User extends Model {
  Id: string;
  UserName: string;
  Email: string;
  EmailConfirmed: boolean;
  PasswordHash: string;
  SecurityStamp: string;
  PhoneNumber: string;
  PhoneNumberConfirmed: boolean;
  TwoFactorEnabled: boolean;
  LockoutEndDateUtc: Date;
  LockoutEnabled: boolean;
  AccessFailedCount: number;
  HoTen: string;
  DiaChi: string;
  TinhThanh: string;
  SoTaiKhoan: string;
  HinhThucNhanHang: string;
  KhachBuon: boolean;
  LinkTaiKhoanMang: string;
  VungMien: string;
  roles: string[];
}

export const UserModel = (sequelize: Sequelize) => {
  User.init(
    {
      Id: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      UserName: {
        type: DataTypes.STRING,
        unique: true,
      },
      Email: {
        type: DataTypes.STRING,
        unique: true,
      },
      EmailConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      PasswordHash: {
        type: DataTypes.STRING,
      },
      SecurityStamp: {
        type: DataTypes.STRING,
      },
      PhoneNumber: {
        type: DataTypes.STRING,
      },
      PhoneNumberConfirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      TwoFactorEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      LockoutEndDateUtc: {
        type: DataTypes.DATE,
      },
      LockoutEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      AccessFailedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      HoTen: {
        type: DataTypes.STRING,
      },
      DiaChi: {
        type: DataTypes.STRING,
      },
      TinhThanh: {
        type: DataTypes.STRING,
      },
      SoTaiKhoan: {
        type: DataTypes.STRING,
      },
      HinhThucNhanHang: {
        type: DataTypes.STRING,
      },
      KhachBuon: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      LinkTaiKhoanMang: {
        type: DataTypes.STRING,
      },
      VungMien: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      tableName: 'AspNetUsers',
      timestamps: false,
    },
  );

  return User;
};
