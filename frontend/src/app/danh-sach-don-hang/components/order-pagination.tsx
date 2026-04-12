'use client';

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface OrderPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

/** Simple prev/next pagination bar with page info */
export default function OrderPagination({ page, totalPages, total, onPrev, onNext }: OrderPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-5 px-1">
      <p className="text-sm text-slate-500">
        Trang <span className="font-semibold text-slate-700">{page}</span> / {totalPages}
        <span className="ml-2 text-slate-400">(Tổng {total} đơn)</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrev}
          disabled={page === 1}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
        >
          <FiChevronLeft className="w-4 h-4" />
          Trước
        </button>
        <button
          onClick={onNext}
          disabled={page === totalPages}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150"
        >
          Sau
          <FiChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
