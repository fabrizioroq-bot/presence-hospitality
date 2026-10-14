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
import type { PresenterNotesMap, ShellStrings } from "@/components/pitch/shell-types";
import { requireAdmin } from "@/lib/dashboard/auth";
import "@/styles/pitch.css";

// Admin-only, full-screen sales pitch (noindex via the dashboard layout). English for now; the NL
// keys exist and mirror EN until translated (PENDING.md).
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
] as const satisfies readonly (keyof ShellStrings)[];

export default async function PitchPage() {
  await requireAdmin();
  const t = await getTranslations({ locale: "en", namespace: "pitch" });
  const chapters = CHAPTERS.map((c) => ({ id: c.id, tone: c.tone, title: t(`chapters.${c.id}`) }));
  // Raw templates ("{n} / {total}"): the shell fills them on the client.
  const strings = Object.fromEntries(SHELL_KEYS.map((k) => [k, t.raw(`shell.${k}`) as string])) as ShellStrings;
  const slides = [
    <Cover key="cover" />,
    <Problem key="problem" />,
    <Solution key="solution" />,
    <HowItWorks key="how" />,
    <BehindTheScenes key="behind" />,
    <Packages key="packages" />,
    <Pricing key="pricing" />,
    <Close key="close" />,
  ];
  const notes = t.raw("notes") as PresenterNotesMap;
  return <PitchShell chapters={chapters} strings={strings} notes={notes} slides={slides} />;
}
