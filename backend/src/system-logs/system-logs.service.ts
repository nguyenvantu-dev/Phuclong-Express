import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { QueryTypes, Transaction } from 'sequelize';

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
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  /**
   * Find all system logs with filters and pagination
   */
  async findAll(query: QuerySystemLogsDto): Promise<{ data: SystemLog[]; total: number; page: number; limit: number }> {
    const { username, nguon, hanhDong, doiTuong, noiDung, startDate, endDate } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;

    try {
      const conditions: string[] = [];
      const replacements: Record<string, string> = {};

      if (username) {
        conditions.push(`NguoiTao LIKE :username`);
        replacements.username = `%${username}%`;
      }
      if (nguon) {
        conditions.push(`Nguon LIKE :nguon`);
        replacements.nguon = `%${nguon}%`;
      }
      if (hanhDong) {
        conditions.push(`HanhDong = :hanhDong`);
        replacements.hanhDong = hanhDong;
      }
      if (doiTuong) {
        conditions.push(`DoiTuong LIKE :doiTuong`);
        replacements.doiTuong = `%${doiTuong}%`;
      }
      if (noiDung) {
        conditions.push(`NoiDung LIKE :noiDung`);
        replacements.noiDung = `%${noiDung}%`;
      }
      if (startDate) {
        conditions.push(`NgayTao >= :startDate`);
        replacements.startDate = startDate;
      }
      if (endDate) {
        conditions.push(`NgayTao <= :endDate`);
        replacements.endDate = endDate;
      }

      const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const offset = (page - 1) * limit;

      const [countResult] = await this.sequelize.query<{ total: number }>(
        `SELECT COUNT(*) as total FROM dbo.tbSystemLogs ${whereClause}`,
        { replacements, type: QueryTypes.SELECT },
      );
      const total = Number((countResult as any)?.total) || 0;

      const data = await this.sequelize.query<SystemLog>(
        `SELECT * FROM (
          SELECT ROW_NUMBER() OVER (ORDER BY NgayTao DESC) as RowNum, * FROM dbo.tbSystemLogs ${whereClause}
        ) AS Paginated
        WHERE RowNum BETWEEN ${offset + 1} AND ${offset + limit}`,
        { replacements, type: QueryTypes.SELECT },
      );

      return { data: data || [], total, page, limit };
    } catch (error) {
      console.error('Error in findAll system logs:', error instanceof Error ? error.message : error);
      return { data: [], total: 0, page, limit };
    }
  }

  /**
   * Create a new system log entry.
   *
   * Uses injected Sequelize pool (no per-call connection) and parameterized
   * values so multi-row import loops don't open one TCP/auth handshake per row
   * and don't crash on quotes in NoiDung.
   *
   * @param transaction optional caller-owned transaction (e.g. bulk import)
   */
  async create(
    logData: {
      nguoiTao: string;
      nguon: string;
      hanhDong: string;
      doiTuong: string;
      noiDung: string;
    },
    transaction?: Transaction,
  ): Promise<SystemLog> {
    const rows = await this.sequelize.query<{ ID: number }>(
      `INSERT INTO dbo.tbSystemLogs (NguoiTao, NgayTao, Nguon, HanhDong, DoiTuong, NoiDung)
       VALUES (:nguoiTao, GETDATE(), :nguon, :hanhDong, :doiTuong, :noiDung);
       SELECT SCOPE_IDENTITY() as ID;`,
      {
        replacements: {
          nguoiTao: logData.nguoiTao,
          nguon: logData.nguon,
          hanhDong: logData.hanhDong,
          doiTuong: logData.doiTuong,
          noiDung: logData.noiDung,
        },
        type: QueryTypes.SELECT,
        transaction,
      },
    );

    return {
      SystemLogsID: Number(rows[0]?.ID),
      NguoiTao: logData.nguoiTao,
      NgayTao: new Date(),
      Nguon: logData.nguon,
      HanhDong: logData.hanhDong,
      DoiTuong: logData.doiTuong,
      NoiDung: logData.noiDung,
    };
  }
}