'use client';
export function LoadingSkeleton() {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-lg shadow-slate-950/10">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="h-6 rounded-full bg-slate-800" />
      ))}
    </div>
  );
}
