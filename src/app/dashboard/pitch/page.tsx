import { getTranslations } from "next-intl/server";
import { BehindTheScenes } from "@/components/pitch/chapters/BehindTheScenes";
import { Close } from "@/components/pitch/chapters/Close";
import { Cover } from "@/components/pitch/chapters/Cover";
import { HowItWorks } from "@/components/pitch/chapters/HowItWorks";
import { Packages } from "@/components/pitch/chapters/Packages";
import { Pricing } from "@/components/pitch/chapters/Pricing";
import { Problem } from "@/components/pitch/chapters/Problem";
import { Solution } from "@/components/pitch/chapters/Solution";
import { CHAPTERS } from "@/components/pitch/chapters";
import { PitchShell } from "@/components/pitch/PitchShell";
import type { PresenterGuide, PresenterNotesMap, ShellStrings } from "@/components/pitch/shell-types";
import type { Locale } from "@/i18n/routing";
import { requireAdmin } from "@/lib/dashboard/auth";
import "@/styles/pitch.css";

// Admin-only, full-screen sales pitch (noindex via the dashboard layout). English by default;
// ?lang=nl (the L key) renders the Dutch draft (PENDING.md: needs native review).
export const metadata = { title: "Pitch" };

const SHELL_KEYS = [
  "label",
  "chapterOf",
  "counter",
  "progress",
  "rail",
  "goTo",
  "next",
  "prev",
  "fullscreen",
  "exitFullscreen",
  "fullscreenUnavailable",
  "overview",
  "closeOverview",
  "overviewTitle",
  "blank",
  "help",
  "offlineReady",
  "startHint",
  "notes",
  "notesToggle",
  "language",
] as const satisfies readonly (keyof ShellStrings)[];

export default async function PitchPage({ searchParams }: PageProps<"/dashboard/pitch">) {
  await requireAdmin();
  const locale: Locale = (await searchParams).lang === "nl" ? "nl" : "en";
  const t = await getTranslations({ locale, namespace: "pitch" });
  const chapters = CHAPTERS.map((c) => ({ id: c.id, tone: c.tone, title: t(`chapters.${c.id}`) }));
  // Raw templates ("{n} / {total}"): the shell fills them on the client.
  const strings = Object.fromEntries(SHELL_KEYS.map((k) => [k, t.raw(`shell.${k}`) as string])) as ShellStrings;
  const slides = [
    <Cover key="cover" locale={locale} />,
    <Problem key="problem" locale={locale} />,
    <Solution key="solution" locale={locale} />,
    <HowItWorks key="how" locale={locale} />,
    <BehindTheScenes key="behind" locale={locale} />,
    <Packages key="packages" locale={locale} />,
    <Pricing key="pricing" locale={locale} />,
    <Close key="close" locale={locale} />,
  ];
  const notes = t.raw("notes") as PresenterNotesMap;
  const guide = t.raw("guide") as PresenterGuide;
  return <PitchShell locale={locale} chapters={chapters} strings={strings} notes={notes} guide={guide} slides={slides} />;
}
