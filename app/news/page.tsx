'use client';

import { useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { NewsWall } from '../../components/news/NewsWall';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewsPage() {
  const [sourceFilter, setSourceFilter] = useState('All');
  const { data } = useSWR('/api/mood', fetcher, { refreshInterval: 300000 });
  const mood = data?.data;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-3xl border border-slate-800 bg-slate-900/95 p-6">
          <h1 className="text-3xl font-semibold text-slate-100">Aggregated News Wall</h1>
          <p className="mt-2 text-slate-400">15+ Indian market sources, sentiment scoring, and AI market summary in one place.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button onClick={() => setSourceFilter('All')} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm">All</button>
            <button onClick={() => setSourceFilter('Bullish')} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm">Bullish</button>
            <button onClick={() => setSourceFilter('Bearish')} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm">Bearish</button>
            <button onClick={() => setSourceFilter('Neutral')} className="rounded-2xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm">Neutral</button>
          </div>
          <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-200">
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Market summary</div>
            <div className="mt-2 text-lg font-semibold text-slate-100">{mood?.summary ?? 'AI market summary will appear once the mood endpoint populates.'}</div>
            <div className="mt-2 text-sm text-slate-400">Mood: {mood?.overall ?? 'NEUTRAL'} | Score: {(mood?.score ?? 0).toFixed(2)}</div>
          </div>
        </div>
        <NewsWall symbol="NIFTY" />
      </main>
    </div>
  );
}
