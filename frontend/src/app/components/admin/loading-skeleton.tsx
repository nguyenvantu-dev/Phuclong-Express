'use client';

export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-gray-100 rounded-lg h-16 animate-pulse" />
      ))}
    </div>
  );
}

export function TableLoadingSkeleton() {
  return (
    <div className="border border-cyan-200 rounded-lg overflow-hidden">
      <div className="bg-gray-100 h-14 animate-pulse border-b border-cyan-200" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-b border-cyan-200 h-16 bg-gray-50 animate-pulse" />
      ))}
    </div>
  );
}
