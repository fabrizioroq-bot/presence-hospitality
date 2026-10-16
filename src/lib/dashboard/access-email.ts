import "server-only";
import { esc } from "@/lib/notify";
import { ACCESS_LINK_DAYS } from "./access-token";

// Resend's shared sender only delivers to the Resend account owner. Once presence-hospitality.com is
// verified in Resend, set DASHBOARD_EMAIL_FROM (e.g. "Presence Hospitality <noreply@presence-hospitality.com>").
const FROM = process.env.DASHBOARD_EMAIL_FROM ?? "Presence Hospitality <onboarding@resend.dev>";
const TIMEOUT_MS = 6000;

export const ACCESS_EMAIL_SUBJECT = "Your access to the Presence Hospitality dashboard";

export const accessEmailText = (link: string) =>
  `You've been given access to the Presence Hospitality dashboard (leads and the sales pitch).\n\n` +
  `Open this link and press Continue to choose your password:\n${link}\n\n` +
  `The link works once and expires in ${ACCESS_LINK_DAYS} days.`;

/** Emails an access link via Resend. Never throws; false when it wasn't accepted for delivery. */
export async function sendAccessEmail(to: string, link: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn("[access-email] RESEND_API_KEY missing; not sending");
    return false;
  }
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;background:#D3DAE1;padding:32px 16px;color:#1D1F23">
  <div style="max-width:560px;margin:0 auto;background:#F2F5F8;border:1px solid #636870;border-radius:28px;padding:32px">
    <p style="font:500 12px monospace;letter-spacing:.14em;text-transform:uppercase;color:#5A5E66;margin:0 0 16px">Dashboard access</p>
    <h1 style="font-size:24px;letter-spacing:-.02em;margin:0 0 16px">You're invited</h1>
    <p style="font-size:15px;line-height:1.6;color:#3E4046;margin:0">You've been given access to the Presence Hospitality dashboard: leads and the sales pitch. Press the button, then Continue, to choose your password.</p>
    <a href="${esc(link)}" style="display:inline-block;margin-top:24px;background:#1D1F23;color:#F4F6F8;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">Open the dashboard →</a>
    <p style="font-size:13px;color:#5A5E66;margin:24px 0 0">The link works once and expires in ${ACCESS_LINK_DAYS} days.</p>
  </div></div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [to], subject: ACCESS_EMAIL_SUBJECT, html, text: accessEmailText(link) }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return true;
    console.error("[access-email] Resend responded", res.status, (await res.text()).slice(0, 300));
  } catch (e) {
    console.error("[access-email] Resend request failed", e instanceof Error ? e.message : e);
  }
  return false;
}
