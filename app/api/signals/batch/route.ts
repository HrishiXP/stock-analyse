import { NextResponse } from 'next/server';
import { generateBatchQuickSignals } from '../../../../lib/gemini';
import { batchCache } from '../../../../lib/cache';
import { checkRateLimit } from '../../../../lib/rateLimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  const rate = checkRateLimit('/api/signals/batch', ip);
  if (!rate.allowed) {
    return NextResponse.json({ success: false, error: 'Rate limited', retryAfter: rate.retryAfter }, { status: 429 });
  }
  try {
    const body = await req.json();
    const symbols = Array.isArray(body.symbols) ? body.symbols.map((s) => String(s).toUpperCase()) : [];
    const cacheKey = `batch:${symbols.join(',')}`;
    const cached = batchCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ success: true, data: cached, error: null, meta: { cached: true, generatedAt: new Date().toISOString() } });
    }
    const results = await generateBatchQuickSignals(symbols);
    batchCache.set(cacheKey, results, 15 * 60);
    return NextResponse.json({ success: true, data: results, error: null, meta: { cached: false, generatedAt: new Date().toISOString() } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error), meta: { cached: false, generatedAt: new Date().toISOString() } }, { status: 500 });
  }
}
