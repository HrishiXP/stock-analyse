'use client';

import { useMemo, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { ScannerTable } from '../../components/scanner/ScannerTable';
import { useBatchScan } from '../../hooks/useBatchScan';
import { FNO_SYMBOLS, NSE_FO_DATA } from '../../lib/nseSymbols';

const sectors = Array.from(new Set(Object.values(NSE_FO_DATA).map((item) => item.sector)));
const signals = ['BUY_CALL', 'BUY_PUT', 'SELL_CALL', 'SELL_PUT', 'BULL_SPREAD', 'BEAR_SPREAD', 'STRADDLE', 'NEUTRAL', 'AVOID'];

export default function ScannerPage() {
  const [sectorFilter, setSectorFilter] = useState('All');
  const [signalFilter, setSignalFilter] = useState('All');
  const [minConfidence, setMinConfidence] = useState(0);
  const { scan, error, isLoading, refresh } = useBatchScan();

  const filtered = useMemo(() => scan.filter((item: any) => {
    return (sectorFilter === 'All' || item.sector === sectorFilter)
      && (signalFilter === 'All' || item.signal === signalFilter)
      && item.confidence >= minConfidence;
  }), [scan, sectorFilter, signalFilter, minConfidence]);

  const handleExport = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'scanner-results.json';
    anchor.click();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-slate-100">Live Opportunity Scanner</h1>
              <p className="mt-2 text-slate-400">Scan all 60+ F&O symbols and rank the top opportunities from streaming AI insights.</p>
            </div>
            <button onClick={() => refresh()} className="rounded-3xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-500">
              {isLoading ? 'Refreshing...' : 'Run Full Scan'}
            </button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label htmlFor="sector-filter" className="sr-only">Sector filter</label>
            <select id="sector-filter" value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none">
              <option>All</option>
              {sectors.map((sector) => <option key={sector}>{sector}</option>)}
            </select>
            <label htmlFor="signal-filter" className="sr-only">Signal filter</label>
            <select id="signal-filter" value={signalFilter} onChange={(event) => setSignalFilter(event.target.value)} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none">
              <option>All</option>
              {signals.map((signal) => <option key={signal}>{signal}</option>)}
            </select>
            <div className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
              <label htmlFor="confidence-range" className="block text-xs uppercase tracking-[0.24em] text-slate-400">Min confidence</label>
              <input id="confidence-range" type="range" min="0" max="100" step="5" value={minConfidence} onChange={(event) => setMinConfidence(Number(event.target.value))} className="mt-3 w-full" />
              <div className="mt-2 text-sm text-slate-300">{minConfidence}%</div>
            </div>
          </div>
        </div>
        {error ? <div className="rounded-3xl border border-rose-700 bg-rose-950/40 p-5 text-slate-100">Error loading scanner results.</div> : null}
        <ScannerTable rows={filtered} />
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button onClick={handleExport} className="rounded-3xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500">Export JSON</button>
          <div className="text-sm text-slate-400">Showing {filtered.length} of {scan.length} symbols.</div>
        </div>
      </main>
    </div>
  );
}
