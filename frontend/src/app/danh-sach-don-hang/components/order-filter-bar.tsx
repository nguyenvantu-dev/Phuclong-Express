'use client';

import { FiSearch, FiDownload } from 'react-icons/fi';

const ORDER_STATUSES = ['Received', 'Ordered', 'Shipped', 'Completed', 'Cancelled'];

const STATUS_PILL_CONFIG: Record<string, string> = {
  Received:  'data-[active=true]:bg-cyan-600   data-[active=true]:text-white   data-[active=true]:border-cyan-600',
  Ordered:   'data-[active=true]:bg-amber-500  data-[active=true]:text-white   data-[active=true]:border-amber-500',
  Shipped:   'data-[active=true]:bg-blue-600   data-[active=true]:text-white   data-[active=true]:border-blue-600',
  Completed: 'data-[active=true]:bg-green-600  data-[active=true]:text-white   data-[active=true]:border-green-600',
  Cancelled: 'data-[active=true]:bg-red-500    data-[active=true]:text-white   data-[active=true]:border-red-500',
};

interface OrderFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  selectedStatuses: string[];
  onToggleStatus: (status: string) => void;
  statusCounts: Record<string, number>;
  onExport: () => void;
  exportDisabled: boolean;
}

/** Filter bar: search input + status pill toggles + action buttons */
export default function OrderFilterBar({
  search,
  onSearchChange,
  onSearchSubmit,
  selectedStatuses,
  onToggleStatus,
  statusCounts,
  onExport,
  exportDisabled,
}: OrderFilterBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearchSubmit();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-5">
      {/* Top row: search + actions */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm đơn hàng..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-colors bg-slate-50 placeholder:text-slate-400"
          />
        </div>
        <button
          onClick={onSearchSubmit}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors duration-200 shadow-sm"
        >
          Xem
        </button>
        <button
          onClick={onExport}
          disabled={exportDisabled}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FiDownload className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Status pills */}
      <div className="flex flex-wrap gap-2">
        {ORDER_STATUSES.map((status) => {
          const active = selectedStatuses.includes(status);
          const count = statusCounts[status];
          const pillConfig = STATUS_PILL_CONFIG[status] ?? '';
          return (
            <button
              key={status}
              type="button"
              data-active={active}
              onClick={() => onToggleStatus(status)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 bg-slate-50 text-slate-600 cursor-pointer transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 ${pillConfig}`}
            >
              {status}
              {count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    active ? 'bg-white/30' : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
