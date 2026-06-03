import { batchCache } from './cache';
import { generateBatchQuickSignals } from './gemini';
import { NSE_FO_DATA, FNO_SYMBOLS } from './nseSymbols';
import { QuickSignal } from '../types/signal';

export async function scanTopOpportunities(): Promise<QuickSignal[]> {
  const cacheKey = 'top-opportunities';
  const cached = batchCache.get(cacheKey) as QuickSignal[] | null;
  if (cached) return cached;

  const quickSignals = await generateBatchQuickSignals(FNO_SYMBOLS);
  const ranked = quickSignals.map((signal) => {
    const sentiment = Math.abs(signal.confidence / 100 - 0.5) * 2;
    const opportunity_score = Math.round((signal.confidence * 0.4) + (sentiment * 20 * 0.2) + 10);
    return {
      ...signal,
      opportunity_score: Math.min(100, Math.max(0, opportunity_score)),
      sector: NSE_FO_DATA[signal.symbol]?.sector ?? 'Unknown',
    };
  });
  const top15 = ranked.sort((a, b) => b.opportunity_score - a.opportunity_score).slice(0, 15);
  batchCache.set(cacheKey, top15, 15 * 60);
  return top15;
}
