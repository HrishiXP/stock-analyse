import { NextResponse } from 'next/server';
import { scanTopOpportunities } from '../../../lib/scanner';
import { checkRateLimit } from '../../../lib/rateLimit';

export async function GET(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'local';
  const rate = checkRateLimit('/api/scan', ip);
  if (!rate.allowed) {
    return NextResponse.json({ success: false, error: 'Rate limited', retryAfter: rate.retryAfter }, { status: 429 });
  }
  try {
    const results = await scanTopOpportunities();
    return NextResponse.json({ success: true, data: results, error: null, meta: { cached: false, generatedAt: new Date().toISOString() } });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error), meta: { cached: false, generatedAt: new Date().toISOString() } }, { status: 500 });
  }
}
