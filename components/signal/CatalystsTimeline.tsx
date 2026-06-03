'use client';
import { FOSignal } from '../../types/signal';

export function CatalystsTimeline({ catalysts }: { catalysts: FOSignal['key_catalysts'] }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <div className="text-sm font-semibold text-slate-100">Key Catalysts</div>
      <div className="mt-4 space-y-3">
        {catalysts.length ? catalysts.map((item, index) => (
          <div key={`${item.factor}-${index}`} className="flex items-start gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
            <div>
              <div className="font-semibold text-slate-100">{item.factor}</div>
              <div className="text-xs text-slate-400">{item.impact} / {item.direction}</div>
            </div>
          </div>
        )) : <div className="text-slate-500">No catalysts available in this signal.</div>}
      </div>
    </div>
  );
}
