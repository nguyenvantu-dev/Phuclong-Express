import apiClient from './api-client';

export interface Notification {
  Id: number;
  UserName: string;
  Title: string;
  Message: string;
  Type: 'debt' | 'order' | 'info';
  IsRead: boolean;
  CreatedAt: string;
  CreatedBy: string | null;
  RefType: string | null;
  RefId: string | null;
}

export interface NotificationsListResponse {
  data: Notification[];
  total: number;
  page: number;
  limit: number;
}

/**
 * API client methods for the notifications endpoints.
 * Uses the shared Axios instance (JWT interceptor included).
 */
export const notificationsApiClient = {
  getList: (page = 1, limit = 20) =>
    apiClient.get<NotificationsListResponse>('/notifications', { params: { page, limit } }),

  getUnreadCount: (type?: string) =>
    apiClient.get<{ count: number }>('/notifications/unread-count', { params: type ? { type } : {} }),

  markRead: (id: number) =>
    apiClient.patch<{ success: boolean }>(`/notifications/${id}/read`),

  markAllRead: (type?: string) =>
    apiClient.patch<{ success: boolean }>('/notifications/read-all', {}, { params: type ? { type } : {} }),
};
