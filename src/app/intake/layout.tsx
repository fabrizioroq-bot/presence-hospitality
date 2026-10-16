import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { Grain } from "@/components/brand/Grain";
import { LogoSymbols } from "@/components/brand/Logo";
import { hanken, hankenItalic, jetbrains } from "@/lib/fonts";
import "@/styles/globals.css";
import "@/styles/intake.css";

// Separate root layout: the onboarding intake is reached only through a private link (light mood,
// never indexed, no site chrome, analytics or intro animation). <html lang> is set per page section
// below, because the language comes from the invite.
export const metadata: Metadata = {
  title: { default: "Client onboarding · Presence Hospitality", template: "%s · Presence Hospitality" },
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export const viewport: Viewport = { themeColor: "#F6F2EC", width: "device-width", initialScale: 1 };

export default async function IntakeLayout({ children }: { children: React.ReactNode }) {
  // Render per request: the proxy's CSP nonce only reaches dynamic pages.
  await connection();
  return (
    <html lang="en" className={`${hanken.variable} ${hankenItalic.variable} ${jetbrains.variable}`}>
      <body data-mood="mist" className="min-h-svh bg-(--ph-bg-page) text-(--ph-text-primary)">
        <LogoSymbols />
        {children}
        <Grain />
      </body>
    </html>
  );
}
