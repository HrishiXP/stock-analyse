import { NewsItem } from '../types/signal';

const bullWords = ['up', 'gain', 'strong', 'positive', 'beat', 'record', 'optimistic', 'rise'];
const bearWords = ['down', 'weak', 'decline', 'miss', 'risk', 'sell', 'fall', 'concern', 'pressure'];

export function keywordSentiment(text: string) {
  const lower = text.toLowerCase();
  const score = bullWords.reduce((sum, word) => sum + (lower.includes(word) ? 0.2 : 0), 0) - bearWords.reduce((sum, word) => sum + (lower.includes(word) ? 0.2 : 0), 0);
  return Math.max(-1, Math.min(1, score));
}

export function getSentimentLabel(score: number) {
  if (score >= 0.6) return 'VERY_BULLISH';
  if (score >= 0.2) return 'BULLISH';
  if (score <= -0.6) return 'VERY_BEARISH';
  if (score <= -0.2) return 'BEARISH';
  return 'NEUTRAL';
}

export function normalizeNewsItem(item: NewsItem): NewsItem {
  const score = Math.max(-1, Math.min(1, item.aiSentimentScore ?? keywordSentiment(`${item.title} ${item.description}`)));
  return {
    ...item,
    aiSentimentScore: score,
    sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
  } as NewsItem;
}

export function buildSignalSummary(news: NewsItem[]) {
  const positive = news.filter((item) => item.aiSentimentScore > 0.2).length;
  const negative = news.filter((item) => item.aiSentimentScore < -0.2).length;
  const avg = news.reduce((sum, item) => sum + item.aiSentimentScore, 0) / Math.max(news.length, 1);
  return { positive, negative, avg }; 
}

export function topSources(items: NewsItem[]) {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.sourceShort] = (counts[item.sourceShort] ?? 0) + 1;
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([source]) => source);
}
