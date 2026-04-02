import { DataTypes, Model, Sequelize } from 'sequelize';

/**
 * In-Stock Item Entity (HangCoSan)
 *
 * Represents products that are available in stock.
 *
 * Fields:
 * - ID: Primary key
 * - MaSoHang: Product code
 * - TenHinh: Image filename
 * - TenHang: Product name
 * - LinkHang: Product link
 * - GiaTien: Price
 * - MoTa: Description
 * - SoSao: Rating stars
 * - ThuTu: Display order
 * - NoiDungTimKiem: Search keywords
 */
export class InStockItem extends Model {
  id!: number;
  maSoHang!: string;
  tenHinh!: string;
  tenHang!: string;
  linkHang!: string;
  giaTien!: number;
  moTa!: string;
  soSao!: number;
  thuTu!: number;
  noiDungTimKiem!: string;
}

export function InStockItemModel(sequelize: Sequelize): typeof InStockItem {
  InStockItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      maSoHang: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'MaSoHang',
      },
      tenHinh: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'TenHinh',
      },
      tenHang: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'TenHang',
      },
      linkHang: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: 'LinkHang',
      },
      giaTien: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'GiaTien',
      },
      moTa: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'MoTa',
      },
      soSao: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'SoSao',
      },
      thuTu: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'ThuTu',
      },
      noiDungTimKiem: {
        type: DataTypes.STRING(1000),
        allowNull: true,
        field: 'NoiDungTimKiem',
      },
    },
    {
      sequelize,
      tableName: 'HangCoSan',
      timestamps: false,
    },
  );

  return InStockItem;
}
