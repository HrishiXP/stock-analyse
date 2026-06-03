export function getIST(date = new Date()): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

export function isMarketOpen(date?: Date): boolean {
  const now = getIST(date);
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 9 * 60 + 15 && minutes < 15 * 60 + 30;
}

export function isPreMarket(date?: Date): boolean {
  const now = getIST(date);
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 9 * 60 && minutes < 9 * 60 + 15;
}

export function isPostMarket(date?: Date): boolean {
  const now = getIST(date);
  const day = now.getDay();
  if (day === 0 || day === 6) return false;
  const minutes = now.getHours() * 60 + now.getMinutes();
  return minutes >= 15 * 60 + 30 && minutes < 16 * 60;
}

export function timeToClose(date?: Date): string {
  const now = getIST(date);
  if (!isMarketOpen(now)) return 'Market Closed';
  const close = new Date(now);
  close.setHours(15, 30, 0, 0);
  const diffMs = close.getTime() - now.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}h ${minutes}m`;
}

export function nextExpiry() {
  const now = getIST();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();
  const candidates: Date[] = [];
  for (let offset = 0; offset < 35; offset++) {
    const date = new Date(now);
    date.setDate(day + offset);
    if (date.getDay() === 4) {
      candidates.push(date);
      if (candidates.length === 2) break;
    }
  }
  const weekly = candidates[0]?.toISOString().slice(0, 10) ?? '';
  const monthly = candidates.length > 1 ? candidates[1]?.toISOString().slice(0, 10) : weekly;
  return { weekly, monthly };
}

export function currentExpiryCycle(): string {
  const now = getIST();
  const expiry = nextExpiry();
  if (!expiry.weekly) return 'WEEKLY';
  const weeklyDate = new Date(expiry.weekly);
  return weeklyDate.getMonth() === now.getMonth() ? 'WEEKLY' : 'MONTHLY';
}
