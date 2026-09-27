import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/proxy";

const intl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // The dashboard is English-only and authenticated: no locale prefix, Supabase session instead.
  if (request.nextUrl.pathname.startsWith("/dashboard")) return updateSession(request);
  // Auth email links that fell back to the bare Site URL (no redirectTo): send them to the confirm route.
  const q = request.nextUrl.searchParams;
  if (q.has("token_hash") && q.has("type")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/auth/confirm";
    return NextResponse.redirect(url);
  }
  return intl(request);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
