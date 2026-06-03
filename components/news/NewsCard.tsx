'use client';
import { NewsItem } from '../../types/signal';
import { SourceBadge } from './SourceBadge';

export function NewsCard({ item }: { item: NewsItem }) {
  const date = new Date(item.publishedAt).toLocaleString('en-IN', { hour12: false });
  const scoreColor = item.aiSentimentScore >= 0.3 ? 'bg-emerald-500' : item.aiSentimentScore <= -0.3 ? 'bg-rose-500' : 'bg-slate-500';

  return (
    <article className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-xl shadow-slate-950/20">
      <div className="flex items-center justify-between gap-3">
        <SourceBadge label={item.sourceShort} />
        <span className="text-xs text-slate-500">{date}</span>
      </div>
      <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 block text-lg font-semibold text-slate-100 hover:text-white">
        {item.title}
      </a>
      <p className="mt-3 text-sm leading-6 text-slate-400">{item.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${scoreColor} text-white/90`}>Sentiment: {item.aiSentimentScore.toFixed(2)}</span>
        <span className="uppercase text-slate-500">Score {item.relevanceScore}</span>
      </div>
    </article>
  );
}
