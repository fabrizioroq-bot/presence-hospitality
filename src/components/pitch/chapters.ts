/**
 * The pitch's chapter registry and pure navigation helpers (shared by the server page, the shell and
 * the WebGL stage). A position is a chapter index plus a build step inside it.
 */
export const CHAPTERS = [
  { id: "cover", hash: "cover", tone: "light", steps: 2 },
  { id: "problem", hash: "problem", tone: "dark", steps: 1 },
  { id: "solution", hash: "solution", tone: "light", steps: 1 },
  { id: "how", hash: "how-it-works", tone: "light", steps: 1 },
  { id: "behind", hash: "behind-the-scenes", tone: "light", steps: 1 },
  { id: "packages", hash: "packages", tone: "dark", steps: 1 },
  { id: "pricing", hash: "pricing", tone: "light", steps: 1 },
  { id: "close", hash: "close", tone: "light", steps: 1 },
] as const;

export type ChapterId = (typeof CHAPTERS)[number]["id"];
export type Tone = "light" | "dark";
export type Position = { chapter: number; step: number };

export const LAST = CHAPTERS.length - 1;
export const TOTAL_STEPS = CHAPTERS.reduce((n, c) => n + c.steps, 0);

const lastStep = (chapter: number) => CHAPTERS[chapter].steps - 1;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function next({ chapter, step }: Position): Position {
  if (step < lastStep(chapter)) return { chapter, step: step + 1 };
  return chapter < LAST ? { chapter: chapter + 1, step: 0 } : { chapter, step };
}

/** Back from a chapter's first build lands on the previous chapter's final state. */
export function prev({ chapter, step }: Position): Position {
  if (step > 0) return { chapter, step: step - 1 };
  return chapter > 0 ? { chapter: chapter - 1, step: lastStep(chapter - 1) } : { chapter, step };
}

/** 0-based index of a position across all builds of all chapters (for the progress bar). */
export function globalStep({ chapter, step }: Position): number {
  return CHAPTERS.slice(0, chapter).reduce((n, c) => n + c.steps, 0) + step;
}

/** "#problem" for a chapter's first build, "#problem/2" for its second. */
export function toHash({ chapter, step }: Position): string {
  const base = `#${CHAPTERS[chapter].hash}`;
  return step > 0 ? `${base}/${step + 1}` : base;
}

export function fromHash(hash: string): Position | null {
  const [name, build] = hash.replace(/^#/, "").split("/");
  const chapter = CHAPTERS.findIndex((c) => c.hash === name);
  if (chapter < 0) return null;
  const step = build ? clamp(parseInt(build, 10) - 1 || 0, 0, lastStep(chapter)) : 0;
  return { chapter, step };
}

/** Steps a chapter shows, as the space-separated list its builds match ([data-reached~="1"]). */
export function reachedSteps(chapter: number, current: Position): string {
  if (chapter > current.chapter) return "";
  const upTo = chapter < current.chapter ? lastStep(chapter) : current.step;
  return Array.from({ length: upTo + 1 }, (_, i) => i).join(" ");
}
