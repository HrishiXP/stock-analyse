import { NewsItem } from '../types/signal';

const sectorKeywords: Record<string, string[]> = {
  Energy: ['oil', 'energy', 'fuel', 'petrol', 'gas', 'refinery'],
  IT: ['software', 'tech', 'information technology', 'digital', 'IT', 'tech'],
  Banking: ['bank', 'lending', 'NPA', 'repo rate', 'credit'],
  NBFC: ['finance company', 'NBFC', 'loan'],
  Auto: ['auto', 'vehicle', 'car', 'EV', 'wheel'],
  Pharma: ['pharma', 'healthcare', 'drug', 'vaccine'],
  Power: ['power', 'electricity', 'grid', 'renewable'],
  Metals: ['steel', 'metal', 'aluminium', 'mining', 'ore'],
  Cement: ['cement', 'construction', 'building material'],
  Consumer: ['consumer', 'retail', 'demand'],
  FMCG: ['FMCG', 'consumer goods', 'packaged'],
  Telecom: ['telecom', 'mobile', 'broadband', 'network'],
  Paints: ['paint', 'coating', 'decor'],
  Ports: ['port', 'shipping', 'cargo'],
  Mining: ['mining', 'coal', 'commodity'],
  Conglomerate: ['group', 'conglomerate', 'diversified'],
  Healthcare: ['hospital', 'healthcare', 'medical'],
};

export function dedupeAndScoreNews(items: NewsItem[], symbol: string, sector: string) {
  const seen = new Set<string>();
  const cleaned: NewsItem[] = [];

  for (const item of items) {
    const key = item.title.slice(0, 80).toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const text = `${item.title} ${item.description}`.toLowerCase();
    let score = 0;
    if (text.includes(symbol.toLowerCase())) score += 10;
    const sectorPatterns = sectorKeywords[sector] ?? [];
    if (sectorPatterns.some((term) => text.includes(term.toLowerCase()))) score += 5;
    if (/market|indices|Nifty|Sensex|FII|DII|RBI|inflation|policy|global/.test(text)) score += 2;
    item.relevanceScore = score;
    item.symbol = symbol;
    cleaned.push(item);
  }

  return cleaned.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
}

export function classifySentiment(score: number) {
  if (score >= 0.5) return 'positive';
  if (score <= -0.5) return 'negative';
  return 'neutral';
}

export function aggregateSentiment(items: NewsItem[]) {
  const positive_articles = items.filter((item) => item.sentiment === 'positive').length;
  const negative_articles = items.filter((item) => item.sentiment === 'negative').length;
  const neutral_articles = items.filter((item) => item.sentiment === 'neutral').length;
  const avg_ai_score = items.reduce((acc, item) => acc + item.aiSentimentScore, 0) / Math.max(items.length, 1);
  return { positive_articles, negative_articles, neutral_articles, avg_ai_score };
}
