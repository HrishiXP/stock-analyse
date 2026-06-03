'use client';
import { useAppStore } from '../../store/appStore';
import { FNO_SYMBOLS, NSE_FO_DATA } from '../../lib/nseSymbols';

export function Sidebar() {
  const watchlist = useAppStore((state) => state.watchlist);
  const scanResults = useAppStore((state) => state.scanResults);
  const addToWatchlist = useAppStore((state) => state.addToWatchlist);

  return (
    <aside className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/95 p-4 text-slate-200 shadow-xl shadow-slate-950/30">
      <div>
        <h2 className="text-sm uppercase tracking-[0.24em] text-slate-400">Watchlist</h2>
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {watchlist.length ? watchlist.map((symbol) => (
            <div key={symbol} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm">
              <div className="font-semibold">{symbol}</div>
              <div className="text-slate-500 text-xs">{NSE_FO_DATA[symbol]?.sector ?? 'Unknown'}</div>
            </div>
          )) : <div className="text-slate-500">Add symbols from the dashboard.</div>}
        </div>
      </div>
      <div>
        <h3 className="text-sm uppercase tracking-[0.24em] text-slate-400">Top signals</h3>
        <div className="mt-3 space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {scanResults.map((signal) => (
            <button key={signal.symbol} onClick={() => addToWatchlist(signal.symbol)} className="block w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-left text-sm hover:bg-slate-900 transition-all group">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 group-hover:text-emerald-400">{signal.symbol}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                  signal.signal.includes('BUY') || signal.signal.includes('BULL') ? 'bg-emerald-500/10 text-emerald-400' : 
                  signal.signal.includes('SELL') || signal.signal.includes('BEAR') ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                }`}>
                  {signal.confidence}%
                </span>
              </div>
              <div className="text-slate-500 text-[11px] mt-1 line-clamp-1">{signal.one_liner}</div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-sm uppercase tracking-[0.24em] text-slate-400">NSE Alerts</h3>
        <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950 px-3 py-4 text-sm text-slate-400">
          Live corporate announcements and exchange notices populate here from NSE and BSE feeds. Refresh the news panel in 5 minutes.
        </div>
      </div>
    </aside>
  );
}
