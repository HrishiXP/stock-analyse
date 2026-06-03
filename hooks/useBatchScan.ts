'use client';

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useBatchScan() {
  const { data, error, isLoading, mutate } = useSWR('/api/scan', fetcher, { refreshInterval: 15 * 60 * 1000 });
  return {
    scan: data?.data ?? [],
    error: error ? String(error) : null,
    isLoading: isLoading,
    refresh: mutate,
  };
}
