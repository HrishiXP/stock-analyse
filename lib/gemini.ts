import 'server-only';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FOSignal, MarketMood, NewsItem, QuickSignal } from '../types/signal';
import { getSentimentLabel, keywordSentiment } from './sentimentEngine';
import { NSE_FO_DATA } from './nseSymbols';

const SYSTEM_PREFIX = `You are a SEBI-aware quantitative F&O analyst for Indian equity markets with 15+ years experience.
You deeply understand: NSE/BSE microstructure, F&O lot sizes and margin requirements,
weekly/monthly expiry dynamics, India VIX impact on option premiums, FII/DII positioning,
Put-Call Ratio interpretation, open interest analysis, max pain theory, support/resistance levels,
sector rotation, RBI policy impact, global cues (US markets, SGX Nifty, crude oil, dollar index).
Analyze news with institutional-grade rigor. Perform a multi-factor analysis:
1. Technical Context (Trend, S/R, Breakout/Mean Reversion)
2. Quantitative Context (VIX view, expected volatility range)
3. Institutional Sentiment (FII/DII potential bias from headlines)
4. Strategic Fit (Best option strategy for the current regime)
Be concise, factual, and return STRICT JSON. Put any clarifying assumptions into the 'notes' array.`;

export const API_VERSION = 'v1beta';
export const FLASH_MODEL = 'gemini-3.5-flash';
export const PRO_MODEL = 'gemini-2.5-pro';

export async function* generateStreamingSignal(symbol: string, news: NewsItem[]) {
  const metadata = NSE_FO_DATA[symbol] || { sector: 'Unknown', lotSize: 0 };
  const sector = metadata.sector;
  const now = new Date().toISOString();
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });
  const prompt = buildSignalPrompt(symbol, sector, 'UNKNOWN', day, news, metadata.lotSize);
  
  const model = getModel(PRO_MODEL);
  const result = await model.generateContentStream(`${SYSTEM_PREFIX}\n\n${prompt}`);
  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    yield chunkText;
  }
}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');
  return new GoogleGenerativeAI(apiKey);
}

export function getModel(modelName: string) {
  const client = getClient();
  console.log(`[Gemini] Model: ${modelName} | API: ${API_VERSION}`);
  return client.getGenerativeModel({ model: modelName }, { apiVersion: API_VERSION });
}

function createNewsSection(symbol: string, news: NewsItem[]) {
  return news
    .slice(0, 25)
    .map((item, index) => `${index + 1}. [${item.sourceShort}] [${item.publishedAt}] ${item.title} — ${item.description} (aiSentimentScore: ${item.aiSentimentScore.toFixed(2)})`)
    .join('\n');
}

function buildSignalPrompt(symbol: string, sector: string, marketStatus: string, day: string, news: NewsItem[], lotSize?: number) {
  const now = new Date().toISOString();
  const schema = `{
  "symbol": "string",
  "one_liner": "string",
  "signal": "BUY_CALL|BUY_PUT|SELL_CALL|SELL_PUT|BULL_SPREAD|BEAR_SPREAD|STRADDLE|IRON_CONDOR|BUTTERFLY|NEUTRAL|AVOID",
  "confidence": "number (0-100)",
  "conviction": "HIGH|MEDIUM|LOW",
  "timeframe": "string",
  "rationale_summary": "string",
  "one_liner": "string",
  "entry_range": { "min": "number", "max": "number" },
  "target_1": "number",
  "target_2": "number",
  "target_3": "number",
  "stop_loss": "number",
  "trailing_sl": "number",
  "risk_reward_ratio": "string",
  "max_loss_percent": "number",
  "suggested_strike": "string",
  "expiry": "string",
  "option_type": "string",
  "lot_size_note": "string",
  "margin_estimate": "string",
  "key_catalysts": [ { "factor": "string", "impact": "string", "direction": "string" } ],
  "risk_scenarios": [ { "scenario": "string", "probability": "string", "signal_impact": "string" } ],
  "india_vix_forecast": "string",
  "india_vix_view": "string",
  "india_vix_sensitivity": "string",
  "pcr_view": "string",
  "technical_context": "string",
  "global_cues": "string",
  "fii_dii_bias": "string",
  "sector_momentum": "string",
  "news_impact": "string",
  "news_quality_score": "number (0-1)",
  "market_regime": "string",
  "fii_dii_flow_estimate": "BULLISH|BEARISH|NEUTRAL",
  "expected_volatility_range": "string",
  "probability_of_success": "number (0-100)",
  "analytics": {
    "momentum": "number (0-100)",
    "volatility": "number (0-100)",
    "liquidity": "number (0-100)",
    "trend": "number (0-100)",
    "event_risk": "number (0-100)",
    "macro": "number (0-100)"
  },
  "holding_till": "string",
  "position_sizing": "string",
  "strategy_rationale": "Explain why a spread or direct buy was chosen (e.g., 'Selling hedge to offset theta')",
  "direct_buy_alternative": "The single most important CALL or PUT to buy if the user wants to avoid multi-legs/selling.",
  "notes": []
}`;

  return `Symbol: ${symbol} | Sector: ${sector} | Lot Size: ${lotSize ?? 'N/A'} | Current IST: ${now}\nMarket Status: ${marketStatus} | Day: ${day}\n\n=== INSTITUTIONAL NEWS SCAN ===\n${createNewsSection(symbol, news)}\n\n=== OUTPUT SCHEMA ===\n${schema}\n\n=== TASK ===\nAct as a Head of F&O Desk. Analyze news for ${symbol} to generate an advanced F&O execution plan. 
1. Identify primary technical trend from news context.
2. Estimate India VIX impact (High VIX favors selling/spreads).
3. Identify 3 Key Catalysts (e.g., Earnings, FII flow, Support breakout).
4. Provide 3 Risk Scenarios (e.g., Global sell-off, Gap down).
5. Suggest an optimal Multi-leg strategy if appropriate, but ALWAYS include a "Direct Plan" for pure option buyers.
6. Favor directional momentum (BUY_CALL/BUY_PUT) as the primary recommendation for strong trends, as the user prefers direct Buying over Selling/Spreads.
7. Explain clearly in "strategy_rationale" why a certain strike/type was chosen.
8. ALWAYS specify the exact Strike Price with suffix (e.g., '24000 CE' or '23800 PE') in "suggested_strike".
9. If suggesting a spread, ensure the "direct_buy_alternative" contains only the primary LONG leg (e.g., 'Buy 24000 CE').
Return STRICT JSON. No markdown. No headers.`;
}

