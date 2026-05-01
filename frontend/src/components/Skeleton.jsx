import React from 'react';

export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-lg ${className}`} />
  );
}

export const KpiSkeleton = () => (
  <div className="h-32 rounded-2xl animate-pulse bg-white/5 border border-white/5" />
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="space-y-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="h-12 rounded-xl animate-pulse bg-white/5 border border-white/5" />
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="h-64 rounded-2xl animate-pulse bg-white/5 border border-white/5" />
);
