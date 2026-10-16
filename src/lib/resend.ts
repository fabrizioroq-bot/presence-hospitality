import "server-only";

/**
 * One Resend call for every email the site sends (lead notifications, dashboard access links,
 * submitted onboarding forms). Never throws: callers decide what a failed send means.
 */

// Permanent sender (client decision 27-09): Resend's shared address, which delivers only to the
// Resend account owner. DASHBOARD_EMAIL_FROM switches it once presence-hospitality.com is verified.
export const DEFAULT_FROM = "Presence Hospitality <onboarding@resend.dev>";
const TIMEOUT_MS = 6000;

export type Email = { to: string; subject: string; html: string; text: string; from?: string; replyTo?: string };

export const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendEmail(email: Email, tag: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[${tag}] RESEND_API_KEY missing; not sending`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: email.from ?? DEFAULT_FROM,
        to: [email.to],
        ...(email.replyTo ? { reply_to: email.replyTo } : {}),
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return true;
    console.error(`[${tag}] Resend responded`, res.status, (await res.text()).slice(0, 300));
  } catch (e) {
    console.error(`[${tag}] Resend request failed`, e instanceof Error ? e.message : e);
  }
  return false;
}

/** The card layout shared by the emails (inline styles: email clients ignore stylesheets). `body` is trusted HTML. */
export function emailCard({ eyebrow, title, body, button }: { eyebrow: string; title: string; body: string; button?: { href: string; label: string } }) {
  return `<div style="font-family:Helvetica,Arial,sans-serif;background:#D3DAE1;padding:32px 16px;color:#1D1F23">
  <div style="max-width:560px;margin:0 auto;background:#F2F5F8;border:1px solid #636870;border-radius:28px;padding:32px">
    <p style="font:500 12px monospace;letter-spacing:.14em;text-transform:uppercase;color:#5A5E66;margin:0 0 16px">${esc(eyebrow)}</p>
    <h1 style="font-size:24px;letter-spacing:-.02em;margin:0 0 20px">${esc(title)}</h1>
    ${body}
    ${button ? `<a href="${esc(button.href)}" style="display:inline-block;margin-top:24px;background:#1D1F23;color:#F4F6F8;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">${esc(button.label)} →</a>` : ""}
  </div></div>`;
}
