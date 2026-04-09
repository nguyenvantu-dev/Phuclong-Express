'use client';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  'Mới tạo': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'Mới tạo' },
  'Đang vận chuyển': { bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Đang vận chuyển' },
  'Đã về kho': { bg: 'bg-cyan-50', text: 'text-cyan-700', label: 'Đã về kho' },
  'Đã giao hàng': { bg: 'bg-green-50', text: 'text-green-700', label: 'Đã giao hàng' },
  'Hủy': { bg: 'bg-red-50', text: 'text-red-700', label: 'Hủy' },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    label: status,
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  );
}
