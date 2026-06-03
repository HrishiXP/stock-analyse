'use client';
import { useMarketClock } from '../../hooks/useMarketClock';
import { isMarketOpen, timeToClose } from '../../lib/marketHours';

export function MarketClock() {
  const time = useMarketClock();
  const marketOpen = time ? isMarketOpen(time) : false;
  const closeLabel = time ? timeToClose(time) : 'Loading...';
  return (
    <div className="flex flex-col gap-1 text-left text-slate-200">
      <div className="text-xs uppercase tracking-[0.24em] text-slate-400">IST Clock</div>
      <div className="text-sm font-semibold" suppressHydrationWarning>
        {time ? time.toLocaleTimeString('en-IN', { hour12: false }) : '--:--:--'}
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        <span className={`rounded-full px-2 py-1 ${marketOpen ? 'bg-emerald-600/15 text-emerald-300' : 'bg-slate-700/30 text-slate-300'}`}>
          {marketOpen ? 'OPEN' : 'CLOSED'}
        </span>
        <span className="rounded-full bg-slate-700/30 px-2 py-1">{time ? closeLabel : 'Loading...'}</span>
      </div>
    </div>
  );
}
