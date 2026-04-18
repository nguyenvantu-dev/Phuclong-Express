'use client';

import { useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationItem } from './notification-item';

/**
 * Notification Bell — replaces the static FiBell button in admin/layout.tsx.
 *
 * Shows an unread badge, opens a dropdown with the latest 20 notifications,
 * and supports mark-read per item or all-at-once.
 */
export function NotificationBell() {
  const { unreadCount, notifications, isOpen, isLoading, toggleOpen, close, markRead, markAllRead } =
    useNotifications();

  // Close dropdown when clicking outside
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    if (isOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, close]);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={toggleOpen}
        className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-[#14264b] transition-colors cursor-pointer"
        aria-label="Thông báo"
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="text-sm font-semibold text-slate-700">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-bold text-red-600">
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-[#14264b] hover:underline font-medium"
              >
                Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-slate-400">Đang tải...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">Không có thông báo</div>
            ) : (
              notifications.map((n) => (
                <NotificationItem key={n.Id} notification={n} onMarkRead={markRead} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
