'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notificationsApiClient, Notification } from '@/lib/notifications-api-client';

const POLL_INTERVAL_MS = 30_000;

/**
 * Hook managing notification state with 30s polling for unread count.
 * Full list is fetched on-demand when the dropdown opens.
 */
export function useNotifications(type?: string, enabled = true) {
  const [unreadCount, setUnreadCount]     = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen]               = useState(false);
  const [isLoading, setIsLoading]         = useState(false);
  const intervalRef                       = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApiClient.getUnreadCount(type);
      setUnreadCount(res.data.count);
    } catch {
      // Silently ignore — polling errors should not surface to user
    }
  }, []);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await notificationsApiClient.getList(1, 20);
      setNotifications(res.data.data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start polling on mount — skip if not enabled (e.g. unauthenticated)
  useEffect(() => {
    if (!enabled) return;
    fetchUnreadCount();
    intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchUnreadCount, enabled]);

  // Fetch full list whenever dropdown opens
  useEffect(() => {
    if (isOpen) fetchList();
  }, [isOpen, fetchList]);

  const toggleOpen = () => setIsOpen((prev) => !prev);
  const close      = () => setIsOpen(false);

  const markRead = async (id: number) => {
    await notificationsApiClient.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.Id === id ? { ...n, IsRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await notificationsApiClient.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, IsRead: true })));
    setUnreadCount(0);
  };

  return { unreadCount, notifications, isOpen, isLoading, toggleOpen, close, markRead, markAllRead };
}
