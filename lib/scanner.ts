import { batchCache } from './cache';
import { generateBatchQuickSignals } from './gemini';
import { NSE_FO_DATA, FNO_SYMBOLS } from './nseSymbols';
import { QuickSignal } from '../types/signal';
import { aggregateNews } from './newsAggregator';

export async function scanTopOpportunities(): Promise<QuickSignal[]> {
  const cacheKey = 'top-opportunities';
  const cached = batchCache.get(cacheKey) as QuickSignal[] | null;
  if (cached) return cached;

  // Get current market context by looking at NIFTY news density
  const contextNews = await aggregateNews('NIFTY');
  const marketBias = contextNews.length > 20 ? 'High Volatility' : 'Normal';

  const quickSignals = await generateBatchQuickSignals(FNO_SYMBOLS);
  const ranked = quickSignals.map((signal) => {
    const sector = NSE_FO_DATA[signal.symbol]?.sector ?? 'Unknown';
    const volume_bonus = signal.one_liner.toLowerCase().includes('volume') ? 10 : 0;
    const confidence_score = signal.confidence * 0.6;
    const sentiment_bias = Math.abs(signal.confidence - 50) * 0.4;
    
    const opportunity_score = Math.round(confidence_score + sentiment_bias + volume_bonus);
    
    return {
      ...signal,
      opportunity_score: Math.min(100, Math.max(0, opportunity_score)),
      sector,
    };
  });
  const top15 = ranked.sort((a, b) => b.opportunity_score - a.opportunity_score).slice(0, 15);
  batchCache.set(cacheKey, top15, 15 * 60);
  return top15;
}
