export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  sourceShort: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  aiSentimentScore: number;
  relevanceScore: number;
  symbol?: string;
}

export interface FOSignal {
  symbol: string;
  signal: 'BUY_CALL'|'BUY_PUT'|'SELL_CALL'|'SELL_PUT'|'BULL_SPREAD'|'BEAR_SPREAD'|'STRADDLE'|'NEUTRAL'|'AVOID';
  confidence: number;
  conviction: 'HIGH'|'MEDIUM'|'LOW';
  thesis_strength?: 'STRONG'|'MODERATE'|'WEAK';
  timeframe: string;
  entry_range: { min: number; max: number };
  target_1: number;
  target_2: number;
  target_3: number;
  stop_loss: number;
  trailing_sl: number;
  risk_reward_ratio: string;
  max_loss_percent: number;
  suggested_strike: string;
  expiry: string;
  option_type: string;
  lot_size_note: string;
  margin_estimate: string;
  greeks?: { delta_sensitivity: string; gamma_risk: string; theta_impact: string; vega_bias: string };
  sentiment_score: number;
  sentiment_label: string;
  sentiment_breakdown: { positive_articles: number; negative_articles: number; neutral_articles: number; avg_ai_score: number };
  key_catalysts: Array<{ factor: string; impact: string; direction: string }>;
  counter_arguments: string[];
  risk_scenarios: Array<{ scenario: string; probability: string; signal_impact: string }>;
  technical_context: string;
  global_cues: string;
  fii_dii_bias: string;
  pcr_view: string;
  expected_volatility_range?: string;
  probability_of_success?: number;
  news_impact: string;
  news_quality_score: number;
  sector: string;
  sector_momentum: string;
  india_vix_sensitivity: string;
  india_vix_view: string;
  india_vix_forecast?: string;
  market_regime: string;
  event_risk: { has_event: boolean; event: string; date: string; impact: string };
  holding_till: string;
  position_sizing: string;
  strategy_rationale?: string;
  direct_buy_alternative?: string;
  setup_quality?: string;
  entry_trigger?: string;
  confirmation_signals?: string[];
  execution_checklist?: string[];
  invalidation_rule?: string;
  what_changes_my_mind?: string;
  hedge_plan?: string;
  liquidity_note?: string;
  price_structure?: string;
  event_watchlist?: string[];
  analytics?: {
    momentum: number;
    volatility: number;
    liquidity: number;
    trend: number;
    event_risk: number;
    macro: number;
  };
  summary: string;
  one_liner: string;
  disclaimer: string;
  generated_at: string;
  news_count_used: number;
  model_used: string;
}

export interface QuickSignal {
  symbol: string;
  signal: string;
  confidence: number;
  one_liner: string;
  opportunity_score: number;
  sector: string;
}

export interface MultiTimeframeSignal {
  scalp: QuickSignal;
  swing: QuickSignal;
  positional: QuickSignal;
  alignment: 'ALIGNED_BULLISH'|'ALIGNED_BEARISH'|'CONFLICTED'|'MIXED';
}

export interface MarketMood {
  overall: 'VERY_BULLISH'|'BULLISH'|'NEUTRAL'|'BEARISH'|'VERY_BEARISH';
  score: number;
  summary: string;
  top_drivers: string[];
  news_count: number;
  generated_at: string;
}
