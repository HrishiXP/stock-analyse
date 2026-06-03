import 'server-only';
import { NewsItem, MultiTimeframeSignal, QuickSignal } from '../types/signal';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FNO_SYMBOLS } from './nseSymbols';

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

async function analyzeLens(symbol: string, news: NewsItem[], label: string, lens: string): Promise<QuickSignal> {
  const prompt = `Analyze ${symbol} for ${lens} F&O trading based on recent news. Return JSON only: {"symbol":"${symbol}","signal":"BUY_CALL|BUY_PUT|SELL_CALL|SELL_PUT|BULL_SPREAD|BEAR_SPREAD|STRADDLE|NEUTRAL|AVOID","confidence":0,"one_liner":""}`;
  try {
    const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent(prompt);
    const raw = response.response.text();
    const parsed = JSON.parse(raw.replace(/^[^\{]*/, '')) as QuickSignal;
    return { ...parsed, opportunity_score: 0, sector: 'Unknown' };
  } catch {
    return {
      symbol,
      signal: 'NEUTRAL',
      confidence: 45,
      one_liner: `${label} view remains neutral after news scan.`,
      opportunity_score: 0,
      sector: 'Unknown',
    };
  }
}

export async function analyzeScalp(symbol: string, news: NewsItem[]): Promise<QuickSignal> {
  return analyzeLens(symbol, news, 'Scalp', '15min–1hr');
}

export async function analyzeSwing(symbol: string, news: NewsItem[]): Promise<QuickSignal> {
  return analyzeLens(symbol, news, 'Swing', '2–5 day');
}

export async function analyzePositional(symbol: string, news: NewsItem[]): Promise<QuickSignal> {
  return analyzeLens(symbol, news, 'Positional', '2–4 week');
}

export async function analyzeMultiTimeframe(symbol: string, news: NewsItem[]): Promise<MultiTimeframeSignal> {
  const [scalp, swing, positional] = await Promise.all([
    analyzeScalp(symbol, news),
    analyzeSwing(symbol, news),
    analyzePositional(symbol, news),
  ]);
  const signals = [scalp.signal, swing.signal, positional.signal];
  const alignment = signals.every((value) => value === 'BUY_CALL' || value === 'BULL_SPREAD')
    ? 'ALIGNED_BULLISH'
    : signals.every((value) => value === 'SELL_CALL' || value === 'BEAR_SPREAD')
    ? 'ALIGNED_BEARISH'
    : signals.includes('NEUTRAL')
    ? 'MIXED'
    : 'CONFLICTED';
  return { scalp, swing, positional, alignment };
}
