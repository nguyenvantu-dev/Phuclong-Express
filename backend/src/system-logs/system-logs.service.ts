import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
const tedious = require('tedious');

export interface QuerySystemLogsDto {
  username?: string;
  nguon?: string;
  hanhDong?: string;
  doiTuong?: string;
  noiDung?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SystemLog {
  SystemLogsID: number;
  NguoiTao: string;
  NgayTao: Date;
  Nguon: string;
  HanhDong: string;
  DoiTuong: string;
  NoiDung: string;
}

/**
 * System Logs Service
 *
 * Handles system activity logging queries (from BaoCaoHoatDongHeThong)
 */
@Injectable()
export class SystemLogsService {
  constructor() {}

  /**
   * Find all system logs with filters and pagination
   */
  async findAll(query: QuerySystemLogsDto): Promise<{ data: SystemLog[]; total: number; page: number; limit: number }> {
    const { username, nguon, hanhDong, doiTuong, noiDung, startDate, endDate, page = 1, limit = 50 } = query;

    try {
      const sequelize = new Sequelize({
        dialect: 'mssql',
        host: process.env.DB_HOST || 'localhost',
        username: process.env.DB_USERNAME || 'sa',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_DATABASE || 'PhucLong',
        logging: false,
        dialectOptions: {
          encrypt: true,
          trustServerCertificate: true,
        },
        dialectModule: tedious
      });

      let whereClause = 'WHERE 1=1';

      if (username) {
        whereClause += ` AND NguoiTao LIKE '%${username}%'`;
      }
      if (nguon) {
        whereClause += ` AND Nguon LIKE '%${nguon}%'`;
      }
      if (hanhDong) {
        whereClause += ` AND HanhDong = '${hanhDong}'`;
      }
      if (doiTuong) {
        whereClause += ` AND DoiTuong LIKE '%${doiTuong}%'`;
      }
      if (noiDung) {
        whereClause += ` AND NoiDung LIKE '%${noiDung}%'`;
      }
      if (startDate) {
        whereClause += ` AND NgayTao >= '${startDate}'`;
      }
      if (endDate) {
        whereClause += ` AND NgayTao <= '${endDate}'`;
      }

      const offset = (page - 1) * limit;

      // Get total count
      const [countResult]: any[] = await sequelize.query(
        `SELECT COUNT(*) as total FROM dbo.SystemLogs ${whereClause}`
      );
      const total = Number(countResult[0]?.total) || 0;

      // Get paginated data
      const [data]: any[] = await sequelize.query(`
        SELECT * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY NgayTao DESC) as RowNum, * FROM dbo.SystemLogs ${whereClause}
        ) AS Paginated
        WHERE RowNum BETWEEN ${offset + 1} AND ${offset + limit}
      `);

      await sequelize.close();

      return {
        data: data || [],
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in findAll system logs:', error.message);
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  /**
   * Create a new system log entry
   */
  async create(logData: {
    nguoiTao: string;
    nguon: string;
    hanhDong: string;
    doiTuong: string;
    noiDung: string;
  }): Promise<SystemLog> {
    const sequelize = new Sequelize({
      dialect: 'mssql',
      host: process.env.DB_HOST || 'localhost',
      username: process.env.DB_USERNAME || 'sa',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_DATABASE || 'PhucLong',
      logging: false,
      dialectOptions: {
        encrypt: true,
        trustServerCertificate: true,
      },
      dialectModule: tedious
    });

    const [result]: any[] = await sequelize.query(`
      INSERT INTO dbo.tbSystemLogs (NguoiTao, NgayTao, Nguon, HanhDong, DoiTuong, NoiDung)
      VALUES ('${logData.nguoiTao}', GETDATE(), '${logData.nguon}', '${logData.hanhDong}', '${logData.doiTuong}', '${logData.noiDung}');
      SELECT SCOPE_IDENTITY() as ID;
    `);

    await sequelize.close();

    return {
      SystemLogsID: Number(result[0]?.ID),
      NguoiTao: logData.nguoiTao,
      NgayTao: new Date(),
      Nguon: logData.nguon,
      HanhDong: logData.hanhDong,
      DoiTuong: logData.doiTuong,
      NoiDung: logData.noiDung,
    };
  }
}