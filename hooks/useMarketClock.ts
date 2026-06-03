'use client';

import { useEffect, useState } from 'react';

function getISTDate() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

export function useMarketClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(getISTDate());
    const timer = window.setInterval(() => setTime(getISTDate()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return time;
}
