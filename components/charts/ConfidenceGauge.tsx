'use client';
import React from 'react';

export function ConfidenceGauge({ value }: { value: number }) {
  const angle = Math.round((value / 100) * 180);
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Confidence</div>
      <div className="text-3xl font-semibold text-slate-100">{value}%</div>
    </div>
  );
}
