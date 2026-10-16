import "server-only";
import { emailCard, sendEmail } from "@/lib/resend";
import { ACCESS_LINK_DAYS } from "./access-token";

// Set DASHBOARD_EMAIL_FROM (e.g. "Presence Hospitality <noreply@presence-hospitality.com>") once the
// domain is verified in Resend; until then only the Resend account owner receives these.
const FROM = process.env.DASHBOARD_EMAIL_FROM;

export const ACCESS_EMAIL_SUBJECT = "Your access to the Presence Hospitality dashboard";

export const accessEmailText = (link: string) =>
  `You've been given access to the Presence Hospitality dashboard (leads and the sales pitch).\n\n` +
  `Open this link and press Continue to choose your password:\n${link}\n\n` +
  `The link works once and expires in ${ACCESS_LINK_DAYS} days.`;

/** Emails an access link via Resend. Never throws; false when it wasn't accepted for delivery. */
export function sendAccessEmail(to: string, link: string): Promise<boolean> {
  const body = `<p style="font-size:15px;line-height:1.6;color:#3E4046;margin:0">You've been given access to the Presence Hospitality dashboard: leads and the sales pitch. Press the button, then Continue, to choose your password.</p>
    <p style="font-size:13px;color:#5A5E66;margin:24px 0 0">The link works once and expires in ${ACCESS_LINK_DAYS} days.</p>`;
  return sendEmail(
    {
      to,
      from: FROM,
      subject: ACCESS_EMAIL_SUBJECT,
      html: emailCard({ eyebrow: "Dashboard access", title: "You're invited", body, button: { href: link, label: "Open the dashboard" } }),
      text: accessEmailText(link),
    },
    "access-email",
  );
}