export async function batchFlashSentiment(items: NewsItem[]) {
  const model = getModel(FLASH_MODEL);
  const batches: NewsItem[][] = [];
  for (let i = 0; i < items.length; i += 10) {
    batches.push(items.slice(i, i + 10));
  }
  const scores: number[] = [];
  for (const batch of batches) {
    const prompt = `Rate each headline's sentiment for F&O trading on a scale of -1.0 to 1.0. Return ONLY a JSON array of numbers in the same order. No explanation. Headlines:\n${batch.map((item) => item.title).join('\n')}`;
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    try {
      const parsed = JSON.parse(text.replace(/^[^\[]*/, '')) as number[];
      scores.push(...parsed.slice(0, batch.length).map((value) => Math.max(-1, Math.min(1, value))));
    } catch {
      scores.push(...batch.map((item) => keywordSentiment(item.title + ' ' + item.description)));
    }
  }
  return scores;
}

export async function generateMarketMoodSummary(allNews: NewsItem[]): Promise<MarketMood> {
  const model = getModel(FLASH_MODEL);
  const text = allNews.slice(0, 20).map((item) => `${item.sourceShort}: ${item.title}`).join('\n');
  const prompt = `Summarize the overall market mood for India F&O from these headlines in one sentence. Return JSON only: {"overall":"VERY_BULLISH|BULLISH|NEUTRAL|BEARISH|VERY_BEARISH","score":number,"summary":"string","top_drivers":["..."],"news_count":number}\n${text}`;
  const response = await model.generateContent(prompt);
  const raw = response.response.text();
  try {
    return JSON.parse(raw.replace(/^[^{]*/, '')) as MarketMood;
  } catch {
    const avg = allNews.reduce((sum, item) => sum + item.aiSentimentScore, 0) / Math.max(allNews.length, 1);
    return {
      overall: avg >= 0.3 ? 'BULLISH' : avg <= -0.3 ? 'BEARISH' : 'NEUTRAL',
      score: avg,
      summary: 'Market mood is derived from recent headline sentiment and short-term flow.',
      top_drivers: allNews.slice(0, 3).map((item) => item.title),
      news_count: allNews.length,
      generated_at: new Date().toISOString(),
    };
  }
}

export async function generateFOSignal(symbol: string, news: NewsItem[]): Promise<FOSignal> {
  const metadata = NSE_FO_DATA[symbol] || { sector: 'Unknown', lotSize: 0 };
  const sector = metadata.sector;
  const marketStatus = 'UNKNOWN';
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });
  const prompt = buildSignalPrompt(symbol, sector, marketStatus, day, news, metadata.lotSize);
  const model = getModel(PRO_MODEL);
  const response = await model.generateContent(`${SYSTEM_PREFIX}\n\n${prompt}`);
  const raw = response.response.text();
  // robust parse and post-processing
  const tryParse = (text: string) => {
    try {
      return JSON.parse(text.replace(/^[^{]*/, ''));
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) return null;
      try {
        return JSON.parse(match[0]);
      } catch {
        return null;
      }
    }
  };

  const parsed = tryParse(raw);
  if (parsed) {
    return postProcessParsedSignal(parsed, symbol, news);
  }

  // fallback: build a more informative fallback using news-derived sentiment
  return buildFallbackSignal(symbol, news, sector);
}

