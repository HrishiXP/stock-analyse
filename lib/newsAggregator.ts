import { XMLParser } from 'fast-xml-parser';
import { batchFlashSentiment } from './gemini';
import { dedupeAndScoreNews } from './newsDedup';
import { normalizeNewsItem } from './sentimentEngine';
import { NewsItem } from '../types/signal';
import { NSE_FO_DATA } from './nseSymbols';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

const sources = [
  { name: 'Moneycontrol Markets', url: 'https://www.moneycontrol.com/rss/marketreports.xml', type: 'rss', short: 'MC' },
  { name: 'Economic Times Markets', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', type: 'rss', short: 'ET' },
  { name: 'ET Stocks', url: 'https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms', type: 'rss', short: 'ET' },
  { name: 'Business Standard Mkt', url: 'https://www.business-standard.com/rss/markets-106.rss', type: 'rss', short: 'BS' },
  { name: 'Livemint Markets', url: 'https://www.livemint.com/rss/markets', type: 'rss', short: 'LM' },
  { name: 'NDTV Profit', url: 'https://feeds.feedburner.com/ndtvprofit-latest', type: 'rss', short: 'NDTV' },
  { name: 'Financial Express Mkt', url: 'https://www.financialexpress.com/market/feed/', type: 'rss', short: 'FE' },
  { name: 'The Hindu BusinessLine', url: 'https://www.thehindubusinessline.com/markets/feeder/default.rss', type: 'rss', short: 'BL' },
  { name: 'Zee Business', url: 'https://www.zeebiz.com/rss/market.xml', type: 'rss', short: 'ZB' },
  { name: 'CNBC TV18 Markets', url: 'https://www.cnbctv18.com/commonfeeds/v1/eng/rss/market.xml', type: 'rss', short: 'CNBC' },
  { name: 'Yahoo Finance News', url: 'https://query1.finance.yahoo.com/v1/finance/search?q={{symbol}}&newsCount=10&enableFuzzyQuery=false', type: 'json', short: 'YF' },
  { name: 'Alpha Vantage News', url: 'https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=NSE:{{symbol}}&apikey=demo', type: 'json', short: 'AV' },
  { name: 'Stooq Stock News', url: 'https://stooq.com/q/n/?s={{symbol}}.ns', type: 'html', short: 'STQ' },
  { name: 'NSE India Announcements', url: 'https://www.nseindia.com/api/corporate-announcements?index=equities', type: 'json', short: 'NSE' },
  { name: 'BSE Corporate Actions', url: 'https://api.bseindia.com/BseIndiaAPI/api/AnnSubCategoryGetData/w?strCat=-1&strType=C&strScrip=&strSector=&strAnnType=&strStartDt=&strEndDt=&offset=0&pageSize=20', type: 'json', short: 'BSE' },
];

function parseDate(value: string | number | null) {
  if (!value) return new Date();
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

function normalizeRssItem(item: any, source: { name: string; short: string }): NewsItem {
  const title = String(item.title ?? item['title'] ?? '');
  const url = String(item.link ?? item['link'] ?? item['guid'] ?? '');
  const description = String(item.description ?? item['description'] ?? item['summary'] ?? '');
  const publishedAt = new Date(String(item.pubDate ?? item['pubDate'] ?? item['published'] ?? item['dc:date'] ?? new Date().toISOString())).toISOString();
  return {
    id: `${source.short}-${title.slice(0, 40)}-${publishedAt}`,
    title,
    description,
    url,
    publishedAt,
    source: source.name,
    sourceShort: source.short,
    sentiment: 'neutral',
    aiSentimentScore: 0,
    relevanceScore: 0,
  };
}

async function fetchSource(symbol: string, source: { name: string; url: string; type: string; short: string }) {
  try {
    const resolvedUrl = source.url.replace(/\{\{symbol\}\}/g, symbol);
    const init: RequestInit = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Encoding': 'gzip, deflate',
        'Accept': 'application/json, text/plain, */*',
      },
    };
    const response = await fetchWithTimeout(resolvedUrl, init);
    if (!response.ok) {
      if (response.status === 400 || response.status === 403) return [];
      throw new Error(`HTTP ${response.status}`);
    }
    if (source.type === 'rss') {
      const text = await response.text();
      if (!text || text.trim().startsWith('<')) {
        if (text.includes('<!DOCTYPE') || text.includes('<html')) return [];
      }
      try {
        const parsed = parser.parse(text);
        const items = parsed.rss?.channel?.item ?? parsed.feed?.entry ?? [];
        const list = Array.isArray(items) ? items : items ? [items] : [];
        return list.filter((item: any) => item && item.title).map((item: any) => normalizeRssItem(item, source));
      } catch (parseError) {
        return [];
      }
    }
    if (source.type === 'html') {
      const text = await response.text();
      const regex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
      const entries: NewsItem[] = [];
      let match;
      while (entries.length < 8 && (match = regex.exec(text))) {
        entries.push({
          id: `${source.short}-${match[2].slice(0, 30)}`,
          title: match[2],
          description: '',
          url: match[1],
          publishedAt: new Date().toISOString(),
          source: source.name,
          sourceShort: source.short,
          sentiment: 'neutral',
          aiSentimentScore: 0,
          relevanceScore: 0,
        });
      }
      return entries;
    }
    let json: any;
    try {
      json = await response.json();
    } catch (jsonError) {
      return [];
    }
    if (source.name.includes('Yahoo')) {
      return (json.news ?? []).slice(0, 10).map((item: any) => ({
        id: `YF-${item.uuid ?? item.link ?? item.title}`,
        title: item.title ?? '',
        description: item.summary ?? item.summaryText ?? '',
        url: item.link ?? '',
        publishedAt: new Date((item.providerPublishTime ?? 0) * 1000 || Date.now()).toISOString(),
        source: source.name,
        sourceShort: source.short,
        sentiment: 'neutral',
        aiSentimentScore: 0,
        relevanceScore: 0,
      }));
    }
    if (source.name.includes('Alpha Vantage')) {
      return (json.feed ?? []).slice(0, 8).map((item: any) => ({
        id: `AV-${item.id ?? item.title}`,
        title: item.title ?? '',
        description: item.summary ?? item.content ?? '',
        url: item.url ?? '',
        publishedAt: new Date(item.time_published ? new Date(item.time_published).getTime() : Date.now()).toISOString(),
        source: source.name,
        sourceShort: source.short,
        sentiment: 'neutral',
        aiSentimentScore: 0,
        relevanceScore: 0,
      }));
    }
    if (source.name.includes('NSE India Announcements')) {
      const announcements = json.data ?? [];
      return announcements.slice(0, 10).map((item: any) => ({
        id: `NSE-${item.annDate ?? item.announcementId ?? item.url}`,
        title: item.announcementTitle ?? item.title ?? '',
        description: item.announcementDetail ?? item.announcementText ?? '',
        url: item.announcementUrl ?? '',
        publishedAt: new Date(item.announcementDate ?? Date.now()).toISOString(),
        source: source.name,
        sourceShort: source.short,
        sentiment: 'neutral',
        aiSentimentScore: 0,
        relevanceScore: 0,
      }));
    }
    if (source.name.includes('BSE Corporate Actions')) {
      const announcements = json.Table ?? [];
      return announcements.slice(0, 10).map((item: any) => ({
        id: `BSE-${item.SCRIP_CD ?? item.ROWNO}`,
        title: item.ANN_DT ?? item.ANNC_TP ?? 'BSE corporate action',
        description: item.ANN_TITL ?? item.DETAILS ?? '',
        url: item.LINK ?? 'https://www.bseindia.com',
        publishedAt: new Date(item.ANN_DATE ?? Date.now()).toISOString(),
        source: source.name,
        sourceShort: source.short,
        sentiment: 'neutral',
        aiSentimentScore: 0,
        relevanceScore: 0,
      }));
    }
    return [];
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('AbortError')) {
      // Suppress timeout and network errors from logs, only log significant failures
    }
    return [];
  }
}

