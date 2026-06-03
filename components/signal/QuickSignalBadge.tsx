'use client';
import { QuickSignal } from '../../types/signal';

export function QuickSignalBadge({ signal }: { signal: QuickSignal }) {
  const color = signal.signal.includes('BUY') || signal.signal.includes('BULL') ? 'bg-emerald-600 text-emerald-100' : signal.signal.includes('SELL') || signal.signal.includes('BEAR') ? 'bg-rose-600 text-rose-100' : 'bg-slate-700 text-slate-200';
  return (
    <div className={`rounded-3xl px-3 py-2 text-sm font-medium ${color}`}>
      <div>{signal.symbol}</div>
      <div className="mt-1 text-xs text-slate-100">{signal.signal}</div>
    </div>
  );
}
