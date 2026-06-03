'use client';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function MarketMoodBanner() {
  const { data, error } = useSWR('/api/mood', fetcher, { refreshInterval: 300000 });
  const mood = data?.data;
  const tone = mood?.overall === 'BULLISH' || mood?.overall === 'VERY_BULLISH' ? 'bg-emerald-900/80 border-emerald-500/40' : mood?.overall === 'BEARISH' || mood?.overall === 'VERY_BEARISH' ? 'bg-rose-900/80 border-rose-500/40' : 'bg-slate-900/80 border-slate-700/40';

  return (
    <section className={`rounded-3xl border px-5 py-4 ${tone}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Market Mood</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-100">{mood?.overall ?? 'NEUTRAL'}</h2>
        </div>
        <div className="space-y-2 text-slate-300">
          <p>{mood?.summary ?? 'Aggregating live news and AI insights...'}</p>
          <div className="flex flex-wrap gap-2 text-xs text-slate-400">
            {(mood?.top_drivers ?? []).slice(0, 3).map((driver: string) => (
              <span key={driver} className="rounded-full border border-slate-700 px-3 py-1">{driver}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
