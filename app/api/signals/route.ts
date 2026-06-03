import { NextResponse } from 'next/server';
import { aggregateNews } from '../../../lib/newsAggregator';
import { generateFOSignal } from '../../../lib/gemini';
import { signalCache } from '../../../lib/cache';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  const rate = checkRateLimit('/api/signals', ip);
  if (!rate.allowed) {
    return NextResponse.json({ success: false, error: 'Rate limited', retryAfter: rate.retryAfter }, { status: 429 });
  }
  try {
    const body = await req.json();
    const symbol = (String(body.symbol ?? 'NIFTY')).toUpperCase();
    const cacheKey = `signal:${symbol}`;
    const cached = signalCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, error: null, meta: { cached: true, generatedAt: new Date().toISOString() } });
    }
    const news = await aggregateNews(symbol);
    const signal = await generateFOSignal(symbol, news);
    signalCache.set(cacheKey, signal, 20 * 60);
    return NextResponse.json({ success: true, data: signal, error: null, meta: { cached: false, newsCount: news.length, generatedAt: new Date().toISOString() } });
  } catch (error) {
    console.error(`[API/Signals] Error:`, error);
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json({ 
      success: false, 
      error: isDev ? String(error) : 'Internal Server Error during analysis', 
      meta: { cached: false, generatedAt: new Date().toISOString() } 
    }, { status: 500 });
  }
}
