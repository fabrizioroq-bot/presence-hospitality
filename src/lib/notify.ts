import "server-only";
import type { LeadInput } from "@/lib/leads/validate";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Emails the team about a new lead via Resend. Never throws: a failed notification must not
 * fail the guest's request (the lead is already safely stored).
 */
export async function notifyNewLead(lead: LeadInput & { id: string }) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!key || !to) {
    console.warn("[notify] RESEND_API_KEY or LEADS_NOTIFY_EMAIL missing; skipping lead email");
    return;
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const link = `${site}/dashboard/leads/${lead.id}`;
  const rows: [string, string][] = [
    ["Name", `${lead.first_name} ${lead.last_name}`],
    ["Hotel", lead.hotel_name],
    ["Position", lead.position.replace(/_/g, " ")],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["PMS", lead.pms ?? "—"],
    ["Language", lead.language.toUpperCase()],
  ];
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;background:#D3DAE1;padding:32px 16px;color:#1D1F23">
  <div style="max-width:560px;margin:0 auto;background:#F2F5F8;border:1px solid #636870;border-radius:28px;padding:32px">
    <p style="font:500 12px monospace;letter-spacing:.14em;text-transform:uppercase;color:#5A5E66;margin:0 0 16px">New demo request</p>
    <h1 style="font-size:24px;letter-spacing:-.02em;margin:0 0 20px">${esc(lead.hotel_name)}</h1>
    <table style="width:100%;border-collapse:collapse;font-size:15px">${rows
      .map(([k, v]) => `<tr><td style="padding:6px 0;color:#5A5E66;width:110px">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
      .join("")}</table>
    <p style="font-size:15px;line-height:1.6;color:#3E4046;white-space:pre-wrap;border-top:1px solid #C5CAD1;margin:20px 0 0;padding-top:16px">${esc(lead.description)}</p>
    <a href="${link}" style="display:inline-block;margin-top:24px;background:#1D1F23;color:#F4F6F8;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">Open in dashboard →</a>
  </div></div>`;
  const text = `New demo request\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${lead.description}\n\n${link}`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // Until presence-hospitality.com is verified in Resend, LEADS_NOTIFY_FROM overrides this with
        // Resend's test sender (see PENDING.md).
        from: process.env.LEADS_NOTIFY_FROM ?? "Presence Hospitality <noreply@presence-hospitality.com>",
        to: [to],
        reply_to: lead.email,
        subject: `New demo request: ${lead.hotel_name} (${lead.first_name} ${lead.last_name})`,
        html,
        text,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) console.error("[notify] Resend responded", res.status, (await res.text()).slice(0, 300));
  } catch (e) {
    console.error("[notify] Resend request failed", e instanceof Error ? e.message : e);
  }
}
