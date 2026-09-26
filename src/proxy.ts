import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/proxy";

const intl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  // The dashboard is English-only and authenticated: no locale prefix, Supabase session instead.
  if (request.nextUrl.pathname.startsWith("/dashboard")) return updateSession(request);
  return intl(request);
}

export const config = {
  // Skip Next internals, API routes and any file with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
