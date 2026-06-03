'use client';
export function SourceBadge({ label }: { label: string }) {
  return <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">{label}</span>;
}
