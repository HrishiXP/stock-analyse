'use client';
import { MultiTimeframeSignal } from '../../types/signal';

export function MultiTimeframeView({ data }: { data: MultiTimeframeSignal }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Multi-Timeframe Alignment</h3>
          <p className="text-sm text-slate-400">Scalp, swing and positional sentiment in parallel.</p>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-400">{String(data.alignment).replaceAll('_', ' ')}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {[data.scalp, data.swing, data.positional].map((signal) => (
          <div key={signal.symbol + signal.signal} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
            <div className="text-sm uppercase tracking-[0.3em] text-slate-400">{signal.symbol}</div>
            <div className="mt-2 text-lg font-semibold text-slate-100">{signal.signal}</div>
            <div className="mt-1 text-sm text-slate-400">{signal.one_liner}</div>
            <div className="mt-3 text-xs uppercase tracking-[0.3em] text-slate-400">Confidence</div>
            <div className="mt-1 text-xl font-semibold text-slate-100">{signal.confidence}%</div>
          </div>
        ))}
      </div>
    </section>
  );
}
