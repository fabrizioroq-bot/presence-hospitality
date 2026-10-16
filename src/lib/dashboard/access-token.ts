import { createHmac, timingSafeEqual } from "node:crypto";

/** How long an emailed dashboard access link stays valid. */
export const ACCESS_LINK_DAYS = 7;
const DAY_S = 86_400;
const SCOPE = "dashboard-access-link:v1";

/**
 * Who the link is for, plus a nonce also stored on the account (app_metadata.access_nonce). The nonce
 * is cleared when the link is used and replaced when a new link is made, so each link works once and
 * only the newest one works.
 */
export type AccessClaims = { userId: string; nonce: string };
type Payload = { u: string; n: string; x: number };

/** Shape check before anything is parsed: base64url payload "." base64url signature. */
export const ACCESS_TOKEN_FORMAT = /^[A-Za-z0-9_-]{20,400}\.[A-Za-z0-9_-]{43}$/;

const mac = (secret: string, body: string) =>
  createHmac("sha256", secret).update(`${SCOPE}.${body}`).digest("base64url");

export function signAccessToken(claims: AccessClaims, secret: string, nowMs = Date.now()) {
  const payload: Payload = {
    u: claims.userId,
    n: claims.nonce,
    x: Math.floor(nowMs / 1000) + ACCESS_LINK_DAYS * DAY_S,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${mac(secret, body)}`;
}

/** The claims of a genuine, unexpired token; null for anything else. */
export function verifyAccessToken(token: string, secret: string, nowMs = Date.now()): AccessClaims | null {
  if (!ACCESS_TOKEN_FORMAT.test(token)) return null;
  const [body, sig] = token.split(".");
  const expected = Buffer.from(mac(secret, body));
  const given = Buffer.from(sig);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Partial<Payload>;
    if (typeof p.u !== "string" || typeof p.n !== "string" || typeof p.x !== "number") return null;
    if (p.x * 1000 <= nowMs) return null;
    return { userId: p.u, nonce: p.n };
  } catch {
    return null;
  }
}
