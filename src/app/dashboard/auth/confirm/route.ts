import { NextResponse, type NextRequest } from "next/server";

// Invite and password-reset emails link here with a one-time token hash. Opening a link must not use
// it up (WhatsApp and mail scanners open links for previews), so this only forwards to the "Continue"
// page; the token is verified when the person clicks there (acceptLink in ../../actions.ts).
export function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const tokenHash = sp.get("token_hash");
  const type = sp.get("type");
  const target = request.nextUrl.clone();
  target.search = "";
  if (tokenHash && (type === "invite" || type === "recovery")) {
    target.pathname = "/dashboard/auth/accept";
    target.searchParams.set("token_hash", tokenHash);
    target.searchParams.set("type", type);
    return NextResponse.redirect(target);
  }
  target.pathname = "/dashboard/login";
  target.searchParams.set("error", "link");
  return NextResponse.redirect(target);
}
