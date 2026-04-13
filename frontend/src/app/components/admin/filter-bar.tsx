'use client';

import React from 'react';

interface FilterBarProps {
  children: React.ReactNode;
  onReset?: () => void;
}

export function FilterBar({ children, onReset }: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-[#14264b]/20 p-6 mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        {children}
        {onReset && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium text-sm"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FilterField({ label, children, required }: FilterFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-[#14264b]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
