import { NextResponse } from 'next/server';
import { aggregateNews } from '../../../lib/newsAggregator';
import { generateMarketMoodSummary } from '../../../lib/gemini';
import { newsCache } from '../../../lib/cache';

export async function GET() {
  try {
    const cacheKey = 'market-mood';
    const cached = newsCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, error: null, meta: { cached: true, generatedAt: new Date().toISOString() } });
    }
    const news = await aggregateNews('NIFTY');
    const mood = await generateMarketMoodSummary(news);
    newsCache.set(cacheKey, mood, 5 * 60);
    return NextResponse.json({ success: true, data: mood, error: null, meta: { cached: false, generatedAt: new Date().toISOString() } });
  } catch (error) {
    console.error(`[API/Mood] Error:`, error);
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json({ 
      success: false, 
      error: isDev ? String(error) : 'Failed to generate market mood', 
      meta: { cached: false, generatedAt: new Date().toISOString() } 
    }, { status: 500 });
  }
}