export function postProcessParsedSignal(parsed: any, symbol: string, news: NewsItem[]): FOSignal {
  const avgSentiment = news.reduce((s, n) => s + n.aiSentimentScore, 0) / Math.max(1, news.length);
  const metadata = NSE_FO_DATA[symbol] || { sector: 'Unknown', lotSize: 0 };
  
  const modelConf = typeof parsed.confidence === 'number' ? Math.max(0, Math.min(100, parsed.confidence)) : 50;
  const newsScore = Math.round(((avgSentiment + 1) / 2) * 100);
  const confidence = Math.round(0.6 * modelConf + 0.4 * newsScore);

  const now = new Date().toISOString();
  // Map targets from array or individual fields
  const targets = Array.isArray(parsed.targets) ? parsed.targets : [parsed.target_1, parsed.target_2, parsed.target_3];
  
  const safe: FOSignal = {
    symbol,
    signal: parsed.signal ?? 'NEUTRAL',
    confidence: confidence,
    conviction: parsed.conviction ?? 'LOW',
    timeframe: parsed.timeframe ?? 'INTRADAY',
    entry_range: parsed.entry_range ?? { min: 0, max: 0 },
    target_1: targets[0] ?? 0,
    target_2: targets[1] ?? 0,
    target_3: targets[2] ?? 0,
    stop_loss: parsed.stop_loss ?? 0,
    trailing_sl: parsed.trailing_sl ?? 0,
    risk_reward_ratio: parsed.risk_reward_ratio ?? '1:1',
    max_loss_percent: parsed.max_loss_percent ?? 2,
    suggested_strike: parsed.suggested_strike ?? 'ATM',
    expiry: parsed.expiry ?? 'CURRENT_WEEK',
    option_type: parsed.option_type ?? 'NONE',
    lot_size_note: parsed.lot_size_note ?? (metadata.lotSize ? `Lot size: ${metadata.lotSize}` : `Standard lot size for ${symbol}`),
    margin_estimate: parsed.margin_estimate ?? 'N/A',
    greeks: {
      delta_sensitivity: parsed.greeks?.delta ?? 'MEDIUM',
      gamma_risk: parsed.greeks?.gamma ?? 'MEDIUM',
      theta_impact: parsed.greeks?.theta ?? 'NEUTRAL',
      vega_bias: parsed.greeks?.vega ?? 'NEUTRAL',
    },
    sentiment_score: avgSentiment,
    sentiment_label: getSentimentLabel(avgSentiment),
    sentiment_breakdown: {
      positive_articles: news.filter((item) => item.aiSentimentScore > 0.2).length,
      negative_articles: news.filter((item) => item.aiSentimentScore < -0.2).length,
      neutral_articles: news.filter((item) => Math.abs(item.aiSentimentScore) <= 0.2).length,
      avg_ai_score: avgSentiment,
    },
    key_catalysts: parsed.key_catalysts ?? [],
    counter_arguments: parsed.counter_arguments ?? [],
    risk_scenarios: parsed.risk_scenarios ?? [],
    technical_context: parsed.technical_context ?? parsed.rationale_summary ?? 'Institutional bias derived from market flow components.',
    global_cues: parsed.global_cues ?? 'Mixed global sentiment with selective local focus.',
    fii_dii_bias: parsed.fii_dii_flow_estimate ?? 'UNKNOWN',
    pcr_view: parsed.pcr_view ?? 'RANGING',
    expected_volatility_range: parsed.expected_volatility_range ?? 'Normal (1-2%)',
    probability_of_success: parsed.probability_of_success ?? Math.round(confidence * 0.85),
    news_impact: parsed.news_impact ?? 'MEDIUM',
    news_quality_score: parsed.news_quality_score ?? 80,
    sector: metadata.sector,
    sector_momentum: parsed.sector_momentum ?? 'NEUTRAL',
    india_vix_sensitivity: parsed.india_vix_sensitivity ?? 'MEDIUM',
    india_vix_view: parsed.india_vix_forecast ?? 'NORMAL',
    market_regime: parsed.market_regime ?? 'TRENDING',
    event_risk: parsed.event_risk ?? { has_event: false, event: '', date: '', impact: '' },
    holding_till: parsed.holding_till ?? 'Next major expiry or trend reversal.',
    position_sizing: parsed.position_sizing_rule ?? parsed.position_sizing ?? 'Conservative 2-3% risk per lot.',
    analytics: parsed.analytics ?? {
      momentum: 50,
      volatility: 50,
      liquidity: 50,
      trend: 50,
      event_risk: 50,
      macro: 50,
    },
    summary: parsed.rationale_summary ?? parsed.summary ?? '',
    one_liner: parsed.one_liner ?? '',
    disclaimer: 'AI-generated. Internal desk use only. Not SEBI advice.',
    generated_at: now,
    news_count_used: news.length,
    model_used: PRO_MODEL,
  };

  return safe;
}

