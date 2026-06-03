import { NextResponse } from 'next/server';
import { aggregateNews } from '../../../lib/newsAggregator';
import { newsCache } from '../../../lib/cache';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') ?? 'NIFTY').toUpperCase();
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  const rate = checkRateLimit('/api/signals', ip);
  if (!rate.allowed) {
    return NextResponse.json({ success: false, error: 'Rate limited', retryAfter: rate.retryAfter }, { status: 429 });
  }
  const cacheKey = `news:${symbol}`;
  const cached = newsCache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ success: true, data: cached, error: null, meta: { cached: true, newsCount: cached.length, generatedAt: new Date().toISOString() } });
  }
  try {
    const items = await aggregateNews(symbol);
    newsCache.set(cacheKey, items, 5 * 60);
    return NextResponse.json({ success: true, data: items, error: null, meta: { cached: false, newsCount: items.length, generatedAt: new Date().toISOString() } });
  } catch (error) {
    console.error(`[API/News] Error:`, error);
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json({ 
      success: false, 
      error: isDev ? String(error) : 'Failed to fetch news', 
      meta: { cached: false, newsCount: 0, generatedAt: new Date().toISOString() } 
    }, { status: 500 });
  }
}
