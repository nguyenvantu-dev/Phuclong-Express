import { Injectable, Inject } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';

export interface CreateNotificationDto {
  username: string;   // recipient
  title: string;
  message: string;
  type?: 'debt' | 'order' | 'info';
  createdBy?: string;
  refType?: string;
  refId?: string;
}

/**
 * Notifications Service
 *
 * Handles all notification CRUD via inline SQL (no stored procedures).
 * Module is self-contained — can be imported by any feature module.
 */
@Injectable()
export class NotificationsService {
  constructor(@Inject('SEQUELIZE') private readonly sequelize: Sequelize) {}

  /** Insert a new notification for the given recipient username */
  async create(dto: CreateNotificationDto): Promise<void> {
    await this.sequelize.query(
      `INSERT INTO Notifications (UserName, Title, Message, Type, CreatedBy, RefType, RefId)
       VALUES (:username, :title, :message, :type, :createdBy, :refType, :refId)`,
      {
        replacements: {
          username:  dto.username,
          title:     dto.title,
          message:   dto.message,
          type:      dto.type ?? 'info',
          createdBy: dto.createdBy ?? null,
          refType:   dto.refType ?? null,
          refId:     dto.refId ?? null,
        },
        type: 'SELECT' as const,
      },
    );
  }

  /** Paginated list for a user — unread rows first, then newest */
  async getByUsername(username: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const results = await this.sequelize.query(
      `SELECT Id, UserName, Title, Message, Type, IsRead, CreatedAt, CreatedBy, RefType, RefId,
              COUNT(*) OVER() AS TotalRow
       FROM   Notifications
       WHERE  UserName = :username
       ORDER  BY IsRead ASC, CreatedAt DESC
       OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY`,
      { replacements: { username, offset, limit }, type: 'SELECT' as const },
    );

    const data  = Array.isArray(results) ? results : [];
    const first = data.length > 0 ? (data[0] as any) : null;
    const total = first?.TotalRow ? Number(first.TotalRow) : 0;
    return { data, total, page, limit };
  }

  /** Number of unread notifications for a user, optionally filtered by type */
  async getUnreadCount(username: string, type?: string): Promise<number> {
    const typeClause = type ? ` AND Type = :type` : '';
    const results = await this.sequelize.query(
      `SELECT COUNT(*) AS UnreadCount FROM Notifications WHERE UserName = :username AND IsRead = 0${typeClause}`,
      { replacements: { username, ...(type ? { type } : {}) }, type: 'SELECT' as const },
    );
    const row = Array.isArray(results) && results.length > 0 ? (results[0] as any) : null;
    return row?.UnreadCount ? Number(row.UnreadCount) : 0;
  }

  /** Mark a single notification as read (scoped to username for security) */
  async markRead(id: number, username: string): Promise<void> {
    await this.sequelize.query(
      `UPDATE Notifications SET IsRead = 1 WHERE Id = :id AND UserName = :username`,
      { replacements: { id, username }, type: 'SELECT' as const },
    );
  }

  /** Mark all unread notifications as read for a user, optionally filtered by type */
  async markAllRead(username: string, type?: string): Promise<void> {
    const typeClause = type ? ` AND Type = :type` : '';
    await this.sequelize.query(
      `UPDATE Notifications SET IsRead = 1 WHERE UserName = :username AND IsRead = 0${typeClause}`,
      { replacements: { username, ...(type ? { type } : {}) }, type: 'SELECT' as const },
    );
  }
}
