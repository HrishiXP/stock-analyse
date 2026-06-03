'use client';
import { useEffect } from 'react';
import useSWR from 'swr';
import { NewsCard } from './NewsCard';
import { SentimentBar } from './SentimentBar';
import { useAppStore } from '../../store/appStore';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function NewsWall({ symbol }: { symbol: string }) {
  const { data, error } = useSWR(`/api/news?symbol=${encodeURIComponent(symbol)}`, fetcher, { refreshInterval: 300000 });
  const setCurrentNews = useAppStore((state) => state.setCurrentNews);
  const news = data?.data ?? [];

  useEffect(() => {
    if (news.length) setCurrentNews(news);
  }, [news, setCurrentNews]);

  return (
    <section className="space-y-4">
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm uppercase tracking-[0.24em] text-slate-400">Live News Wall</div>
            <div className="mt-2 text-2xl font-semibold text-slate-100">{symbol}</div>
          </div>
          <div className="text-slate-500 text-sm">{news.length} articles</div>
        </div>
        <div className="mt-5">
          <SentimentBar news={news} />
        </div>
      </div>
      <div className="grid gap-4">
        {(news.slice(0, 15)).map((item: any) => <NewsCard key={item.id} item={item} />)}
      </div>
      {error ? <div className="rounded-3xl border border-rose-800 bg-rose-950/50 p-4 text-slate-100">Unable to load news.</div> : null}
    </section>
  );
}