export async function aggregateNews(symbol: string): Promise<NewsItem[]> {
  try {
    const sector = NSE_FO_DATA[symbol]?.sector ?? 'Market';
    const all = await Promise.allSettled(sources.map((source) => fetchSource(symbol, source)));
    const items = all.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
    const recent = items.filter((item) => {
      const published = parseDate(item.publishedAt).getTime();
      return Date.now() - published <= 72 * 3600 * 1000;
    });
    const scored = dedupeAndScoreNews(recent, symbol, sector).slice(0, 25);
    if (scored.length === 0) {
      return [
        {
          id: 'placeholder-1',
          title: 'Markets are quiet. Limited news for this symbol.',
          description: 'Consider using technical analysis or market breadth indicators.',
          url: '',
          publishedAt: new Date().toISOString(),
          source: 'System',
          sourceShort: 'SYS',
          sentiment: 'neutral',
          aiSentimentScore: 0,
          relevanceScore: 0,
        },
      ];
    }
    const sentimentScores = await batchFlashSentiment(scored);
    return scored.map((item, index) => normalizeNewsItem({
      ...item,
      aiSentimentScore: sentimentScores[index] ?? 0,
    }));
  } catch (error) {
    return [
      {
        id: 'error-fallback',
        title: 'News aggregation temporarily unavailable',
        description: 'Please try again in a few moments.',
        url: '',
        publishedAt: new Date().toISOString(),
        source: 'System',
        sourceShort: 'SYS',
        sentiment: 'neutral',
        aiSentimentScore: 0,
        relevanceScore: 0,
      },
    ];
  }
}
