'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { MarketClock } from '../../components/market/MarketClock';
import { GlobalCuesStrip } from '../../components/market/GlobalCuesStrip';
import { MarketMoodBanner } from '../../components/market/MarketMoodBanner';
import { SymbolSearch } from '../../components/ui/SymbolSearch';
import { useSignalStream } from '../../hooks/useSignalStream';
import { useAppStore } from '../../store/appStore';
import { StreamingSignalCard } from '../../components/signal/StreamingSignalCard';
import { SignalCard } from '../../components/signal/SignalCard';
import { MultiTimeframeView } from '../../components/signal/MultiTimeframeView';
import { NewsWall } from '../../components/news/NewsWall';
import { FNO_SYMBOLS } from '../../lib/nseSymbols';

const disclaimerText = `RISK WARNING: NSE-FO-Radar generates AI-powered analysis from publicly available news for EDUCATIONAL AND RESEARCH PURPOSES ONLY. This is NOT SEBI-registered investment advice. F&O derivatives carry unlimited loss risk and are unsuitable for most retail investors. AI analysis can be wrong. News-based signals do not account for price action, order flow, or insider information. The developers are not liable for trading losses. Always consult a SEBI-registered Research Analyst before trading F&O.`;

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY');

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState<string | null>(null);
  const { start, streamingText, signal, news, isStreaming, error, connectionState, manualReconnect } = useSignalStream(selectedSymbol);
  const { finalizeSignal, currentSignal, multiSignal, setMultiSignal, setSelectedSymbol: setAppSelectedSymbol } = useAppStore((state) => ({
    finalizeSignal: state.finalizeSignal,
    currentSignal: state.currentSignal,
    multiSignal: state.multiSignal,
    setMultiSignal: state.setMultiSignal,
    setSelectedSymbol: state.setSelectedSymbol,
  }));

  useEffect(() => {
    if (isClient && !sessionStorage.getItem('risk_ack')) {
      setShowDisclaimer(true);
    }
  }, [isClient]);

  useEffect(() => {
    setAppSelectedSymbol(selectedSymbol);
    // Auto-fetch convergence data
    const fetchConvergence = async () => {
      try {
        const res = await fetch(`/api/signals/convergence?symbol=${selectedSymbol}`);
        const json = await res.json();
        if (json.success) setMultiSignal(json.data);
      } catch {}
    };
    if (isClient) fetchConvergence();
  }, [selectedSymbol, setAppSelectedSymbol, isClient, setMultiSignal]);

  if (status === 'loading' || !isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-emerald-500">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500/20 border-t-emerald-500"></div>
          <span className="text-sm font-medium uppercase tracking-[0.2em]">Initializing Institutional Terminal...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const handleSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleQuickScan = async () => {
    setQuickLoading(true);
    setQuickError(null);
    try {
      const response = await fetch('/api/signals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: selectedSymbol }),
      });
      const result = await response.json();
      if (result.success) {
        finalizeSignal(result.data);
      } else {
        setQuickError(result.error || 'Signal generation failed.');
      }
    } catch (err) {
      setQuickError(String(err));
    } finally {
      setQuickLoading(false);
    }
  };

  const activeSignal = currentSignal ?? signal;
  const summarySignal = activeSignal ?? { symbol: selectedSymbol, signal: 'NEUTRAL' };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <MarketMoodBanner />
        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_1.4fr_320px]">
          <aside className="space-y-6">
            <Sidebar />
            <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-5">
              <MarketClock />
              <div className="mt-5">
                <GlobalCuesStrip />
              </div>
            </div>
          </aside>
          <section className="space-y-6">
            <SymbolSearch onSelect={handleSelect} />
            <div className="grid gap-4 md:grid-cols-2">
              <button onClick={() => start(selectedSymbol, true)} className="rounded-3xl bg-emerald-600 px-5 py-4 text-sm font-semibold text-slate-950 hover:bg-emerald-500">
                Deep Analysis
              </button>
              <button onClick={handleQuickScan} disabled={quickLoading} className="rounded-3xl border border-slate-700 bg-slate-900 px-5 py-4 text-sm font-semibold text-slate-100 hover:border-slate-500">
                {quickLoading ? 'Scanning...' : 'Quick Scan'}
              </button>
            </div>
            <StreamingSignalCard streamingText={streamingText} signal={activeSignal} error={error || quickError} connectionState={connectionState} onReconnect={manualReconnect} />
            {activeSignal ? <SignalCard signal={activeSignal} /> : null}
            
            {multiSignal ? (
              <MultiTimeframeView data={multiSignal} />
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 animate-pulse">
                <div className="mb-4 text-xl font-semibold text-slate-100 italic">Analyzing Multi-Timeframe Convergence...</div>
                <div className="grid gap-3 md:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 rounded-3xl bg-slate-800/50"></div>
                  ))}
                </div>
              </div>
            )}
          </section>
          <aside className="space-y-6">
            <NewsWall symbol={selectedSymbol} />
          </aside>
        </div>
      </main>
      {showDisclaimer ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-6">
          <div className="max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
            <h2 className="text-2xl font-semibold text-slate-100">Risk Warning</h2>
            <p className="mt-4 text-slate-300 whitespace-pre-line">{disclaimerText}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={() => { sessionStorage.setItem('risk_ack', 'true'); setShowDisclaimer(false); }} className="rounded-3xl bg-emerald-600 px-6 py-3 font-semibold text-slate-950">Proceed to Analysis</button>
              <button onClick={() => setShowDisclaimer(false)} className="rounded-3xl border border-slate-700 px-6 py-3 text-slate-200">I Understand</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
