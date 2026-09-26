import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

// Invite and password-reset emails link here with a one-time token hash.
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const tokenHash = sp.get("token_hash");
  const type = sp.get("type") as EmailOtpType | null;
  const target = request.nextUrl.clone();
  target.search = "";
  if (tokenHash && (type === "invite" || type === "recovery")) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      target.pathname = "/dashboard/set-password";
      return NextResponse.redirect(target);
    }
  }
  target.pathname = "/dashboard/login";
  target.searchParams.set("error", "link");
  return NextResponse.redirect(target);
}
