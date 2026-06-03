export class TTLCache<T = unknown> {
  private store = new Map<string, { value: T; expiresAt: number }>();

  set(key: string, value: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }

  size(): number {
    this.cleanup();
    return this.store.size;
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }
}

export const signalCache = new TTLCache<any>();
export const newsCache = new TTLCache<any>();
export const batchCache = new TTLCache<any>();

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    signalCache.cleanup();
    newsCache.cleanup();
    batchCache.cleanup();
  }, 60_000);
}
