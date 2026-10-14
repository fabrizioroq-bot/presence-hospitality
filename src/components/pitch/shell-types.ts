import type { ChapterId, Tone } from "./chapters";

/** Props shared by the shell and its controls (kept apart from PitchShell to avoid circular imports). */
export type ChapterMeta = { id: ChapterId; title: string; tone: Tone };
export type ShellStrings = {
  label: string;
  chapterOf: string;
  counter: string;
  progress: string;
  rail: string;
  goTo: string;
  next: string;
  prev: string;
  fullscreen: string;
  exitFullscreen: string;
  fullscreenUnavailable: string;
  overview: string;
  closeOverview: string;
  overviewTitle: string;
  blank: string;
  help: string;
  offlineReady: string;
  startHint: string;
};

/** Fills "{n} of {total}"-style templates from messages. */
export const fmt = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
