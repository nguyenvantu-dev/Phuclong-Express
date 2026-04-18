'use client';

import { Notification } from '@/lib/notifications-api-client';

interface Props {
  notification: Notification;
  onMarkRead: (id: number) => void;
}

/** Format a UTC datetime string as a relative Vietnamese label */
function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1)   return 'vừa xong';
  if (minutes < 60)  return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1)    return 'hôm qua';
  return `${days} ngày trước`;
}

const TYPE_DOT: Record<string, string> = {
  debt:  'bg-red-500',
  order: 'bg-orange-400',
  info:  'bg-blue-500',
};

/**
 * Single row inside the notification dropdown.
 * Clicking an unread item marks it as read.
 */
export function NotificationItem({ notification: n, onMarkRead }: Props) {
  const dotColor = TYPE_DOT[n.Type] ?? TYPE_DOT.info;

  return (
    <button
      onClick={() => !n.IsRead && onMarkRead(n.Id)}
      className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-slate-50 transition-colors ${
        !n.IsRead ? 'bg-blue-50/60' : ''
      }`}
    >
      {/* Type indicator dot */}
      <span className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${dotColor} ${!n.IsRead ? 'opacity-100' : 'opacity-30'}`} />

      <div className="min-w-0 flex-1">
        <p className={`text-sm truncate ${!n.IsRead ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
          {n.Title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.Message}</p>
        <p className="text-[11px] text-slate-400 mt-1">{relativeTime(n.CreatedAt)}</p>
      </div>
    </button>
  );
}
