'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Navbar } from '../../../components/layout/Navbar';
import { SymbolSearch } from '../../../components/ui/SymbolSearch';
import { NewsWall } from '../../../components/news/NewsWall';
import { SignalCard } from '../../../components/signal/SignalCard';
import { useSignalStream } from '../../../hooks/useSignalStream';
import { useAppStore } from '../../../store/appStore';
import { MultiTimeframeView } from '../../../components/signal/MultiTimeframeView';

export default function SymbolAnalysisPage() {
  const params = useParams();
  const routeSymbol = String(params?.symbol ?? 'NIFTY').toUpperCase();
  const [selectedSymbol, setSelectedSymbol] = useState(routeSymbol);
  const [quickError, setQuickError] = useState<string | null>(null);
  const [quickLoading, setQuickLoading] = useState(false);
  const { start, streamingText, signal, news, isStreaming, error } = useSignalStream(selectedSymbol);
  const { finalizeSignal, currentSignal } = useAppStore((state) => ({ finalizeSignal: state.finalizeSignal, currentSignal: state.currentSignal }));

  useEffect(() => {
    setSelectedSymbol(routeSymbol);
  }, [routeSymbol]);

  const handleQuick = async () => {
    setQuickLoading(true);
    setQuickError(null);
    try {
      const res = await fetch('/api/signals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symbol: selectedSymbol }) });
      const data = await res.json();
      if (data.success) {
        finalizeSignal(data.data);
      } else {
        setQuickError(data.error || 'Unable to load signal.');
      }
    } catch (err) {
      setQuickError(String(err));
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-6 md:grid-cols-[1fr_320px]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-100">Deep Analysis: {selectedSymbol}</h1>
                <p className="mt-2 text-slate-400">Symbol-level F&O intelligence, news, and timeline analysis.</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => start(selectedSymbol, true)} className="rounded-3xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-slate-950">Stream</button>
                <button onClick={handleQuick} className="rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100">Quick</button>
              </div>
            </div>
            <div className="mt-6">
              <SymbolSearch onSelect={setSelectedSymbol} />
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Live stream output</div>
              <pre className="mt-4 min-h-[180px] rounded-3xl border border-slate-800 bg-slate-950 p-4 text-sm leading-6 text-slate-200">{streamingText || 'Stream tokens will appear here.'}</pre>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6">
              <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Signal summary</div>
              <div className="mt-4 text-slate-200">{(currentSignal ?? signal)?.one_liner ?? 'No signal loaded yet.'}</div>
            </div>
          </div>
        </div>
        {(currentSignal ?? signal) ? <SignalCard signal={currentSignal ?? signal} /> : null}
        <div className="mt-6">
          <MultiTimeframeView data={{ scalp: { symbol: selectedSymbol, signal: 'NEUTRAL', confidence: 50, one_liner: 'Awaiting signal.', opportunity_score: 0, sector: 'Unknown' }, swing: { symbol: selectedSymbol, signal: 'NEUTRAL', confidence: 50, one_liner: 'Awaiting signal.', opportunity_score: 0, sector: 'Unknown' }, positional: { symbol: selectedSymbol, signal: 'NEUTRAL', confidence: 50, one_liner: 'Awaiting signal.', opportunity_score: 0, sector: 'Unknown' }, alignment: 'MIXED' }} />
        </div>
        <div className="mt-6">
          <NewsWall symbol={selectedSymbol} />
        </div>
      </main>
    </div>
  );
}
