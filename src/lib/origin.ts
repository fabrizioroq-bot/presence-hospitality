import "server-only";
import { headers } from "next/headers";

/**
 * Origin of the current request (e.g. https://presence-hospitality.com or the vercel.app URL), so
 * links in emails point at the host the person actually used. Supabase still checks auth redirect
 * URLs against its allow-list; Vercel only routes requests for this project's own domains.
 */
export async function requestOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
}
