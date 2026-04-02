import { DataTypes, Model, Sequelize } from 'sequelize';

/**
 * Service Fee Entity (GiaTienCong)
 *
 * Represents service fee configuration based on price range and currency.
 * Used for calculating service fees for orders.
 *
 * Fields:
 * - ID: Primary key
 * - LoaiTien: Currency type (VND, USD, etc.)
 * - TuGia: From price
 * - DenGia: To price
 * - TienCong1Mon: Service fee per item
 * - TinhTheoPhanTram: Calculate by percentage
 * - KhachBuon: Wholesale customer flag
 */
export class ServiceFee extends Model {
  id!: number;
  loaiTien!: string;
  tuGia!: number;
  denGia!: number;
  tienCong1Mon!: number;
  tinhTheoPhanTram!: boolean;
  khachBuon!: boolean;
}

export function ServiceFeeModel(sequelize: Sequelize): typeof ServiceFee {
  ServiceFee.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      loaiTien: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: 'LoaiTien',
      },
      tuGia: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: 'TuGia',
      },
      denGia: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: 'DenGia',
      },
      tienCong1Mon: {
        type: DataTypes.FLOAT,
        allowNull: false,
        field: 'TienCong1Mon',
      },
      tinhTheoPhanTram: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'TinhTheoPhanTram',
      },
      khachBuon: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'KhachBuon',
      },
    },
    {
      sequelize,
      tableName: 'GiaTienCong',
      timestamps: false,
    },
  );

  return ServiceFee;
}
