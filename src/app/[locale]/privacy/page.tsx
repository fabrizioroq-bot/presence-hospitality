import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageShell } from "@/components/layout/PageShell";
import { LegalPage } from "@/components/sections/LegalPage";
import { pageMeta } from "@/lib/seo";
import { legal } from "@/content/legal";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  const doc = legal[locale === "nl" ? "nl" : "en"].privacy;
  return pageMeta(locale === "nl" ? "nl" : "en", "/privacy", `${doc.title} · Presence Hospitality`, doc.description);
}

export default async function Page({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const l = locale === "nl" ? "nl" : "en";
  return (
    <PageShell page="/privacy">
      <LegalPage doc={legal[l].privacy} locale={l} />
    </PageShell>
  );
}
