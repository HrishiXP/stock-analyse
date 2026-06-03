'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { FOSignal, NewsItem } from '../types/signal';

interface SignalStreamState {
  streamingText: string;
  signal: FOSignal | null;
  news: NewsItem[];
  isStreaming: boolean;
  error: string | null;
  connectionState?: 'idle' | 'connecting' | 'connected' | 'failed' | 'closed';
  manualReconnect?: () => void;
  start: (symbol: string, refresh?: boolean) => void;
  stop: () => void;
}

export function useSignalStream(symbol: string | null): SignalStreamState {
  const [streamingText, setStreamingText] = useState('');
  const [signal, setSignal] = useState<FOSignal | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'connected' | 'failed' | 'closed'>('idle');
  const { finalizeSignal } = useAppStore();

  // Internal refs/state for reconnection
  const esRef = useRef<EventSource | null>(null);
  const attemptsRef = useRef(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetIdle = () => {
    lastActivityRef.current = Date.now();
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current as any);
      idleTimerRef.current = null;
    }
  };

  const manualReconnect = () => {
    if (symbol) start(symbol, false);
  };

  const start = (selectedSymbol: string, refresh = false) => {
    if (!selectedSymbol) return;
    // reset state
    setStreamingText('');
    setSignal(null);
    setNews([]);
    setError(null);
    setIsStreaming(true);
    setConnectionState('connecting');
    attemptsRef.current = 0;

    const connect = () => {
      attemptsRef.current += 1;
      setConnectionState('connecting');
      const url = `/api/signals/stream?symbol=${encodeURIComponent(selectedSymbol)}&refresh=${refresh ? 'true' : 'false'}`;
      try {
        esRef.current = new EventSource(url);
      } catch (err) {
        setError(String(err));
        setIsStreaming(false);
        setConnectionState('failed');
        return;
      }

      const currentEs = esRef.current;

      currentEs.onopen = () => {
        setConnectionState('connected');
        resetIdle();
      };

      currentEs.onmessage = (event) => {
        resetIdle();
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'token') {
            setStreamingText((prev) => prev + payload.content);
          }
          if (payload.type === 'news') {
            setNews(payload.items);
          }
          if (payload.type === 'done') {
            setIsStreaming(false);
            setConnectionState('closed');
            try {
              const parsed = payload.signal as FOSignal;
              setSignal(parsed);
              finalizeSignal(parsed);
            } catch {
              setError('Unable to parse final signal.');
            }
            try {
              currentEs.close();
            } catch {}
          }
          if (payload.type === 'error') {
            setError(payload.message);
            setIsStreaming(false);
            setConnectionState('failed');
            try {
              currentEs.close();
            } catch {}
          }
        } catch {
          // Non-JSON token, append raw
          setStreamingText((prev) => prev + event.data);
        }
      };

      currentEs.onerror = () => {
        // treat as disconnect
        try {
          currentEs.close();
        } catch {}
        const shouldRetry = attemptsRef.current < 5;
        setIsStreaming(false);
        setConnectionState(shouldRetry ? 'connecting' : 'failed');
        setError(shouldRetry ? null : 'Signal stream disconnected.');
        if (shouldRetry) {
          const backoff = Math.min(16000, 1000 * Math.pow(2, attemptsRef.current - 1));
          setTimeout(() => {
            connect();
          }, backoff);
        }
      };

      // idle detection: if no activity in 30s, close and retry
      resetIdle();
      idleTimerRef.current = setTimeout(function checkIdle() {
        const idle = Date.now() - lastActivityRef.current;
        if (idle > 30000) {
          try {
            esRef.current?.close();
          } catch {}
          setConnectionState('connecting');
          if (attemptsRef.current < 5) {
            const backoff = Math.min(16000, 1000 * Math.pow(2, attemptsRef.current - 1));
            setTimeout(() => connect(), backoff);
          } else {
            setConnectionState('failed');
            setError('Stream idle for too long; connection closed.');
          }
        } else {
          idleTimerRef.current = setTimeout(checkIdle, 5000);
        }
      }, 5000);
    };

    connect();
  };

  const stop = () => {
    setIsStreaming(false);
    setConnectionState('closed');
    try {
      esRef.current?.close();
    } catch {}
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current as any);
  };

  useEffect(() => {
    return () => {
      setIsStreaming(false);
      setConnectionState('closed');
      try {
        esRef.current?.close();
      } catch {}
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current as any);
    };
  }, []);

  return useMemo(
    () => ({ streamingText, signal, news, isStreaming, error, start, stop, connectionState, manualReconnect }),
    [streamingText, signal, news, isStreaming, error, connectionState]
  );
}
