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
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const completedRef = useRef(false);
  const intentionalCloseRef = useRef(false);
  const introSeenRef = useRef(false);

  const clearTimers = () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current as any);
      idleTimerRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current as any);
      reconnectTimerRef.current = null;
    }
  };

  const closeCurrentStream = () => {
    intentionalCloseRef.current = true;
    try {
      esRef.current?.close();
    } catch {}
    esRef.current = null;
  };

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
    clearTimers();
    closeCurrentStream();
    // reset state
    setStreamingText('');
    setSignal(null);
    setNews([]);
    setError(null);
    setIsStreaming(true);
    setConnectionState('connecting');
    attemptsRef.current = 0;
    completedRef.current = false;
    intentionalCloseRef.current = false;
    introSeenRef.current = false;

    const connect = () => {
      attemptsRef.current += 1;
      setConnectionState('connecting');
      intentionalCloseRef.current = false;
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
        setIsStreaming(true);
        setError(null);
        resetIdle();
      };

      currentEs.onmessage = (event) => {
        resetIdle();
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'token') {
            const content = String(payload.content ?? '');
            const isIntro = content.startsWith('Streaming analysis for');
            if (isIntro && introSeenRef.current) {
              return;
            }
            if (isIntro) introSeenRef.current = true;
            setStreamingText((prev) => prev + payload.content);
          }
          if (payload.type === 'heartbeat') {
            resetIdle();
          }
          if (payload.type === 'news') {
            setNews(payload.items);
          }
          if (payload.type === 'done') {
            setIsStreaming(false);
            setConnectionState('closed');
            completedRef.current = true;
            clearTimers();
            try {
              const parsed = payload.signal as FOSignal;
              setSignal(parsed);
              finalizeSignal(parsed);
            } catch {
              setError('Unable to parse final signal.');
            }
            closeCurrentStream();
          }
          if (payload.type === 'error') {
            completedRef.current = true;
            setError(payload.message);
            setIsStreaming(false);
            setConnectionState('failed');
            clearTimers();
            closeCurrentStream();
          }
        } catch {
          // Non-JSON token, append raw
          setStreamingText((prev) => prev + event.data);
        }
      };

      currentEs.onerror = () => {
        if (completedRef.current || intentionalCloseRef.current || currentEs.readyState === EventSource.CLOSED) {
          clearTimers();
          setIsStreaming(false);
          setConnectionState('closed');
          return;
        }

        closeCurrentStream();
        const shouldRetry = attemptsRef.current < 5;
        setIsStreaming(shouldRetry);
        setConnectionState(shouldRetry ? 'connecting' : 'failed');
        setError(shouldRetry ? null : 'Signal stream disconnected.');
        if (shouldRetry) {
          const backoff = Math.min(16000, 1000 * Math.pow(2, attemptsRef.current - 1));
          reconnectTimerRef.current = setTimeout(() => {
            connect();
          }, backoff);
        } else {
          clearTimers();
        }
      };

      // idle detection: if no activity in 30s, close and retry
      resetIdle();
      idleTimerRef.current = setTimeout(function checkIdle() {
        const idle = Date.now() - lastActivityRef.current;
        if (completedRef.current || intentionalCloseRef.current) {
          clearTimers();
          return;
        }
        if (idle > 90000) {
          closeCurrentStream();
          setConnectionState('connecting');
          if (attemptsRef.current < 5) {
            const backoff = Math.min(16000, 1000 * Math.pow(2, attemptsRef.current - 1));
            reconnectTimerRef.current = setTimeout(() => connect(), backoff);
          } else {
            setConnectionState('failed');
            setIsStreaming(false);
            clearTimers();
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
    completedRef.current = true;
    clearTimers();
    closeCurrentStream();
  };

  useEffect(() => {
    return () => {
      setIsStreaming(false);
      setConnectionState('closed');
      completedRef.current = true;
      clearTimers();
      closeCurrentStream();
    };
  }, []);

  return useMemo(
    () => ({ streamingText, signal, news, isStreaming, error, start, stop, connectionState, manualReconnect }),
    [streamingText, signal, news, isStreaming, error, connectionState]
  );
}
