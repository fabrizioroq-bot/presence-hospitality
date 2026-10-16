import "server-only";
import { emailCard, esc, sendEmail } from "@/lib/resend";
import type { InviteMeta } from "./invites";

/**
 * Tells the team a client submitted the onboarding form (same address as lead notifications).
 * Test invites never notify. Never throws: the client's submit already succeeded.
 */
export async function notifyIntakeSubmitted(invite: InviteMeta, progress: number, origin: string) {
  if (invite.is_test) return;
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!to) {
    console.warn("[intake-notify] LEADS_NOTIFY_EMAIL missing; skipping");
    return;
  }
  const link = `${origin}/dashboard/onboarding/${invite.id}`;
  const rows: [string, string][] = [
    ["Property", invite.property_name],
    ["Contact", invite.contact_email ?? "—"],
    ["Language", invite.language.toUpperCase()],
    ["Completed", `${progress}%`],
  ];
  const body = `<table style="width:100%;border-collapse:collapse;font-size:15px">${rows
    .map(([k, v]) => `<tr><td style="padding:6px 0;color:#5A5E66;width:110px">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
    .join("")}</table>`;
  await sendEmail(
    {
      to,
      ...(invite.contact_email ? { replyTo: invite.contact_email } : {}),
      subject: `Onboarding form submitted: ${invite.property_name}`,
      html: emailCard({ eyebrow: "Onboarding submitted", title: invite.property_name, body, button: { href: link, label: "Open in dashboard" } }),
      text: `Onboarding form submitted\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${link}`,
    },
    "intake-notify",
  );
}
