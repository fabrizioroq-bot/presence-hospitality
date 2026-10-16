import "server-only";
import type { LeadInput } from "@/lib/leads/validate";
import { emailCard, esc, sendEmail } from "@/lib/resend";

/**
 * Emails the team about a new lead via Resend. Never throws: a failed notification must not
 * fail the guest's request (the lead is already safely stored).
 */
export async function notifyNewLead(lead: LeadInput & { id: string }, origin: string) {
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!to) {
    console.warn("[notify] LEADS_NOTIFY_EMAIL missing; skipping lead email");
    return;
  }
  const link = `${origin}/dashboard/leads/${lead.id}`;
  const rows: [string, string][] = [
    ["Name", `${lead.first_name} ${lead.last_name}`],
    ["Hotel", lead.hotel_name],
    ["Position", lead.position.replace(/_/g, " ")],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["PMS", lead.pms ?? "—"],
    ["Language", lead.language.toUpperCase()],
  ];
  const body = `<table style="width:100%;border-collapse:collapse;font-size:15px">${rows
    .map(([k, v]) => `<tr><td style="padding:6px 0;color:#5A5E66;width:110px">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
    .join("")}</table>
    <p style="font-size:15px;line-height:1.6;color:#3E4046;white-space:pre-wrap;border-top:1px solid #C5CAD1;margin:20px 0 0;padding-top:16px">${esc(lead.description)}</p>`;
  await sendEmail(
    {
      to,
      replyTo: lead.email,
      subject: `New demo request: ${lead.hotel_name} (${lead.first_name} ${lead.last_name})`,
      html: emailCard({ eyebrow: "New demo request", title: lead.hotel_name, body, button: { href: link, label: "Open in dashboard" } }),
      text: `New demo request\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${lead.description}\n\n${link}`,
    },
    "notify",
  );
}
