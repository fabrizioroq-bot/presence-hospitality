/* Unit test for the /api/intake per-IP limit (src/lib/intake/ip-limit.ts), with a fake clock. */
import { clientIp, createRateLimiter } from "../src/lib/intake/ip-limit";

let t = 0;
const failures: string[] = [];
const expect = (label: string, cond: boolean) => cond || failures.push(label);

const limit = createRateLimiter({ limit: 120, windowMs: 60_000, maxKeys: 3, now: () => t });
const allowed = Array.from({ length: 125 }, () => limit("1.1.1.1").isAllowed);
expect("first 120 requests in a minute pass", allowed.slice(0, 120).every(Boolean));
expect("requests 121+ are refused", allowed.slice(120).every((a) => !a));
t = 45_000;
expect("refusal says when to retry (15 s left)", limit("1.1.1.1").retryAfterS === 15);
expect("another IP is not affected", limit("2.2.2.2").isAllowed);
t = 60_000;
expect("a new window allows again", limit("1.1.1.1").isAllowed);

// Bounded memory: with maxKeys = 3, a fourth IP inside the same window evicts the oldest one.
t = 200_000;
["a", "b", "c", "d"].forEach((ip) => limit(ip));
expect("memory stays bounded", ["b", "c", "d"].every((ip) => limit(ip).isAllowed));

const h = (o: Record<string, string>) => new Headers(o);
expect("x-real-ip wins", clientIp(h({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "8.8.8.8" })) === "9.9.9.9");
expect("first x-forwarded-for entry", clientIp(h({ "x-forwarded-for": "8.8.8.8, 10.0.0.1" })) === "8.8.8.8");
expect("no headers → one shared bucket", clientIp(h({})) === "unknown");

if (failures.length) {
  console.error("ip-limit FAILED:\n  " + failures.join("\n  "));
  process.exit(1);
}
console.log("ip-limit OK — 120/min per IP, retry-after, separate IPs, new window, bounded memory, IP headers.");
