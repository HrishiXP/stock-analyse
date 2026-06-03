'use client';
import { FOSignal } from '../../types/signal';

export function StreamingSignalCard({
  streamingText,
  signal,
  error,
  connectionState,
  onReconnect,
}: {
  streamingText: string;
  signal: FOSignal | null;
  error: string | null;
  connectionState?: 'idle' | 'connecting' | 'connected' | 'failed' | 'closed';
  onReconnect?: () => void;
}) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 text-slate-100 shadow-xl shadow-slate-950/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Live signal stream</div>
          <p className="text-slate-400">Streaming Gemini analysis token by token.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-slate-800 px-3 py-2 text-xs uppercase tracking-[0.24em] text-slate-400">STREAM</div>
          <div className="text-xs text-slate-400">{connectionState ?? 'idle'}</div>
          {connectionState === 'failed' && onReconnect ? (
            <button onClick={onReconnect} className="rounded-3xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-slate-900">Reconnect</button>
          ) : null}
        </div>
      </div>
      <div className="min-h-[220px] rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">
        {error ? <div className="text-rose-300">{error}</div> : streamingText || 'Waiting for AI to begin streaming...'}
      </div>
      {signal ? (
        <div className="mt-5 rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-300">
          Final signal loaded: <span className="font-semibold text-slate-100">{signal.signal}</span>
        </div>
      ) : null}
    </section>
  );
}
