import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/proxy";
import { CSP_HEADER, contentSecurityPolicy } from "./lib/security-headers";

const intl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // The dashboard is English-only and authenticated: no locale prefix, Supabase session instead.
  if (request.nextUrl.pathname.startsWith("/dashboard")) return dashboard(request);
  // Onboarding intake links: no locale prefix (the invite sets the language), never indexed.
  if (request.nextUrl.pathname.startsWith("/intake/")) return intake(request);
  // Auth email links that fell back to the bare Site URL (no redirectTo): send them to the confirm route.
  const q = request.nextUrl.searchParams;
  if (q.has("token_hash") && q.has("type")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/auth/confirm";
    return NextResponse.redirect(url);
  }
  const res = intl(request);
  // The bare domain → /en is permanent (308) so search engines treat /en as the home page.
  // A visitor whose cookie or browser prefers Dutch still gets a temporary redirect to /nl.
  if (request.nextUrl.pathname === "/" && res.status === 307) {
    const to = new URL(res.headers.get("location")!, request.url);
    if (to.pathname === `/${routing.defaultLocale}`) {
      return new NextResponse(null, { status: 308, headers: res.headers });
    }
  }
  return res;
}

/**
 * The dashboard renders per request, so its scripts can carry a nonce: Next.js reads it from the
 * CSP request header and stamps it on its own scripts, and nothing else may run.
 */
async function dashboard(request: NextRequest) {
  const csp = contentSecurityPolicy(btoa(crypto.randomUUID()));
  request.headers.set(CSP_HEADER, csp);
  const res = await updateSession(request);
  res.headers.set(CSP_HEADER, csp);
  return res;
}

/** Same nonce CSP as the dashboard; the token in the URL must never leak through a Referer header. */
function intake(request: NextRequest) {
  const csp = contentSecurityPolicy(btoa(crypto.randomUUID()));
  request.headers.set(CSP_HEADER, csp);
  const res = NextResponse.next({ request });
  res.headers.set(CSP_HEADER, csp);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  // Skip Next internals, API routes and any file with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
