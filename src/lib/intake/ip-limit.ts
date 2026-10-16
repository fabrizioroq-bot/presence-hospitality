// Best-effort per-IP rate limit for the public /api/intake endpoint, checked before any database
// lookup. Free (no Vercel Firewall usage): counters live in the function instance's memory, so a flood
// spread over many instances or IPs isn't stopped; the per-token limit in the database still applies.
// No dependencies (scripts/check-ip-limit.ts tests it with a fake clock).

export type RateLimiter = (key: string) => { isAllowed: boolean; retryAfterS: number };

type Window = { start: number; count: number };

/** Fixed window: at most `limit` requests per `windowMs` per key. Keeps at most `maxKeys` keys. */
export function createRateLimiter({
  limit,
  windowMs,
  maxKeys = 10_000,
  now = Date.now,
}: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
  now?: () => number;
}): RateLimiter {
  const windows = new Map<string, Window>();

  const makeRoom = (t: number) => {
    for (const [k, w] of windows) if (t - w.start >= windowMs) windows.delete(k);
    // Still full (many IPs inside one window): drop the oldest entry rather than grow without bound.
    if (windows.size >= maxKeys) windows.delete(windows.keys().next().value as string);
  };

  return (key) => {
    const t = now();
    const current = windows.get(key);
    if (!current || t - current.start >= windowMs) {
      if (!current && windows.size >= maxKeys) makeRoom(t);
      windows.set(key, { start: t, count: 1 });
      return { isAllowed: true, retryAfterS: 0 };
    }
    if (current.count >= limit) {
      return { isAllowed: false, retryAfterS: Math.max(1, Math.ceil((current.start + windowMs - t) / 1000)) };
    }
    windows.set(key, { start: current.start, count: current.count + 1 });
    return { isAllowed: true, retryAfterS: 0 };
  };
}

/** The caller's IP as Vercel reports it (Vercel sets these headers itself; clients can't override them there). */
export function clientIp(headers: Headers): string {
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
