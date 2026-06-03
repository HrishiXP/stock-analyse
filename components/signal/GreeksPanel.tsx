'use client';
import { FOSignal } from '../../types/signal';

export function GreeksPanel({ greeks }: { greeks?: FOSignal['greeks'] }) {
  const entries = Object.entries(greeks ?? {});
  if (entries.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-center text-slate-400">Greeks unavailable</div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {entries.map(([name, value]) => (
        <div key={name} className="rounded-3xl border border-slate-800 bg-slate-950 p-4 text-center">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-400">{name.replace('_', ' ')}</div>
          <div className="mt-2 text-lg font-semibold text-slate-100">{value}</div>
        </div>
      ))}
    </div>
  );
}
