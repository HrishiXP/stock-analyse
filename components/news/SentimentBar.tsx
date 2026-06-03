'use client';
import { NewsItem } from '../../types/signal';

export function SentimentBar({ news }: { news: NewsItem[] }) {
  const positive = news.filter((item) => item.aiSentimentScore > 0.2).length;
  const negative = news.filter((item) => item.aiSentimentScore < -0.2).length;
  const neutral = news.filter((item) => Math.abs(item.aiSentimentScore) <= 0.2).length;
  const total = Math.max(1, news.length);

  const widthClass = (count: number) => {
    const pct = Math.round((count / total) * 100 / 5) * 5;
    return `w-${Math.min(100, Math.max(0, pct))}p`;
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>Sentiment Breakdown</span>
        <span>{positive + negative + neutral} articles</span>
      </div>
      <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-slate-800">
        <div className={`h-full bg-emerald-500 ${widthClass(positive)}`} />
        <div className={`h-full bg-slate-500 ${widthClass(neutral)}`} />
        <div className={`h-full bg-rose-500 ${widthClass(negative)}`} />
      </div>
      <div className="mt-3 flex justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
        <span>Bullish {positive}</span>
        <span>Neutral {neutral}</span>
        <span>Bearish {negative}</span>
      </div>
    </div>
  );
}
