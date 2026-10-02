import type { Metadata, Viewport } from "next";
import { Grain } from "@/components/brand/Grain";
import { hanken, hankenItalic, jetbrains } from "@/lib/fonts";
import "@/styles/globals.css";

// Separate root layout: the dashboard is English-only, private and never indexed.
export const metadata: Metadata = {
  title: {
    default: "Leads · Presence Hospitality",
    template: "%s · Presence Hospitality",
  },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: "#0F1D25" };

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${hankenItalic.variable} ${jetbrains.variable}`}
    >
      <body data-mood="night" className="min-h-svh bg-night-900 text-paper-50">
        {children}
        <Grain />
      </body>
    </html>
  );
}