function buildFallbackSignal(symbol: string, news: NewsItem[], sector: string): FOSignal {
  const avgSentiment = news.reduce((s, n) => s + n.aiSentimentScore, 0) / Math.max(1, news.length);
  const confidence = Math.round(((avgSentiment + 1) / 2) * 100 * 0.8 + 20 * 0.2); // bias toward neutral if low news
  return {
    symbol,
    signal: 'NEUTRAL',
    confidence: Math.max(30, Math.min(75, confidence)),
    conviction: 'LOW',
    timeframe: 'INTRADAY',
    entry_range: { min: 0, max: 0 },
    target_1: 0,
    target_2: 0,
    target_3: 0,
    stop_loss: 0,
    trailing_sl: 0,
    risk_reward_ratio: '1:1',
    max_loss_percent: 2,
    suggested_strike: 'ATM',
    expiry: 'CURRENT_WEEK',
    option_type: 'NONE',
    lot_size_note: `Typical lot size for ${symbol} is not available`,
    margin_estimate: 'N/A',
    greeks: { delta_sensitivity: 'MEDIUM', gamma_risk: 'MEDIUM', theta_impact: 'NEUTRAL', vega_bias: 'NEUTRAL' },
    sentiment_score: avgSentiment,
    sentiment_label: getSentimentLabel(avgSentiment),
    sentiment_breakdown: {
      positive_articles: news.filter((item) => item.aiSentimentScore > 0.2).length,
      negative_articles: news.filter((item) => item.aiSentimentScore < -0.2).length,
      neutral_articles: news.filter((item) => Math.abs(item.aiSentimentScore) <= 0.2).length,
      avg_ai_score: avgSentiment,
    },
    key_catalysts: [],
    counter_arguments: [],
    risk_scenarios: [],
    technical_context: 'Insufficient technical context from news.',
    global_cues: 'No explicit global cues detected.',
    fii_dii_bias: 'UNKNOWN',
    pcr_view: 'UNKNOWN',
    news_impact: 'MEDIUM',
    news_quality_score: 50,
    sector,
    sector_momentum: 'SIDEWAYS',
    india_vix_sensitivity: 'MEDIUM',
    india_vix_view: 'NORMAL',
    market_regime: 'RANGING',
    event_risk: { has_event: false, event: '', date: '', impact: '' },
    holding_till: 'Exit before Thursday 3PM expiry',
    position_sizing: 'Max 2% of capital. 1 lot only if high VIX.',
    summary: 'AI fallback returned a conservative neutral signal due to parse failure.',
    one_liner: 'Neutral F&O view due to insufficient structured output from the AI model.',
    disclaimer: 'AI-generated. Not SEBI advice. F&O carries unlimited loss risk.',
    generated_at: new Date().toISOString(),
    news_count_used: news.length,
    model_used: 'fallback',
  };
}

export async function generateBatchQuickSignals(symbols: string[]): Promise<QuickSignal[]> {
  const model = getModel(FLASH_MODEL);
  const batches: string[][] = [];
  for (let i = 0; i < symbols.length; i += 9) {
    batches.push(symbols.slice(i, i + 9));
  }
  const results: QuickSignal[] = [];
  for (const batch of batches) {
    const prompt = `For each symbol in this list, provide a compact quick F&O signal, confidence 0-100, and one-liner. Return JSON array of objects: {"symbol":"","signal":"BUY_CALL|BUY_PUT|SELL_CALL|SELL_PUT|BULL_SPREAD|BEAR_SPREAD|STRADDLE|NEUTRAL|AVOID","confidence":0,"one_liner":""}. Symbols:\n${batch.join(', ')}`;
    const response = await model.generateContent(prompt);
    const raw = response.response.text();
    try {
      const parsed = JSON.parse(raw.replace(/^[^\[]*/, '')) as Array<{ symbol: string; signal: string; confidence: number; one_liner: string }>;
      results.push(...parsed.map((item) => ({
        symbol: item.symbol,
        signal: item.signal,
        confidence: Math.max(0, Math.min(100, item.confidence ?? 0)),
        one_liner: item.one_liner ?? '',
        opportunity_score: 0,
        sector: 'Unknown',
      })));
    } catch {
      results.push(...batch.map((symbol) => ({
        symbol,
        signal: 'NEUTRAL',
        confidence: 45,
        one_liner: 'Limited data quick scan indicates neutral bias.',
        opportunity_score: 0,
        sector: 'Unknown',
      })));
    }
  }
  return results;
}

