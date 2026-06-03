import { NextResponse } from 'next/server';
import { aggregateNews } from '../../../../lib/newsAggregator';
import { analyzeMultiTimeframe } from '../../../../lib/multiTimeframe';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const symbol = (url.searchParams.get('symbol') ?? 'NIFTY').toUpperCase();
  
  try {
    const news = await aggregateNews(symbol);
    const convergence = await analyzeMultiTimeframe(symbol, news);
    return NextResponse.json({ success: true, data: convergence });
  } catch (error) {
    console.error(`[API/Convergence] Error:`, error);
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json({ 
      success: false, 
      error: isDev ? String(error) : 'Analysis failed' 
    }, { status: 500 });
  }
}
