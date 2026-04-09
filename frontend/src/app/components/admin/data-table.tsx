'use client';

import React from 'react';

interface Column {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
  columns: Column[];
  data: any[];
  rowKey?: string;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: any) => void;
}

export function DataTable({
  columns,
  data,
  rowKey = 'id',
  loading = false,
  emptyMessage = 'Không có dữ liệu',
  onRowClick,
}: DataTableProps) {
  if (loading) {
    return (
      <div className="border border-cyan-200 rounded-lg overflow-hidden">
        <div className="bg-cyan-50 h-14 animate-pulse border-b border-cyan-200" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="border-b border-cyan-200 h-16 bg-gray-50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="border border-cyan-200 rounded-lg overflow-x-auto bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cyan-200 bg-cyan-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 font-semibold text-cyan-900 text-${col.align || 'left'}`}
                style={{ width: col.width }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, idx) => (
              <tr
                key={row[rowKey] || idx}
                className="border-b border-cyan-100 hover:bg-cyan-50 transition-colors cursor-pointer"
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={`${row[rowKey]}-${col.key}`}
                    className={`px-4 py-3 text-gray-700 text-${col.align || 'left'}`}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
