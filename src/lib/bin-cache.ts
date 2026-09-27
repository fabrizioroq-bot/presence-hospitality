/**
 * One shared download per point-cloud file: the preloader and the WebGL scenes ask for the same
 * promise, so a file that is still downloading is never fetched twice (the HTTP cache alone can't
 * dedupe in-flight requests).
 */
const cache = new Map<string, Promise<ArrayBuffer>>();

export function fetchBin(url: string, priority: "low" | "auto" = "auto"): Promise<ArrayBuffer> {
  let p = cache.get(url);
  if (!p) {
    p = fetch(url, { priority } as RequestInit).then((r) => {
      if (!r.ok) throw new Error(`${url}: ${r.status}`);
      return r.arrayBuffer();
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}
