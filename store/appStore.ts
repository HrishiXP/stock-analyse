import { create } from 'zustand';
import { FOSignal, MarketMood, MultiTimeframeSignal, NewsItem, QuickSignal } from '../types/signal';

interface AppState {
  currentSignal: FOSignal | null;
  multiSignal: MultiTimeframeSignal | null;
  streamingText: string;
  isStreaming: boolean;
  signals: Record<string, FOSignal>;
  watchlist: string[];
  scanResults: QuickSignal[];
  marketMood: MarketMood | null;
  selectedSymbol: string;
  currentNews: NewsItem[];
  isLoadingNews: boolean;
  error: string | null;
  setStreamingText: (chunk: string) => void;
  finalizeSignal: (signal: FOSignal) => void;
  setMultiSignal: (signal: MultiTimeframeSignal | null) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setScanResults: (results: QuickSignal[]) => void;
  setMarketMood: (mood: MarketMood) => void;
  setSelectedSymbol: (symbol: string) => void;
  setCurrentNews: (news: NewsItem[]) => void;
  setLoadingNews: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSignal: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentSignal: null,
  multiSignal: null,
  streamingText: '',
  isStreaming: false,
  signals: {},
  watchlist: [],
  scanResults: [],
  marketMood: null,
  selectedSymbol: 'NIFTY',
  currentNews: [],
  isLoadingNews: false,
  error: null,
  setStreamingText: (chunk) => set((state) => ({ streamingText: state.streamingText + chunk })),
  finalizeSignal: (signal) => set((state) => ({ currentSignal: signal, signals: { ...state.signals, [signal.symbol]: signal }, isStreaming: false })),
  setMultiSignal: (signal) => set({ multiSignal: signal }),
  addToWatchlist: (symbol) => set((state) => ({ watchlist: Array.from(new Set([...state.watchlist, symbol])) })),
  removeFromWatchlist: (symbol) => set((state) => ({ watchlist: state.watchlist.filter((item) => item !== symbol) })),
  setScanResults: (results) => set({ scanResults: results }),
  setMarketMood: (mood) => set({ marketMood: mood }),
  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),
  setCurrentNews: (news) => set({ currentNews: news }),
  setLoadingNews: (loading) => set({ isLoadingNews: loading }),
  setError: (error) => set({ error }),
  clearSignal: () => set({ currentSignal: null, multiSignal: null, streamingText: '', error: null }),
}));
