'use client';
export function OpportunityScore({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-slate-500';
  return <span className={`rounded-full px-3 py-1 text-xs text-slate-100 ${color}`}>{score}</span>;
}
