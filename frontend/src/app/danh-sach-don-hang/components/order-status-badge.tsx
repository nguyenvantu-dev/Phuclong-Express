import { OrderStatus } from '@/types/order-status';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  Received: { label: 'Received', className: 'bg-[#14264b]/10 text-[#14264b] border border-[#14264b]/20' },
  Ordered:  { label: 'Ordered',  className: 'bg-amber-100 text-amber-700 border border-amber-200' },
  Shipped:  { label: 'Shipped',  className: 'bg-blue-100 text-blue-700 border border-blue-200' },
  Completed:{ label: 'Completed',className: 'bg-green-100 text-green-700 border border-green-200' },
  Cancelled:{ label: 'Cancelled',className: 'bg-red-100 text-red-700 border border-red-200' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus | string;
  asLink?: boolean;
  href?: string;
}

/** Color-coded status badge for order status column */
export default function OrderStatusBadge({ status, asLink, href }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-600 border border-slate-200',
  };

  const cls = `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-opacity ${config.className}`;

  if (asLink && href) {
    return (
      <a href={href} className={`${cls} hover:opacity-75 cursor-pointer`}>
        {config.label}
      </a>
    );
  }

  return <span className={cls}>{config.label}</span>;
}
