type RateEntry = { count: number; resetAt: number };
const limits = new Map<string, RateEntry>();
const routeLimits: Record<string, { limit: number; windowSeconds: number }> = {
  '/api/signals': { limit: 10, windowSeconds: 60 },
  '/api/signals/batch': { limit: 3, windowSeconds: 60 },
  '/api/scan': { limit: 2, windowSeconds: 60 },
};

function getKey(route: string, ip: string) {
  return `${route}:${ip}`;
}

export function checkRateLimit(route: string, ip: string) {
  const config = routeLimits[route];
  if (!config) return { allowed: true };
  const key = getKey(route, ip);
  const now = Date.now();
  const entry = limits.get(key);
  if (!entry || now > entry.resetAt) {
    limits.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return { allowed: true, retryAfter: 0 };
  }
  if (entry.count >= config.limit) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  return { allowed: true, retryAfter: 0 };
}
