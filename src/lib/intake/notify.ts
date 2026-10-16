import "server-only";
import { emailCard, esc, sendEmail } from "@/lib/resend";
import { formatExpiry } from "./admin";
import type { Answers } from "./answers";
import type { InviteMeta } from "./invites";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/**
 * Tells the team a client submitted the onboarding form (same address as lead notifications).
 * Test invites never notify. Never throws: the client's submit already succeeded.
 */
export async function notifyIntakeSubmitted(invite: InviteMeta, answers: Answers, progress: number, origin: string) {
  if (invite.is_test) return;
  const to = process.env.LEADS_NOTIFY_EMAIL;
  if (!to) {
    console.warn("[intake-notify] LEADS_NOTIFY_EMAIL missing; skipping");
    return;
  }
  // The identification block is required to submit, so the client's own details are the best contact.
  const name = str(answers["id.contact_name"]);
  const email = str(answers["id.email"]) || invite.contact_email || "";
  const contact = [name, email].filter(Boolean).join(" · ") || "—";
  const link = `${origin}/dashboard/onboarding/${invite.id}`;
  const rows: [string, string][] = [
    ["Property", invite.property_name],
    ["Contact", contact],
    ["Language", invite.language.toUpperCase()],
    ["Completed", `${progress}%`],
    ["Link expires", formatExpiry(invite.expires_at, "en")],
  ];
  const body = `<table style="width:100%;border-collapse:collapse;font-size:15px">${rows
    .map(([k, v]) => `<tr><td style="padding:6px 0;color:#5A5E66;width:120px">${k}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
    .join("")}</table>`;
  await sendEmail(
    {
      to,
      ...(email ? { replyTo: email } : {}),
      subject: `Onboarding form submitted: ${invite.property_name}`,
      html: emailCard({ eyebrow: "Onboarding submitted", title: invite.property_name, body, button: { href: link, label: "Open in dashboard" } }),
      text: `Onboarding form submitted\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${link}`,
    },
    "intake-notify",
  );
}
